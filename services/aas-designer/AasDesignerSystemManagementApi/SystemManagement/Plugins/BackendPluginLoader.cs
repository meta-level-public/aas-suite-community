using System.IO.Compression;
using System.Reflection;
using System.Runtime.Loader;
using System.Text.Json;
using AasDesignerSystemManagementApi.SystemManagement.Model;
using AasShared.Configuration;
using AasSuitePluginAbstractions;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace AasDesignerSystemManagementApi.SystemManagement.Plugins;

public sealed class BackendPluginLoader
{
    private const string BackendDirectory = "backend/";
    private readonly ILogger _logger;
    private readonly List<LoadedBackendPlugin> _plugins = [];

    private BackendPluginLoader(ILogger logger)
    {
        _logger = logger;
    }

    public static BackendPluginLoader Load(
        IServiceCollection services,
        AppSettings appSettings,
        ILogger logger
    )
    {
        var loader = new BackendPluginLoader(logger);
        loader.LoadPlugins(services, appSettings);
        return loader;
    }

    public void MapEndpoints(IEndpointRouteBuilder endpoints)
    {
        foreach (var plugin in _plugins)
        {
            try
            {
                plugin.Instance.MapEndpoints(endpoints);
                _logger.LogInformation(
                    "Mapped backend plugin endpoints for {PluginId}.",
                    plugin.PluginId
                );
            }
            catch (Exception exception)
            {
                _logger.LogError(
                    exception,
                    "Backend plugin {PluginId} failed while mapping endpoints.",
                    plugin.PluginId
                );
            }
        }
    }

    private void LoadPlugins(IServiceCollection services, AppSettings appSettings)
    {
        if (
            !appSettings.PluginsEnabled
            || string.IsNullOrWhiteSpace(appSettings.PluginDirectory)
            || !Directory.Exists(appSettings.PluginDirectory)
        )
        {
            return;
        }

        foreach (var archivePath in Directory.EnumerateFiles(appSettings.PluginDirectory, "*.zip"))
        {
            TryLoadPlugin(services, appSettings, archivePath);
        }
    }

    private void TryLoadPlugin(
        IServiceCollection services,
        AppSettings appSettings,
        string archivePath
    )
    {
        try
        {
            var fileInfo = new FileInfo(archivePath);
            if (fileInfo.Length > appSettings.PluginMaxArchiveSizeBytes)
            {
                _logger.LogWarning(
                    "Ignoring backend plugin archive {ArchivePath} because it exceeds the configured size limit.",
                    archivePath
                );
                return;
            }

            using var archive = ZipFile.OpenRead(archivePath);
            var manifestEntry = FindEntry(archive, "manifest.json");
            if (manifestEntry == null)
                return;

            var manifest = ReadManifest(manifestEntry);
            if (manifest?.Backend == null)
                return;

            var pluginId = manifest.Id.Trim();
            var assemblyPath = NormalizeBackendPath(manifest.Backend.Assembly);
            var typeName = manifest.Backend.Type.Trim();
            if (
                string.IsNullOrWhiteSpace(pluginId)
                || assemblyPath == null
                || string.IsNullOrWhiteSpace(typeName)
            )
            {
                _logger.LogWarning(
                    "Ignoring backend plugin in {ArchivePath} because its backend manifest is invalid.",
                    archivePath
                );
                return;
            }

            var assemblyEntry = FindEntry(archive, assemblyPath);
            if (
                assemblyEntry == null
                || !assemblyPath.EndsWith(".dll", StringComparison.OrdinalIgnoreCase)
            )
            {
                _logger.LogWarning(
                    "Ignoring backend plugin {PluginId} because its assembly is missing.",
                    pluginId
                );
                return;
            }

            var extractionDirectory = ExtractBackendFiles(archive, appSettings, pluginId);
            var assemblyFilePath = Path.Combine(
                extractionDirectory,
                assemblyPath[BackendDirectory.Length..].Replace('/', Path.DirectorySeparatorChar)
            );
            var loadContext = new PluginLoadContext(assemblyFilePath);
            var assembly = loadContext.LoadFromAssemblyPath(assemblyFilePath);
            var pluginType = assembly.GetType(typeName, throwOnError: false, ignoreCase: false);
            if (
                pluginType == null
                || !typeof(IAasSuiteBackendPlugin).IsAssignableFrom(pluginType)
                || Activator.CreateInstance(pluginType) is not IAasSuiteBackendPlugin pluginInstance
            )
            {
                _logger.LogWarning(
                    "Ignoring backend plugin {PluginId} because its type is invalid.",
                    pluginId
                );
                return;
            }

            pluginInstance.ConfigureServices(services);
            _plugins.Add(
                new LoadedBackendPlugin(pluginId, pluginInstance, loadContext, extractionDirectory)
            );
            _logger.LogInformation(
                "Loaded backend plugin {PluginId} from {ArchivePath}.",
                pluginId,
                archivePath
            );
        }
        catch (Exception exception)
            when (exception
                    is JsonException
                        or InvalidDataException
                        or IOException
                        or ReflectionTypeLoadException
                        or InvalidOperationException
            )
        {
            _logger.LogError(
                exception,
                "Ignoring backend plugin archive {ArchivePath} because it failed to load.",
                archivePath
            );
        }
    }

    private static PluginManifestDto? ReadManifest(ZipArchiveEntry manifestEntry)
    {
        using var stream = manifestEntry.Open();
        return JsonSerializer.Deserialize<PluginManifestDto>(
            stream,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
        );
    }

    private static string ExtractBackendFiles(
        ZipArchive archive,
        AppSettings appSettings,
        string pluginId
    )
    {
        var extractionDirectory = Path.Combine(
            Path.GetTempPath(),
            "aas-suite-plugins",
            pluginId,
            Guid.NewGuid().ToString("N")
        );
        Directory.CreateDirectory(extractionDirectory);

        foreach (
            var entry in archive.Entries.Where(entry =>
                entry.FullName.StartsWith(BackendDirectory, StringComparison.OrdinalIgnoreCase)
            )
        )
        {
            var relativePath = entry.FullName[BackendDirectory.Length..].Replace('\\', '/');
            if (entry.FullName.EndsWith('/') || NormalizeBackendPath(relativePath) == null)
                continue;
            if (entry.Length > appSettings.PluginMaxEntrySizeBytes)
                throw new InvalidDataException(
                    $"Backend plugin entry exceeds the configured size limit: {entry.FullName}"
                );

            var destinationPath = Path.Combine(
                extractionDirectory,
                relativePath.Replace('/', Path.DirectorySeparatorChar)
            );
            var destinationDirectory = Path.GetDirectoryName(destinationPath);
            if (destinationDirectory != null)
                Directory.CreateDirectory(destinationDirectory);

            using var source = entry.Open();
            using var destination = File.Create(destinationPath);
            source.CopyTo(destination);
        }

        return extractionDirectory;
    }

    private static ZipArchiveEntry? FindEntry(ZipArchive archive, string path)
    {
        return archive.Entries.FirstOrDefault(entry =>
            string.Equals(
                entry.FullName.Replace('\\', '/'),
                path,
                StringComparison.OrdinalIgnoreCase
            ) && !entry.FullName.EndsWith('/')
        );
    }

    private static string? NormalizeBackendPath(string? path)
    {
        var normalized = path?.Trim().Replace('\\', '/') ?? string.Empty;
        if (
            string.IsNullOrWhiteSpace(normalized)
            || normalized.StartsWith('/')
            || normalized.Contains("..", StringComparison.Ordinal)
            || normalized.Contains("//", StringComparison.Ordinal)
            || normalized.StartsWith('%')
        )
        {
            return null;
        }

        return normalized.StartsWith(BackendDirectory, StringComparison.OrdinalIgnoreCase)
            ? normalized
            : $"{BackendDirectory}{normalized}";
    }

    private sealed record LoadedBackendPlugin(
        string PluginId,
        IAasSuiteBackendPlugin Instance,
        PluginLoadContext LoadContext,
        string ExtractionDirectory
    );

    private sealed class PluginLoadContext : AssemblyLoadContext
    {
        private readonly AssemblyDependencyResolver _resolver;
        private readonly Assembly _contractAssembly = typeof(IAasSuiteBackendPlugin).Assembly;

        public PluginLoadContext(string mainAssemblyPath)
            : base(isCollectible: false)
        {
            _resolver = new AssemblyDependencyResolver(mainAssemblyPath);
        }

        protected override Assembly? Load(AssemblyName assemblyName)
        {
            if (
                string.Equals(
                    assemblyName.Name,
                    _contractAssembly.GetName().Name,
                    StringComparison.OrdinalIgnoreCase
                )
            )
                return _contractAssembly;

            var assemblyPath = _resolver.ResolveAssemblyToPath(assemblyName);
            return assemblyPath == null
                ? AssemblyLoadContext.Default.LoadFromAssemblyName(assemblyName)
                : LoadFromAssemblyPath(assemblyPath);
        }
    }
}
