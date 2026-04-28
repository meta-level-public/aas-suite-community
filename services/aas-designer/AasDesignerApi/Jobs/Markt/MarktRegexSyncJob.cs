using System.Text.RegularExpressions;
using AasDesignerApi.Model;
using AasDesignerModel;
using AasDesignerModel.Model;
using Microsoft.EntityFrameworkCore;

namespace AasDesignerApi.Jobs.Markt;

/// <summary>
/// Periodischer Hintergrundjob, der konfigurierte Regex-Freigaberegeln auswertet und
/// Markt-Listings automatisch publiziert oder zurückzieht.
/// </summary>
public sealed class MarktRegexSyncJob : IHostedService, IDisposable
{
    private readonly ILogger<MarktRegexSyncJob> _logger;
    private readonly IServiceProvider _provider;
    private readonly IConfiguration _configuration;
    private readonly SemaphoreSlim _lock = new(1, 1);
    private CancellationTokenSource? _cts;

    // Wie oft der Loop prüft ob ein Sync-Lauf fällig ist (unabhängig vom konfigurierten Intervall)
    private static readonly TimeSpan TickInterval = TimeSpan.FromMinutes(1);

    private static readonly RegistryDescriptorSource RegistrySource = new();
    private static readonly RepositoryShellSource RepositorySource = new();

    public MarktRegexSyncJob(
        ILogger<MarktRegexSyncJob> logger,
        IServiceProvider provider,
        IConfiguration configuration
    )
    {
        _logger = logger;
        _provider = provider;
        _configuration = configuration;
    }

    public Task StartAsync(CancellationToken stoppingToken)
    {
        _cts = CancellationTokenSource.CreateLinkedTokenSource(stoppingToken);
        _ = Task.Run(() => RunLoopAsync(_cts.Token), _cts.Token);
        return Task.CompletedTask;
    }

    private async Task RunLoopAsync(CancellationToken cancellationToken)
    {
        // Kurze initiale Verzögerung damit die DB beim Hochfahren bereit ist
        await Task.Delay(TimeSpan.FromMinutes(1), cancellationToken).ConfigureAwait(false);

        DateTimeOffset lastRun = DateTimeOffset.MinValue;

        using var timer = new PeriodicTimer(TickInterval);

        while (!cancellationToken.IsCancellationRequested)
        {
            try
            {
                // Einstellungen bei jedem Tick neu aus DB lesen
                MarktRegexSyncSettingsDto settings;
                try
                {
                    using var scope = _provider.CreateScope();
                    var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();
                    settings = await MarktRegexSyncSettingsStore.LoadAsync(db, cancellationToken);
                }
                catch
                {
                    var fallbackMinutes = _configuration.GetValue<int>(
                        "MarktRegexSync:IntervalMinutes",
                        15
                    );
                    settings = new MarktRegexSyncSettingsDto(fallbackMinutes, true);
                }

                if (
                    settings.IsEnabled
                    && DateTimeOffset.UtcNow - lastRun
                        >= TimeSpan.FromMinutes(settings.IntervalMinutes)
                )
                {
                    if (_lock.Wait(0))
                    {
                        lastRun = DateTimeOffset.UtcNow;
                        _ = Task.Run(
                            async () =>
                            {
                                try
                                {
                                    await RunSyncAsync(cancellationToken);
                                }
                                catch (Exception ex)
                                {
                                    _logger.LogError(
                                        ex,
                                        "MarktRegexSyncJob: unbehandelter Fehler im Sync-Lauf."
                                    );
                                }
                                finally
                                {
                                    _lock.Release();
                                }
                            },
                            cancellationToken
                        );
                    }
                    else
                    {
                        _logger.LogDebug(
                            "MarktRegexSyncJob: vorheriger Lauf läuft noch, überspringe."
                        );
                    }
                }
            }
            catch (OperationCanceledException)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "MarktRegexSyncJob: Fehler im Tick-Loop.");
            }

            await timer.WaitForNextTickAsync(cancellationToken).ConfigureAwait(false);
        }
    }

    public Task StopAsync(CancellationToken stoppingToken)
    {
        _cts?.Cancel();
        return Task.CompletedTask;
    }

    public void Dispose()
    {
        _cts?.Dispose();
        _lock.Dispose();
    }

    private async Task RunSyncAsync(CancellationToken cancellationToken)
    {
        using var scope = _provider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();

        var activeRules = await db
            .MarktRegexFreigaben.Where(r => r.IsActive)
            .ToListAsync(cancellationToken);

        if (activeRules.Count == 0)
            return;

        _logger.LogInformation(
            "MarktRegexSyncJob: {Count} aktive Regel(n) werden verarbeitet.",
            activeRules.Count
        );

        foreach (var rule in activeRules)
        {
            await ProcessRuleAsync(rule, db, cancellationToken);
        }
    }

    private async Task ProcessRuleAsync(
        MarktRegexFreigabe rule,
        IApplicationDbContext db,
        CancellationToken cancellationToken
    )
    {
        var runStart = DateTimeOffset.UtcNow;
        try
        {
            // Regex vorab kompilieren und auf ReDoS-Robustheit prüfen
            Regex regex;
            try
            {
                regex = new Regex(
                    rule.RegexPattern,
                    RegexOptions.None,
                    TimeSpan.FromMilliseconds(500)
                );
            }
            catch (Exception ex)
            {
                _logger.LogWarning(
                    "MarktRegexSyncJob: Regel {RuleId} hat ungültiges Regex-Pattern: {Ex}",
                    rule.Id,
                    ex.Message
                );
                rule.LastRunAt = runStart;
                rule.LastRunResult =
                    $"InvalidPattern:{ex.Message[..Math.Min(200, ex.Message.Length)]}";
                await db.SaveChangesAsync(cancellationToken);
                return;
            }

            // Infrastruktur laden
            var infra = await db
                .AasInfrastructureSettings.AsNoTracking()
                .FirstOrDefaultAsync(i => i.Id == rule.AasInfrastrukturId, cancellationToken);

            if (infra is null)
            {
                _logger.LogWarning(
                    "MarktRegexSyncJob: Regel {RuleId}: Infrastruktur {InfraId} nicht gefunden.",
                    rule.Id,
                    rule.AasInfrastrukturId
                );
                rule.LastRunAt = runStart;
                rule.LastRunResult = "InfraNotFound";
                await db.SaveChangesAsync(cancellationToken);
                return;
            }

            // Endpoint-Strategie ermitteln
            var (source, strategyLabel) = await SelectSourceAsync(infra, cancellationToken);
            if (source is null)
            {
                rule.LastRunAt = runStart;
                rule.LastRunResult = "NoEndpointAvailable";
                await db.SaveChangesAsync(cancellationToken);
                return;
            }

            // AAS-Infrastruktur scannen
            using var httpClient = CreateHttpClient(infra);
            var matchedShellIds = new HashSet<string>(StringComparer.Ordinal);
            var matchedEntries = new Dictionary<string, ShellScanEntry>(StringComparer.Ordinal);

            await foreach (var entry in source.ScanAsync(infra, httpClient, cancellationToken))
            {
                if (MatchesRule(rule, regex, entry))
                {
                    matchedShellIds.Add(entry.ShellId);
                    matchedEntries[entry.ShellId] = entry;
                }
            }

            // Bestehende Auto-Listings dieser Regel laden (inkl. Navigation-Properties für Update)
            var existingAutoListings = await db
                .MarktListings.Include(l => l.Submodels)
                .Include(l => l.SpecificAssetIds)
                .Where(l => l.AutoManagedByRuleId == rule.Id)
                .ToListAsync(cancellationToken);

            var existingAutoShellIds = existingAutoListings
                .Select(l => l.SourceShellId)
                .ToHashSet(StringComparer.Ordinal);

            // Organisationsname einmalig laden
            var organizationName =
                await db
                    .Organisations.AsNoTracking()
                    .Where(o => o.Id == rule.OrganisationId)
                    .Select(o => o.Name)
                    .FirstOrDefaultAsync(cancellationToken)
                ?? string.Empty;

            // Repository-Basis-URL für Thumbnail-Abruf
            var repositoryBaseUrl = infra.AasRepositoryUrl?.TrimEnd('/');

            // Diff: neu publizieren
            var toAdd = matchedShellIds.Except(existingAutoShellIds).ToList();
            // Diff: zurückziehen (nur auto-managed)
            var toRemove = existingAutoListings
                .Where(l => !matchedShellIds.Contains(l.SourceShellId))
                .ToList();

            foreach (var shellId in toAdd)
            {
                var entry = matchedEntries[shellId];
                byte[]? thumbnailData = null;
                string? thumbnailContentType = null;
                if (repositoryBaseUrl is not null)
                {
                    (thumbnailData, thumbnailContentType) = await FetchThumbnailAsync(
                        httpClient,
                        repositoryBaseUrl,
                        entry.ShellId,
                        cancellationToken
                    );
                }
                var listing = BuildAutoListing(
                    rule,
                    entry,
                    organizationName,
                    thumbnailData,
                    thumbnailContentType
                );
                db.MarktListings.Add(listing);
            }

            // Bestehende Auto-Listings aktualisieren
            var toUpdate = existingAutoListings
                .Where(l => matchedShellIds.Contains(l.SourceShellId))
                .ToList();
            foreach (var listing in toUpdate)
            {
                var entry = matchedEntries[listing.SourceShellId];
                var changed = false;

                // Metadaten aktualisieren
                var newTitle = (
                    entry.DisplayNameDe ?? entry.DisplayNameEn ?? entry.IdShort ?? entry.ShellId
                )[
                    ..Math.Min(
                        (
                            entry.DisplayNameDe
                            ?? entry.DisplayNameEn
                            ?? entry.IdShort
                            ?? entry.ShellId
                        ).Length,
                        256
                    )
                ];
                if (!string.Equals(listing.Title, newTitle, StringComparison.Ordinal))
                {
                    listing.Title = newTitle;
                    changed = true;
                }

                var newSummary = (entry.DescriptionDe ?? entry.DescriptionEn ?? string.Empty)[
                    ..Math.Min(
                        (entry.DescriptionDe ?? entry.DescriptionEn ?? string.Empty).Length,
                        2048
                    )
                ];
                if (!string.Equals(listing.Summary, newSummary, StringComparison.Ordinal))
                {
                    listing.Summary = newSummary;
                    changed = true;
                }

                if (string.IsNullOrWhiteSpace(listing.OrganizationName))
                {
                    listing.OrganizationName = organizationName[
                        ..Math.Min(organizationName.Length, 256)
                    ];
                    changed = true;
                }

                if (string.IsNullOrWhiteSpace(listing.AssetKind) && entry.AssetKind is not null)
                {
                    listing.AssetKind = entry.AssetKind;
                    changed = true;
                }

                if (listing.GlobalAssetId is null && entry.GlobalAssetId is not null)
                {
                    listing.GlobalAssetId = entry.GlobalAssetId;
                    changed = true;
                }

                if (listing.ThumbnailData is null && repositoryBaseUrl is not null)
                {
                    var (tData, tCt) = await FetchThumbnailAsync(
                        httpClient,
                        repositoryBaseUrl,
                        entry.ShellId,
                        cancellationToken
                    );
                    if (tData is not null)
                    {
                        listing.ThumbnailData = tData;
                        listing.ThumbnailContentType = tCt;
                        changed = true;
                    }
                }

                // Submodels synchronisieren
                var existingSemanticIds = listing
                    .Submodels.Select(s => s.SemanticId)
                    .ToHashSet(StringComparer.Ordinal);
                var newSemanticIds = entry.SubmodelSemanticIds.ToHashSet(StringComparer.Ordinal);
                if (!existingSemanticIds.SetEquals(newSemanticIds))
                {
                    listing.Submodels.Clear();
                    foreach (var sid in entry.SubmodelSemanticIds)
                        listing.Submodels.Add(
                            new MarktListingSubmodel { Id = Guid.NewGuid(), SemanticId = sid }
                        );
                    changed = true;
                }

                // SpecificAssetIds synchronisieren
                var existingSpecific = listing
                    .SpecificAssetIds.Select(s => (s.Name, s.Value))
                    .ToHashSet();
                var newSpecific = entry.SpecificAssetIds.ToHashSet();
                if (!existingSpecific.SetEquals(newSpecific))
                {
                    listing.SpecificAssetIds.Clear();
                    foreach (var (name, value) in entry.SpecificAssetIds)
                        listing.SpecificAssetIds.Add(
                            new MarktListingSpecificAssetId
                            {
                                Id = Guid.NewGuid(),
                                Name = name,
                                Value = value,
                            }
                        );
                    changed = true;
                }

                if (changed)
                    listing.LastModifiedAt = DateTimeOffset.UtcNow;
            }

            foreach (var listing in toRemove)
            {
                db.MarktListings.Remove(listing);
            }

            // Junction-Tabelle für alle Listings (auch manuelle) aktualisieren
            await UpdateRuleMatchesAsync(rule, matchedShellIds, db, cancellationToken);

            rule.LastRunAt = runStart;
            rule.LastRunResult = $"OK:{toAdd.Count}added,{toRemove.Count}removed,{strategyLabel}";
            await db.SaveChangesAsync(cancellationToken);

            _logger.LogInformation(
                "MarktRegexSyncJob: Regel {RuleId} ({Label}): +{Added} -{Removed} via {Strategy}",
                rule.Id,
                rule.Label,
                toAdd.Count,
                toRemove.Count,
                strategyLabel
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "MarktRegexSyncJob: Fehler bei Regel {RuleId}.", rule.Id);
            rule.LastRunAt = runStart;
            rule.LastRunResult = $"Error:{ex.Message[..Math.Min(200, ex.Message.Length)]}";
            try
            {
                await db.SaveChangesAsync(cancellationToken);
            }
            catch
            {
                // Status-Update darf den Job nicht stoppen
            }
        }
    }

    private static bool MatchesRule(MarktRegexFreigabe rule, Regex regex, ShellScanEntry entry)
    {
        IEnumerable<string> candidates = rule.TargetAttribute switch
        {
            MarktRegexTargetAttribute.ShellId => [entry.ShellId],
            MarktRegexTargetAttribute.IdShort => entry.IdShort is null ? [] : [entry.IdShort],
            MarktRegexTargetAttribute.GlobalAssetId => entry.GlobalAssetId is null
                ? []
                : [entry.GlobalAssetId],
            MarktRegexTargetAttribute.SpecificAssetIdValue => entry
                .SpecificAssetIds.Where(s =>
                    rule.SpecificAssetIdName is null
                    || string.Equals(
                        s.Name,
                        rule.SpecificAssetIdName,
                        StringComparison.OrdinalIgnoreCase
                    )
                )
                .Select(s => s.Value),
            MarktRegexTargetAttribute.SubmodelSemanticId => entry.SubmodelSemanticIds,
            _ => [],
        };

        foreach (var candidate in candidates)
        {
            try
            {
                if (regex.IsMatch(candidate))
                    return true;
            }
            catch (RegexMatchTimeoutException)
            {
                // Timeout beim Match → kein Treffer, weiter
            }
        }

        return false;
    }

    private static MarktListing BuildAutoListing(
        MarktRegexFreigabe rule,
        ShellScanEntry entry,
        string organizationName,
        byte[]? thumbnailData,
        string? thumbnailContentType
    )
    {
        var title = entry.DisplayNameDe ?? entry.DisplayNameEn ?? entry.IdShort ?? entry.ShellId;

        var summary = entry.DescriptionDe ?? entry.DescriptionEn ?? string.Empty;

        return new MarktListing
        {
            Id = Guid.NewGuid(),
            SourceShellId = entry.ShellId,
            Title = title[..Math.Min(title.Length, 256)],
            OrganizationName = organizationName[..Math.Min(organizationName.Length, 256)],
            Summary = summary[..Math.Min(summary.Length, 2048)],
            SourceType = "designer",
            IsExternal = false,
            OrganisationId = rule.OrganisationId,
            AasInfrastrukturId = rule.AasInfrastrukturId,
            PublishedAt = DateTimeOffset.UtcNow,
            LastModifiedAt = DateTimeOffset.UtcNow,
            LastModifiedBy = $"regex-rule:{rule.Id}",
            AutoManagedByRuleId = rule.Id,
            AssetKind = entry.AssetKind,
            GlobalAssetId = entry.GlobalAssetId,
            ThumbnailData = thumbnailData,
            ThumbnailContentType = thumbnailContentType,
            Submodels = entry
                .SubmodelSemanticIds.Select(s => new MarktListingSubmodel
                {
                    Id = Guid.NewGuid(),
                    SemanticId = s,
                })
                .ToList(),
            SpecificAssetIds = entry
                .SpecificAssetIds.Select(s => new MarktListingSpecificAssetId
                {
                    Id = Guid.NewGuid(),
                    Name = s.Name,
                    Value = s.Value,
                })
                .ToList(),
        };
    }

    private static async Task UpdateRuleMatchesAsync(
        MarktRegexFreigabe rule,
        HashSet<string> matchedShellIds,
        IApplicationDbContext db,
        CancellationToken cancellationToken
    )
    {
        // Alle Listings für gematchte ShellIds bestimmen
        var matchedListings = await db
            .MarktListings.AsNoTracking()
            .Where(l => matchedShellIds.Contains(l.SourceShellId))
            .Select(l => l.Id)
            .ToListAsync(cancellationToken);

        // Bestehende Junction-Einträge für diese Regel
        var existingMatches = await db
            .MarktListingRuleMatches.Where(m => m.RuleId == rule.Id)
            .ToListAsync(cancellationToken);

        var existingListingIds = existingMatches.Select(m => m.ListingId).ToHashSet();
        var targetListingIds = matchedListings.ToHashSet();

        foreach (var listingId in targetListingIds.Except(existingListingIds))
        {
            db.MarktListingRuleMatches.Add(
                new MarktListingRuleMatch { ListingId = listingId, RuleId = rule.Id }
            );
        }

        foreach (var match in existingMatches.Where(m => !targetListingIds.Contains(m.ListingId)))
        {
            db.MarktListingRuleMatches.Remove(match);
        }
    }

    private async Task<(IShellDescriptorSource? source, string label)> SelectSourceAsync(
        AasInfrastructureSettings infra,
        CancellationToken cancellationToken
    )
    {
        if (!string.IsNullOrWhiteSpace(infra.AasRegistryUrl))
        {
            try
            {
                using var probeClient = CreateHttpClient(infra);
                var probeUrl = infra.AasRegistryUrl.TrimEnd('/') + "/shell-descriptors?$top=1";
                var probeResponse = await probeClient.GetAsync(probeUrl, cancellationToken);
                if (probeResponse.IsSuccessStatusCode)
                    return (RegistrySource, "registry");
            }
            catch
            {
                // Registry nicht erreichbar → Fallback
            }
        }

        if (!string.IsNullOrWhiteSpace(infra.AasRepositoryUrl))
            return (RepositorySource, "repository");

        return (null, "none");
    }

    /// <summary>
    /// Lädt das Thumbnail einer AAS-Shell vom Repository.
    /// AAS API Part 2: GET /shells/{base64url(shellId)}/asset-information/thumbnail
    /// </summary>
    private static async Task<(byte[]? data, string? contentType)> FetchThumbnailAsync(
        HttpClient httpClient,
        string repositoryBaseUrl,
        string shellId,
        CancellationToken cancellationToken
    )
    {
        try
        {
            var encodedId = Convert
                .ToBase64String(System.Text.Encoding.UTF8.GetBytes(shellId))
                .Replace('+', '-')
                .Replace('/', '_')
                .TrimEnd('=');
            var url =
                $"{repositoryBaseUrl}/shells/{Uri.EscapeDataString(encodedId)}/asset-information/thumbnail";
            var response = await httpClient.GetAsync(url, cancellationToken);
            if (!response.IsSuccessStatusCode)
                return (null, null);
            var data = await response.Content.ReadAsByteArrayAsync(cancellationToken);
            var ct = response.Content.Headers.ContentType?.MediaType ?? "application/octet-stream";
            return (data, ct);
        }
        catch
        {
            return (null, null);
        }
    }

    private static HttpClient CreateHttpClient(AasInfrastructureSettings infra)
    {
        HttpClient client;

        if (
            infra.Certificate is { Length: > 0 }
            && !string.IsNullOrWhiteSpace(infra.CertificatePassword)
        )
        {
            var cert =
                System.Security.Cryptography.X509Certificates.X509CertificateLoader.LoadPkcs12(
                    infra.Certificate,
                    infra.CertificatePassword
                );
            var handler = new HttpClientHandler();
            handler.ClientCertificates.Add(cert);
            client = new HttpClient(handler);
        }
        else
        {
            client = new HttpClient();
        }

        if (infra.HeaderParameters is { Count: > 0 })
        {
            foreach (var header in infra.HeaderParameters)
            {
                client.DefaultRequestHeaders.TryAddWithoutValidation(header.Name, header.Value);
            }
        }

        client.Timeout = TimeSpan.FromSeconds(30);
        return client;
    }
}
