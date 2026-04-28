using System.Text.RegularExpressions;
using AasDesignerApi.Jobs.Markt;
using AasDesignerApi.Model;
using AasDesignerAuthorization;
using AasDesignerCommon.Utils;
using AasDesignerModel;
using AasDesignerModel.Model;
using AasShared.Controllers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AasDesignerApi.Controllers.Internal
{
    // ---- DTOs ---------------------------------------------------------------

    public sealed record MarktRegexFreigabeDto(
        Guid Id,
        long OrganisationId,
        long AasInfrastrukturId,
        string Label,
        MarktRegexTargetAttribute TargetAttribute,
        string? SpecificAssetIdName,
        string RegexPattern,
        bool IsActive,
        DateTimeOffset CreatedAt,
        string CreatedBy,
        DateTimeOffset? LastRunAt,
        string? LastRunResult
    );

    public sealed record CreateMarktRegexFreigabeRequest(
        long AasInfrastrukturId,
        string Label,
        MarktRegexTargetAttribute TargetAttribute,
        string? SpecificAssetIdName,
        string RegexPattern,
        bool IsActive
    );

    public sealed record UpdateMarktRegexFreigabeRequest(
        string Label,
        MarktRegexTargetAttribute TargetAttribute,
        string? SpecificAssetIdName,
        string RegexPattern,
        bool IsActive
    );

    public sealed record MarktRegexDryRunRequest(
        long AasInfrastrukturId,
        MarktRegexTargetAttribute TargetAttribute,
        string? SpecificAssetIdName,
        string RegexPattern
    );

    public sealed record MarktRegexDryRunResult(
        int TotalMatches,
        IReadOnlyList<DryRunMatch> Matches,
        int WouldAdd,
        int WouldRemove,
        string Strategy
    );

    public sealed record DryRunMatch(
        string ShellId,
        string? IdShort,
        string? GlobalAssetId,
        bool AlreadyPublished,
        bool AutoManaged
    );

    // ---- Controller ---------------------------------------------------------

    [ApiController]
    [Route("api/markt/regex-rules")]
    [ApiExplorerSettings(GroupName = "internal")]
    public sealed class MarktRegexFreigabeController(IApplicationDbContext db)
        : InternalApiBaseController
    {
        // GET api/markt/regex-rules
        [HttpGet]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.MARKT_PUBLISHER, AuthRoles.SYSTEM_ADMIN])]
        public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser appUser)
                return Unauthorized();

            var query = db.MarktRegexFreigaben.AsNoTracking();
            if (!appUser.BenutzerRollen.Contains(AuthRoles.SYSTEM_ADMIN))
                query = query.Where(r => r.OrganisationId == appUser.OrganisationId);

            var rules = await query.OrderBy(r => r.CreatedAt).ToListAsync(cancellationToken);
            return Ok(rules.Select(ToDto));
        }

        // GET api/markt/regex-rules/{id}
        [HttpGet("{id:guid}")]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.MARKT_PUBLISHER, AuthRoles.SYSTEM_ADMIN])]
        public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser appUser)
                return Unauthorized();

            var rule = await db
                .MarktRegexFreigaben.AsNoTracking()
                .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);

            if (rule is null)
                return NotFound();

            if (
                !appUser.BenutzerRollen.Contains(AuthRoles.SYSTEM_ADMIN)
                && rule.OrganisationId != appUser.OrganisationId
            )
                return Forbid();

            return Ok(ToDto(rule));
        }

        // POST api/markt/regex-rules
        [HttpPost]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.MARKT_PUBLISHER, AuthRoles.SYSTEM_ADMIN])]
        public async Task<IActionResult> Create(
            [FromBody] CreateMarktRegexFreigabeRequest request,
            CancellationToken cancellationToken
        )
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser appUser)
                return Unauthorized();

            if (!ValidatePattern(request.RegexPattern, out var patternError))
                return BadRequest(patternError);

            var infra = await db
                .AasInfrastructureSettings.AsNoTracking()
                .FirstOrDefaultAsync(i => i.Id == request.AasInfrastrukturId, cancellationToken);
            if (infra is null)
                return BadRequest("Infrastruktur nicht gefunden.");

            if (
                !appUser.BenutzerRollen.Contains(AuthRoles.SYSTEM_ADMIN)
                && infra.OrganisationId != appUser.OrganisationId
            )
                return Forbid();

            var rule = new MarktRegexFreigabe
            {
                Id = Guid.NewGuid(),
                OrganisationId = appUser.OrganisationId,
                AasInfrastrukturId = request.AasInfrastrukturId,
                Label = request.Label.Trim(),
                TargetAttribute = request.TargetAttribute,
                SpecificAssetIdName = string.IsNullOrWhiteSpace(request.SpecificAssetIdName)
                    ? null
                    : request.SpecificAssetIdName.Trim(),
                RegexPattern = request.RegexPattern.Trim(),
                IsActive = request.IsActive,
                CreatedAt = DateTimeOffset.UtcNow,
                CreatedBy = appUser.BenutzerId.ToString(),
            };

            db.MarktRegexFreigaben.Add(rule);
            await db.SaveChangesAsync(cancellationToken);
            return Ok(ToDto(rule));
        }

        // PUT api/markt/regex-rules/{id}
        [HttpPut("{id:guid}")]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.MARKT_PUBLISHER, AuthRoles.SYSTEM_ADMIN])]
        public async Task<IActionResult> Update(
            Guid id,
            [FromBody] UpdateMarktRegexFreigabeRequest request,
            CancellationToken cancellationToken
        )
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser appUser)
                return Unauthorized();

            if (!ValidatePattern(request.RegexPattern, out var patternError))
                return BadRequest(patternError);

            var rule = await db.MarktRegexFreigaben.FirstOrDefaultAsync(
                r => r.Id == id,
                cancellationToken
            );
            if (rule is null)
                return NotFound();

            if (
                !appUser.BenutzerRollen.Contains(AuthRoles.SYSTEM_ADMIN)
                && rule.OrganisationId != appUser.OrganisationId
            )
                return Forbid();

            rule.Label = request.Label.Trim();
            rule.TargetAttribute = request.TargetAttribute;
            rule.SpecificAssetIdName = string.IsNullOrWhiteSpace(request.SpecificAssetIdName)
                ? null
                : request.SpecificAssetIdName.Trim();
            rule.RegexPattern = request.RegexPattern.Trim();
            rule.IsActive = request.IsActive;

            await db.SaveChangesAsync(cancellationToken);
            return Ok(ToDto(rule));
        }

        // DELETE api/markt/regex-rules/{id}
        [HttpDelete("{id:guid}")]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.MARKT_PUBLISHER, AuthRoles.SYSTEM_ADMIN])]
        public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser appUser)
                return Unauthorized();

            var rule = await db
                .MarktRegexFreigaben.Include(r => r.AutoManagedListings)
                .Include(r => r.ListingMatches)
                .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);

            if (rule is null)
                return NotFound();

            if (
                !appUser.BenutzerRollen.Contains(AuthRoles.SYSTEM_ADMIN)
                && rule.OrganisationId != appUser.OrganisationId
            )
                return Forbid();

            // Auto-gemanagte Listings entfernen; manuell publizierte Listings bleiben (nur Junction-Einträge weg via Cascade)
            db.MarktListings.RemoveRange(rule.AutoManagedListings.ToList());
            db.MarktRegexFreigaben.Remove(rule);
            await db.SaveChangesAsync(cancellationToken);
            return Ok();
        }

        // POST api/markt/regex-rules/dry-run
        [HttpPost("dry-run")]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.MARKT_PUBLISHER, AuthRoles.SYSTEM_ADMIN])]
        public async Task<IActionResult> DryRun(
            [FromBody] MarktRegexDryRunRequest request,
            CancellationToken cancellationToken
        )
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser appUser)
                return Unauthorized();

            if (!ValidatePattern(request.RegexPattern, out var patternError))
                return BadRequest(patternError);

            var infra = await db
                .AasInfrastructureSettings.AsNoTracking()
                .FirstOrDefaultAsync(i => i.Id == request.AasInfrastrukturId, cancellationToken);
            if (infra is null)
                return BadRequest("Infrastruktur nicht gefunden.");

            if (
                !appUser.BenutzerRollen.Contains(AuthRoles.SYSTEM_ADMIN)
                && infra.OrganisationId != appUser.OrganisationId
            )
                return Forbid();

            var regex = new Regex(
                request.RegexPattern.Trim(),
                RegexOptions.None,
                TimeSpan.FromMilliseconds(500)
            );

            var (source, strategy) = await SelectSourceAsync(infra, cancellationToken);
            if (source is null)
                return Ok(new MarktRegexDryRunResult(0, [], 0, 0, "NoEndpointAvailable"));

            var tempRule = new MarktRegexFreigabe
            {
                Id = Guid.Empty,
                OrganisationId = appUser.OrganisationId,
                AasInfrastrukturId = request.AasInfrastrukturId,
                Label = string.Empty,
                TargetAttribute = request.TargetAttribute,
                SpecificAssetIdName = request.SpecificAssetIdName,
                RegexPattern = request.RegexPattern,
                CreatedBy = string.Empty,
            };

            using var httpClient = CreateHttpClient(infra);
            var matchedShellIds = new List<string>();
            var matchedEntries = new List<ShellScanEntry>();

            await foreach (var entry in source.ScanAsync(infra, httpClient, cancellationToken))
            {
                if (MatchesRule(tempRule, regex, entry))
                {
                    matchedShellIds.Add(entry.ShellId);
                    matchedEntries.Add(entry);
                }
            }

            // Bestehende Listings für Diff
            var existingListings = await db
                .MarktListings.AsNoTracking()
                .Where(l => matchedShellIds.Contains(l.SourceShellId))
                .Select(l => new { l.SourceShellId, l.AutoManagedByRuleId })
                .ToListAsync(cancellationToken);

            var existingByShellId = existingListings.ToDictionary(
                l => l.SourceShellId,
                l => l.AutoManagedByRuleId
            );

            var matches = matchedEntries
                .Select(e => new DryRunMatch(
                    e.ShellId,
                    e.IdShort,
                    e.GlobalAssetId,
                    existingByShellId.ContainsKey(e.ShellId),
                    existingByShellId.TryGetValue(e.ShellId, out var ruleId) && ruleId.HasValue
                ))
                .ToList();

            var wouldAdd = matches.Count(m => !m.AlreadyPublished);

            return Ok(
                new MarktRegexDryRunResult(
                    matches.Count,
                    matches,
                    wouldAdd,
                    0, // Würde-entfernen nur für eine bereits gespeicherte Regel berechenbar
                    strategy
                )
            );
        }

        // DELETE api/markt/regex-rules/listings/{listingId}/manual-publish
        [HttpDelete("listings/{listingId:guid}/manual-publish")]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.MARKT_PUBLISHER, AuthRoles.SYSTEM_ADMIN])]
        public async Task<IActionResult> RemoveManualPublish(
            Guid listingId,
            CancellationToken cancellationToken
        )
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser appUser)
                return Unauthorized();

            var listing = await db
                .MarktListings.Include(l => l.RuleMatches)
                .FirstOrDefaultAsync(l => l.Id == listingId, cancellationToken);

            if (listing is null)
                return NotFound();

            if (
                !appUser.BenutzerRollen.Contains(AuthRoles.SYSTEM_ADMIN)
                && listing.OrganisationId != appUser.OrganisationId
            )
                return Forbid();

            // Nur sinnvoll wenn: manuell publiziert UND mind. eine passende Regel vorhanden
            if (listing.AutoManagedByRuleId is not null)
                return BadRequest("Listing ist bereits automatisch verwaltet.");

            if (!listing.RuleMatches.Any())
                return BadRequest(
                    "Keine passende Regex-Regel vorhanden – Listing kann nicht in automatische Verwaltung übergeben werden."
                );

            // Erste passende Regel übernimmt die Ownership
            var firstRuleId = listing.RuleMatches.First().RuleId;
            listing.AutoManagedByRuleId = firstRuleId;
            listing.LastModifiedAt = DateTimeOffset.UtcNow;
            listing.LastModifiedBy = appUser.BenutzerId.ToString();

            await db.SaveChangesAsync(cancellationToken);
            return Ok();
        }

        // GET api/markt/regex-rules/settings
        [HttpGet("settings")]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
        public async Task<IActionResult> GetSettings(CancellationToken cancellationToken)
        {
            var stored = await db
                .PersistentSettings.AsNoTracking()
                .Where(s => s.Name == MarktRegexSyncSettingsStore.SettingName)
                .Select(s => s.Value)
                .FirstOrDefaultAsync(cancellationToken);

            var settings = MarktRegexSyncSettingsStore.Deserialize(stored);
            return Ok(settings);
        }

        // PUT api/markt/regex-rules/settings
        [HttpPut("settings")]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
        public async Task<IActionResult> UpdateSettings(
            [FromBody] MarktRegexSyncSettingsDto request,
            CancellationToken cancellationToken
        )
        {
            if (request.IntervalMinutes < 1 || request.IntervalMinutes > 1440)
                return BadRequest("IntervalMinutes muss zwischen 1 und 1440 liegen.");

            await MarktRegexSyncSettingsStore.SaveAsync(db, request, cancellationToken);
            return Ok(request);
        }

        // ---- Helpers ----------------------------------------------------------

        private static bool ValidatePattern(string pattern, out string error)
        {
            error = string.Empty;
            if (string.IsNullOrWhiteSpace(pattern))
            {
                error = "RegexPattern darf nicht leer sein.";
                return false;
            }
            if (pattern.Length > 1024)
            {
                error = "RegexPattern darf maximal 1024 Zeichen lang sein.";
                return false;
            }
            try
            {
                _ = new Regex(pattern, RegexOptions.None, TimeSpan.FromMilliseconds(500));
                return true;
            }
            catch (Exception ex)
            {
                error = $"Ungültiges Regex-Pattern: {ex.Message}";
                return false;
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
                catch (RegexMatchTimeoutException) { }
            }
            return false;
        }

        private static async Task<(IShellDescriptorSource? source, string label)> SelectSourceAsync(
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
                        return (new RegistryDescriptorSource(), "registry");
                }
                catch { }
            }
            if (!string.IsNullOrWhiteSpace(infra.AasRepositoryUrl))
                return (new RepositoryShellSource(), "repository");
            return (null, "none");
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
                    client.DefaultRequestHeaders.TryAddWithoutValidation(header.Name, header.Value);
            }
            client.Timeout = TimeSpan.FromSeconds(30);
            return client;
        }

        private static MarktRegexFreigabeDto ToDto(MarktRegexFreigabe rule) =>
            new(
                rule.Id,
                rule.OrganisationId,
                rule.AasInfrastrukturId,
                rule.Label,
                rule.TargetAttribute,
                rule.SpecificAssetIdName,
                rule.RegexPattern,
                rule.IsActive,
                rule.CreatedAt,
                rule.CreatedBy,
                rule.LastRunAt,
                rule.LastRunResult
            );
    }
}
