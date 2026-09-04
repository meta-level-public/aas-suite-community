using System.IO.Compression;
using System.Text.Json;
using System.Text.RegularExpressions;
using AasDesignerApi.Model;
using AasDesignerSystemManagementApi.SystemManagement.Model;
using AasShared.Configuration;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.Logging;

namespace AasDesignerSystemManagementApi.SystemManagement.Plugins;

public sealed partial class ZipPluginRegistry : IPluginRegistry
{
    private static readonly HashSet<string> ReservedRoutes = new(StringComparer.OrdinalIgnoreCase)
    {
        "aas",
        "aas-view",
        "access",
        "cd-edit",
        "cds-list",
        "contact",
        "create-invited-account",
        "dashboard",
        "error",
        "forbidden",
        "generator",
        "instance-viewer",
        "login",
        "mapping",
        "markt-freigaben",
        "my-organization",
        "my-space",
        "notfound",
        "plugins",
        "public-viewer",
        "shells-list",
        "sso-login-status",
        "sso-login-success",
        "submodel-edit",
        "submodels",
        "idta-submodels",
        "system-management",
        "viewer",
    };

    private static readonly JsonSerializerOptions SerializerOptions = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    private readonly AppSettings _appSettings;
    private readonly ILogger<ZipPluginRegistry> _logger;
    private readonly FileExtensionContentTypeProvider _contentTypeProvider = new();

    public ZipPluginRegistry(AppSettings appSettings, ILogger<ZipPluginRegistry> logger)
    {
        _appSettings = appSettings;
        _logger = logger;
    }

    public IReadOnlyList<PluginMenuItemDto> GetPluginMenuItems(AppUser appUser)
    {
        if (!CanScanPluginDirectory())
            return [];

        var plugins = new List<PluginMenuItemDto>();
        var usedIds = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var usedRoutes = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        foreach (var archivePath in Directory.EnumerateFiles(_appSettings.PluginDirectory, "*.zip"))
        {
            var plugin = TryReadPlugin(archivePath);
            if (plugin == null)
                continue;

            if (!IsAllowed(plugin, appUser))
                continue;

            if (!usedIds.Add(plugin.Id) || !usedRoutes.Add(plugin.Route))
            {
                _logger.LogWarning(
                    "Ignoring duplicate plugin {PluginId} with route {PluginRoute} from {ArchivePath}.",
                    plugin.Id,
                    plugin.Route,
                    archivePath
                );
                continue;
            }

            plugins.Add(plugin);
        }

        return plugins.OrderBy(plugin => plugin.SortOrder).ThenBy(plugin => plugin.Name).ToList();
    }

    public PluginAssetResult? OpenAsset(AppUser appUser, string pluginId, string? assetPath)
    {
        if (!CanScanPluginDirectory() || !PluginIdRegex().IsMatch(pluginId))
            return null;

        var pluginArchive = FindPluginArchive(pluginId);
        if (pluginArchive == null || !IsAllowed(pluginArchive.Manifest, appUser))
            return null;

        var requestedPath = NormalizeAssetPath(assetPath);
        if (requestedPath == null)
            return null;

        try
        {
            using var archive = ZipFile.OpenRead(pluginArchive.ArchivePath);
            var entry =
                FindEntry(archive, requestedPath)
                ?? FindEntry(archive, pluginArchive.Manifest.EntryPoint);

            if (entry == null || entry.Length > _appSettings.PluginMaxEntrySizeBytes)
                return null;

            var memoryStream = new MemoryStream();
            using (var entryStream = entry.Open())
            {
                entryStream.CopyTo(memoryStream);
            }

            memoryStream.Position = 0;
            var fileName = Path.GetFileName(entry.FullName);
            if (!_contentTypeProvider.TryGetContentType(fileName, out var contentType))
            {
                contentType = "application/octet-stream";
            }

            return new PluginAssetResult
            {
                Stream = memoryStream,
                ContentType = contentType,
                FileName = fileName,
            };
        }
        catch (InvalidDataException exception)
        {
            _logger.LogWarning(
                exception,
                "Ignoring invalid plugin archive {ArchivePath}.",
                pluginArchive.ArchivePath
            );
            return null;
        }
        catch (IOException exception)
        {
            _logger.LogWarning(
                exception,
                "Could not read plugin archive {ArchivePath}.",
                pluginArchive.ArchivePath
            );
            return null;
        }
    }

    private bool CanScanPluginDirectory()
    {
        return _appSettings.PluginsEnabled
            && !string.IsNullOrWhiteSpace(_appSettings.PluginDirectory)
            && Directory.Exists(_appSettings.PluginDirectory);
    }

    private PluginMenuItemDto? TryReadPlugin(string archivePath)
    {
        try
        {
            var fileInfo = new FileInfo(archivePath);
            if (fileInfo.Length > _appSettings.PluginMaxArchiveSizeBytes)
            {
                _logger.LogWarning(
                    "Ignoring plugin archive {ArchivePath} because it exceeds the configured size limit.",
                    archivePath
                );
                return null;
            }

            using var archive = ZipFile.OpenRead(archivePath);
            var manifestEntry = FindEntry(archive, "manifest.json");
            if (manifestEntry == null)
            {
                _logger.LogWarning(
                    "Ignoring plugin archive {ArchivePath} because manifest.json is missing.",
                    archivePath
                );
                return null;
            }

            using var stream = manifestEntry.Open();
            var manifest = JsonSerializer.Deserialize<PluginManifestDto>(stream, SerializerOptions);
            return CreateMenuItem(manifest, archive, archivePath);
        }
        catch (JsonException exception)
        {
            _logger.LogWarning(
                exception,
                "Ignoring plugin archive {ArchivePath} because manifest.json is invalid.",
                archivePath
            );
            return null;
        }
        catch (InvalidDataException exception)
        {
            _logger.LogWarning(
                exception,
                "Ignoring invalid plugin archive {ArchivePath}.",
                archivePath
            );
            return null;
        }
        catch (IOException exception)
        {
            _logger.LogWarning(
                exception,
                "Could not read plugin archive {ArchivePath}.",
                archivePath
            );
            return null;
        }
    }

    private PluginMenuItemDto? CreateMenuItem(
        PluginManifestDto? manifest,
        ZipArchive archive,
        string archivePath
    )
    {
        if (manifest == null || manifest.ManifestVersion != 1)
        {
            _logger.LogWarning(
                "Ignoring plugin archive {ArchivePath} because the manifest version is unsupported.",
                archivePath
            );
            return null;
        }

        if (manifest.Type != PluginType.GuiApp)
        {
            _logger.LogWarning(
                "Ignoring plugin archive {ArchivePath} because its plugin type is unsupported.",
                archivePath
            );
            return null;
        }

        var id = manifest.Id.Trim();
        var route = NormalizePluginRoute(manifest.Route);
        var entryPoint = NormalizeAssetPath(manifest.EntryPoint);
        var name = manifest.Name.Trim();
        var icon = manifest.Icon.Trim();

        if (
            !PluginIdRegex().IsMatch(id)
            || route == null
            || entryPoint == null
            || string.IsNullOrWhiteSpace(name)
            || name.Length > 80
            || !IsAllowedIcon(icon)
            || FindEntry(archive, entryPoint) == null
        )
        {
            _logger.LogWarning(
                "Ignoring plugin archive {ArchivePath} because the manifest is invalid.",
                archivePath
            );
            return null;
        }

        var assetPath = $"/system-management-api/Plugins/{Uri.EscapeDataString(id)}/assets/";

        return new PluginMenuItemDto
        {
            Type = manifest.Type.Value,
            Id = id,
            Route = route,
            Name = name,
            Icon = icon,
            Description = TrimToLength(manifest.Description, 500),
            ShortLabel = TrimToLength(manifest.ShortLabel, 12),
            RequiredRole = TrimToLength(manifest.RequiredRole, 80),
            OrganizationIds = [.. manifest.OrganizationIds.Distinct()],
            Roles =
            [
                .. manifest
                    .Roles.Where(role => !string.IsNullOrWhiteSpace(role))
                    .Select(role => role.Trim())
                    .Distinct(StringComparer.OrdinalIgnoreCase),
            ],
            RequiresWritableRepo = manifest.RequiresWritableRepo,
            SortOrder = manifest.SortOrder,
            Version = TrimToLength(manifest.Version, 40),
            Author = TrimToLength(manifest.Author, 120),
            AssetPath = assetPath,
            EntryPointPath = $"{assetPath}{entryPoint}",
        };
    }

    private PluginArchive? FindPluginArchive(string pluginId)
    {
        foreach (var archivePath in Directory.EnumerateFiles(_appSettings.PluginDirectory, "*.zip"))
        {
            try
            {
                using var archive = ZipFile.OpenRead(archivePath);
                var manifestEntry = FindEntry(archive, "manifest.json");
                if (manifestEntry == null)
                    continue;

                using var stream = manifestEntry.Open();
                var manifest = JsonSerializer.Deserialize<PluginManifestDto>(
                    stream,
                    SerializerOptions
                );
                var menuItem = CreateMenuItem(manifest, archive, archivePath);
                if (
                    menuItem?.Id.Equals(pluginId, StringComparison.OrdinalIgnoreCase) == true
                    && manifest != null
                )
                {
                    return new PluginArchive(archivePath, manifest);
                }
            }
            catch (Exception exception)
                when (exception is JsonException or InvalidDataException or IOException)
            {
                _logger.LogWarning(
                    exception,
                    "Ignoring plugin archive {ArchivePath} while resolving asset.",
                    archivePath
                );
            }
        }

        return null;
    }

    private static bool IsAllowed(PluginMenuItemDto plugin, AppUser appUser)
    {
        return (
                plugin.OrganizationIds.Count == 0
                || plugin.OrganizationIds.Contains(appUser.OrganisationId)
            ) && HasAllowedRole(appUser, plugin.Roles, plugin.RequiredRole);
    }

    private static bool IsAllowed(PluginManifestDto manifest, AppUser appUser)
    {
        return (
                manifest.OrganizationIds.Count == 0
                || manifest.OrganizationIds.Contains(appUser.OrganisationId)
            ) && HasAllowedRole(appUser, manifest.Roles, manifest.RequiredRole);
    }

    private static bool HasAllowedRole(
        AppUser appUser,
        IEnumerable<string> roles,
        string requiredRole
    )
    {
        var allowedRoles = roles
            .Append(requiredRole)
            .Where(role => !string.IsNullOrWhiteSpace(role))
            .Select(role => role.Trim())
            .ToList();

        return allowedRoles.Count == 0
            || allowedRoles.Any(role =>
                appUser.BenutzerRollen.Contains(role, StringComparer.OrdinalIgnoreCase)
            );
    }

    private static ZipArchiveEntry? FindEntry(ZipArchive archive, string path)
    {
        var normalizedPath = NormalizeAssetPath(path);
        if (normalizedPath == null)
            return null;

        return archive.Entries.FirstOrDefault(entry =>
            string.Equals(
                entry.FullName.Replace('\\', '/'),
                normalizedPath,
                StringComparison.OrdinalIgnoreCase
            ) && !entry.FullName.EndsWith('/')
        );
    }

    private static string? NormalizeAssetPath(string? path)
    {
        var normalized = path?.Trim().Replace('\\', '/') ?? string.Empty;
        if (string.IsNullOrWhiteSpace(normalized))
            return "index.html";

        normalized = normalized.TrimStart('/');
        if (
            normalized.Contains("..", StringComparison.Ordinal)
            || normalized.Contains("//", StringComparison.Ordinal)
            || normalized.StartsWith('~')
            || normalized.StartsWith("%", StringComparison.Ordinal)
        )
        {
            return null;
        }

        return normalized;
    }

    private static string? NormalizePluginRoute(string? route)
    {
        var normalized = route?.Trim() ?? string.Empty;
        if (!PluginRouteRegex().IsMatch(normalized))
            return null;

        var routeSegment = normalized.TrimStart('/');
        return ReservedRoutes.Contains(routeSegment) ? null : normalized;
    }

    private static bool IsAllowedIcon(string icon)
    {
        return icon.Length is > 0 and <= 80 && icon.StartsWith("pi pi-", StringComparison.Ordinal);
    }

    private static string TrimToLength(string value, int maxLength)
    {
        var trimmed = value.Trim();
        return trimmed.Length <= maxLength ? trimmed : trimmed[..maxLength];
    }

    [GeneratedRegex("^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$", RegexOptions.IgnoreCase)]
    private static partial Regex PluginIdRegex();

    [GeneratedRegex("^/[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$", RegexOptions.IgnoreCase)]
    private static partial Regex PluginRouteRegex();

    private sealed record PluginArchive(string ArchivePath, PluginManifestDto Manifest);
}
