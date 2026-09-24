using System.Globalization;
using System.Text.Json;
using AasSuitePluginAbstractions;
using Docker.DotNet;
using Docker.DotNet.Models;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;

namespace TwinEngineConfigBackendPlugin;

public sealed class TwinEngineConfigBackendPlugin : IAasSuiteBackendPlugin
{
    public void ConfigureServices(IServiceCollection services)
    {
        services.AddSingleton<TwinEngineConfigStore>();
    }

    public void MapEndpoints(IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/plugin-api/twinengine-config");

        group.MapGet("/healthz", () => Results.Ok(new { status = "ok" }));
        group.MapGet("/api/config", async (TwinEngineConfigStore store, CancellationToken cancellationToken) =>
            Results.Ok(await store.ReadAsync(cancellationToken)));
        group.MapPut("/api/config", async (TwinEngineConfig config, TwinEngineConfigStore store, CancellationToken cancellationToken) =>
        {
            var errors = TwinEngineConfigValidator.Validate(config);
            if (errors.Count > 0)
                return Results.BadRequest(new { errors });

            var current = await store.ReadAsync(cancellationToken);
            config.Version = current.Version + 1;
            await store.WriteAsync(config, cancellationToken);
            return Results.Ok(config);
        });
        group.MapPost("/api/config/validate", (TwinEngineConfig config) =>
        {
            var errors = TwinEngineConfigValidator.Validate(config);
            return Results.Json(new { valid = errors.Count == 0, errors }, statusCode: errors.Count == 0 ? 200 : 400);
        });
        group.MapPost("/api/config/export", async (TwinEngineConfigStore store, CancellationToken cancellationToken) =>
        {
            var config = await store.ReadAsync(cancellationToken);
            var errors = TwinEngineConfigValidator.Validate(config);
            if (errors.Count > 0)
                return Results.BadRequest(new { errors });

            var (dataEnginePath, dppPluginPath) = await store.ExportAsync(config, cancellationToken);
            return Results.Ok(new { exported = true, version = config.Version, dataEnginePath, dppPluginPath });
        });
        group.MapGet("/api/config/history", async (TwinEngineConfigStore store, CancellationToken cancellationToken) =>
            Results.Ok(await store.ListHistoryAsync(cancellationToken)));
        group.MapGet("/api/config/history/{version:int}", async (int version, TwinEngineConfigStore store, CancellationToken cancellationToken) =>
        {
            var config = await store.ReadHistoryAsync(version, cancellationToken);
            return config == null ? Results.NotFound() : Results.Ok(config);
        });
        group.MapGet("/api/config/defaults", () => Results.Ok(TwinEngineConfigDefaults.Create()));
        group.MapPost("/api/config/recreate-dataengine", async (TwinEngineConfigStore store, CancellationToken cancellationToken) =>
        {
            try
            {
                var result = await store.RecreateDataEngineAsync(cancellationToken);
                return Results.Ok(new { recreated = true, containerId = result.ContainerId, containerName = result.ContainerName });
            }
            catch (Exception exception) when (exception is InvalidOperationException or DockerApiException)
            {
                return Results.Problem(exception.Message, statusCode: StatusCodes.Status502BadGateway);
            }
        });
    }
}

public sealed partial class TwinEngineConfigStore
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        WriteIndented = true,
    };

    private const int MaxHistoryEntries = 10;

    private readonly SemaphoreSlim gate = new(1, 1);
    private readonly string configPath = Environment.GetEnvironmentVariable("TWINENGINE_CONFIG_PATH")
        ?? Path.Combine(AppContext.BaseDirectory, "twinengine-config", "config.json");
    private readonly string historyDirectory;
    private readonly string dataEngineExportPath = Environment.GetEnvironmentVariable("TWINENGINE_DATAENGINE_EXPORT_PATH")
        ?? Path.Combine(AppContext.BaseDirectory, "twinengine-config", "twinengine-dataengine.env");
    private readonly string dppPluginExportPath = Environment.GetEnvironmentVariable("TWINENGINE_DPP_PLUGIN_EXPORT_PATH")
        ?? Path.Combine(AppContext.BaseDirectory, "twinengine-config", "twinengine-dpp-plugin.env");

    public TwinEngineConfigStore()
    {
        historyDirectory = Path.Combine(Path.GetDirectoryName(configPath) ?? AppContext.BaseDirectory, "history");
    }

    public async Task<TwinEngineConfig> ReadAsync(CancellationToken cancellationToken)
    {
        await gate.WaitAsync(cancellationToken);
        try
        {
            await EnsureStoreAsync(cancellationToken);
            await using var stream = File.OpenRead(configPath);
            return await JsonSerializer.DeserializeAsync<TwinEngineConfig>(stream, JsonOptions, cancellationToken)
                ?? TwinEngineConfigDefaults.Create();
        }
        finally
        {
            gate.Release();
        }
    }

    public async Task WriteAsync(TwinEngineConfig config, CancellationToken cancellationToken)
    {
        await gate.WaitAsync(cancellationToken);
        try
        {
            await EnsureDirectoryAsync(configPath, cancellationToken);
            var temporaryPath = $"{configPath}.tmp";
            await using (var stream = File.Create(temporaryPath))
            {
                await JsonSerializer.SerializeAsync(stream, config, JsonOptions, cancellationToken);
                await stream.FlushAsync(cancellationToken);
            }

            File.Move(temporaryPath, configPath, true);
            await SaveHistorySnapshotAsync(config, cancellationToken);
        }
        finally
        {
            gate.Release();
        }
    }

    public Task<List<TwinEngineConfigHistoryEntry>> ListHistoryAsync(CancellationToken cancellationToken)
    {
        var entries = EnumerateHistoryFiles()
            .Select(entry => new TwinEngineConfigHistoryEntry(entry.Version, File.GetLastWriteTimeUtc(entry.Path)))
            .OrderByDescending(entry => entry.Version)
            .ToList();
        return Task.FromResult(entries);
    }

    public async Task<TwinEngineConfig?> ReadHistoryAsync(int version, CancellationToken cancellationToken)
    {
        var historyPath = Path.Combine(historyDirectory, HistoryFileName(version));
        if (!File.Exists(historyPath))
            return null;

        await gate.WaitAsync(cancellationToken);
        try
        {
            await using var stream = File.OpenRead(historyPath);
            return await JsonSerializer.DeserializeAsync<TwinEngineConfig>(stream, JsonOptions, cancellationToken);
        }
        finally
        {
            gate.Release();
        }
    }

    public async Task<(string DataEnginePath, string DppPluginPath)> ExportAsync(TwinEngineConfig config, CancellationToken cancellationToken)
    {
        await gate.WaitAsync(cancellationToken);
        try
        {
            await WriteEnvFileAsync(dataEngineExportPath, TwinEngineEnvExporter.ToDataEngineEnvFile(config.DataEngine), cancellationToken);
            await WriteEnvFileAsync(dppPluginExportPath, TwinEngineEnvExporter.ToDppPluginEnvFile(config.DppPlugin), cancellationToken);
            return (dataEngineExportPath, dppPluginExportPath);
        }
        finally
        {
            gate.Release();
        }
    }

    public Task<TwinEngineDataEngineRecreateResult> RecreateDataEngineAsync(CancellationToken cancellationToken) =>
        new TwinEngineDataEngineRecreator().RecreateAsync(dataEngineExportPath, cancellationToken);

    private static async Task WriteEnvFileAsync(string path, string content, CancellationToken cancellationToken)
    {
        await EnsureDirectoryAsync(path, cancellationToken);
        var temporaryPath = $"{path}.tmp";
        await File.WriteAllTextAsync(temporaryPath, content, cancellationToken);
        File.Move(temporaryPath, path, true);
    }

    private async Task SaveHistorySnapshotAsync(TwinEngineConfig config, CancellationToken cancellationToken)
    {
        Directory.CreateDirectory(historyDirectory);
        var historyPath = Path.Combine(historyDirectory, HistoryFileName(config.Version));
        await using (var stream = File.Create(historyPath))
        {
            await JsonSerializer.SerializeAsync(stream, config, JsonOptions, cancellationToken);
        }

        foreach (var entry in EnumerateHistoryFiles().OrderByDescending(entry => entry.Version).Skip(MaxHistoryEntries))
            File.Delete(entry.Path);
    }

    private IEnumerable<(string Path, int Version)> EnumerateHistoryFiles()
    {
        if (!Directory.Exists(historyDirectory))
            yield break;

        foreach (var path in Directory.GetFiles(historyDirectory, "config.v*.json"))
        {
            var match = HistoryFileRegex().Match(Path.GetFileName(path));
            if (match.Success)
                yield return (path, int.Parse(match.Groups[1].Value, CultureInfo.InvariantCulture));
        }
    }

    private static string HistoryFileName(int version) => $"config.v{version}.json";

    [System.Text.RegularExpressions.GeneratedRegex(@"^config\.v(\d+)\.json$")]
    private static partial System.Text.RegularExpressions.Regex HistoryFileRegex();

    private async Task EnsureStoreAsync(CancellationToken cancellationToken)
    {
        await EnsureDirectoryAsync(configPath, cancellationToken);
        if (File.Exists(configPath))
            return;

        await using var stream = File.Create(configPath);
        await JsonSerializer.SerializeAsync(stream, TwinEngineConfigDefaults.Create(), JsonOptions, cancellationToken);
    }

    private static Task EnsureDirectoryAsync(string filePath, CancellationToken cancellationToken)
    {
        var directory = Path.GetDirectoryName(filePath);
        if (directory != null)
            Directory.CreateDirectory(directory);

        return Task.CompletedTask;
    }
}

public sealed class TwinEngineConfig
{
    public int Version { get; set; }
    public TwinEngineDataEngineConfig DataEngine { get; set; } = new();
    public TwinEngineDppPluginConfig DppPlugin { get; set; } = new();
}

public sealed class TwinEngineDataEngineConfig
{
    public List<string> DefaultLanguages { get; set; } = [];
    public List<TwinEngineTemplateMapping> TemplateMappings { get; set; } = [];
    public TwinEngineTemplateMapping ShellTemplateMapping { get; set; } = new();
    public TwinEngineExtractionRule AasIdExtractionRule { get; set; } = new();
}

public sealed class TwinEngineDppPluginConfig
{
    public List<TwinEngineSubmodelNameRule> SubmodelNameRules { get; set; } = [];
    public TwinEngineProductIdExtractionRule ProductIdExtractionRule { get; set; } = new();
}

public sealed class TwinEngineTemplateMapping
{
    public string TemplateId { get; set; } = string.Empty;
    public string Pattern { get; set; } = string.Empty;
}

public sealed class TwinEngineExtractionRule
{
    public string Strategy { get; set; } = string.Empty;
    public string Pattern { get; set; } = string.Empty;
    public int Index { get; set; }
}

public sealed class TwinEngineSubmodelNameRule
{
    public string SubmodelName { get; set; } = string.Empty;
    public List<string> Patterns { get; set; } = [];
}

public sealed class TwinEngineProductIdExtractionRule
{
    public string Pattern { get; set; } = string.Empty;
    public int Index { get; set; }
    public string Strategy { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public static class TwinEngineConfigDefaults
{
    public static TwinEngineConfig Create() => new()
    {
        Version = 1,
        DataEngine = new TwinEngineDataEngineConfig
        {
            DefaultLanguages = ["en", "de"],
            TemplateMappings =
            [
                new() { TemplateId = "https://admin-shell.io/idta/SubmodelTemplate/TechnicalData/2/0", Pattern = "TechnicalData" },
                new() { TemplateId = "https://admin-shell.io/idta/SubmodelTemplate/DigitalNameplate/3/0", Pattern = "Nameplate" },
                new() { TemplateId = "https://admin-shell.io/idta/SubmodelTemplate/MaintenanceInstructions/1/0", Pattern = "MaintenanceInstructions" },
                new() { TemplateId = "https://admin-shell.io/idta/SubmodelTemplate/CarbonFootprint/1/0", Pattern = "CarbonFootprint" },
                new() { TemplateId = "https://admin-shell.io/idta/SubmodelTemplate/HandoverDocumentation/2/0", Pattern = "HandoverDocumentation" },
            ],
            ShellTemplateMapping = new() { TemplateId = "https://mm-software.com/aas/aasTemplate", Pattern = ".+" },
            AasIdExtractionRule = new() { Strategy = "Split", Pattern = "/", Index = 5 },
        },
        DppPlugin = new TwinEngineDppPluginConfig
        {
            SubmodelNameRules =
            [
                new() { SubmodelName = "NamePlate", Patterns = ["Nameplate", "NamePlate"] },
                new() { SubmodelName = "MaintenanceInstructions", Patterns = ["MaintenanceInstructions", "MaintenanceInstruction"] },
                new() { SubmodelName = "HandoverDocumentation", Patterns = ["HandoverDocumentation", "HandoverDocumentations"] },
                new() { SubmodelName = "TechnicalData", Patterns = ["TechnicalData"] },
                new() { SubmodelName = "CarbonFootprint", Patterns = ["CarbonFootprint", "Footprint", "Carbon"] },
            ],
            ProductIdExtractionRule = new() { Pattern = "/", Index = 5, Strategy = "Split", Description = "Standard-Produkt-ID-Extraktion" },
        },
    };
}

public static class TwinEngineConfigValidator
{
    public static List<string> Validate(TwinEngineConfig? config)
    {
        if (config == null)
            return ["Configuration must be an object"];

        var errors = new List<string>();
        ValidateDataEngine(errors, config.DataEngine);
        ValidateDppPlugin(errors, config.DppPlugin);
        return errors;
    }

    private static void ValidateDataEngine(List<string> errors, TwinEngineDataEngineConfig? dataEngine)
    {
        if (dataEngine == null)
        {
            errors.Add("dataEngine must be an object");
            return;
        }

        if (dataEngine.DefaultLanguages == null || dataEngine.DefaultLanguages.Count == 0)
        {
            errors.Add("dataEngine.defaultLanguages must contain at least one entry");
        }
        else
        {
            foreach (var (language, index) in dataEngine.DefaultLanguages.Select((value, index) => (value, index)))
                ValidateText(errors, $"dataEngine.defaultLanguages[{index}]", language);
        }

        foreach (var (mapping, index) in (dataEngine.TemplateMappings ?? []).Select((value, index) => (value, index)))
            ValidateTemplateMapping(errors, $"dataEngine.templateMappings[{index}]", mapping);

        if (dataEngine.ShellTemplateMapping == null)
            errors.Add("dataEngine.shellTemplateMapping must be an object");
        else
            ValidateTemplateMapping(errors, "dataEngine.shellTemplateMapping", dataEngine.ShellTemplateMapping);

        if (dataEngine.AasIdExtractionRule == null)
        {
            errors.Add("dataEngine.aasIdExtractionRule must be an object");
        }
        else
        {
            ValidateText(errors, "dataEngine.aasIdExtractionRule.strategy", dataEngine.AasIdExtractionRule.Strategy);
            ValidateText(errors, "dataEngine.aasIdExtractionRule.pattern", dataEngine.AasIdExtractionRule.Pattern);
        }
    }

    private static void ValidateDppPlugin(List<string> errors, TwinEngineDppPluginConfig? dppPlugin)
    {
        if (dppPlugin == null)
        {
            errors.Add("dppPlugin must be an object");
            return;
        }

        if (dppPlugin.SubmodelNameRules == null || dppPlugin.SubmodelNameRules.Count == 0)
        {
            errors.Add("dppPlugin.submodelNameRules must contain at least one entry");
        }
        else
        {
            foreach (var (rule, index) in dppPlugin.SubmodelNameRules.Select((value, index) => (value, index)))
            {
                ValidateText(errors, $"dppPlugin.submodelNameRules[{index}].submodelName", rule.SubmodelName);
                if (rule.Patterns == null || rule.Patterns.Count == 0)
                {
                    errors.Add($"dppPlugin.submodelNameRules[{index}].patterns must contain at least one entry");
                    continue;
                }

                foreach (var (pattern, patternIndex) in rule.Patterns.Select((value, index) => (value, index)))
                    ValidateText(errors, $"dppPlugin.submodelNameRules[{index}].patterns[{patternIndex}]", pattern);
            }
        }

        if (dppPlugin.ProductIdExtractionRule == null)
        {
            errors.Add("dppPlugin.productIdExtractionRule must be an object");
        }
        else
        {
            ValidateText(errors, "dppPlugin.productIdExtractionRule.pattern", dppPlugin.ProductIdExtractionRule.Pattern);
            ValidateText(errors, "dppPlugin.productIdExtractionRule.strategy", dppPlugin.ProductIdExtractionRule.Strategy);
        }
    }

    private static void ValidateTemplateMapping(List<string> errors, string name, TwinEngineTemplateMapping mapping)
    {
        if (!Uri.TryCreate(mapping.TemplateId, UriKind.Absolute, out _))
            errors.Add($"{name}.templateId must be a valid URL");
        ValidateText(errors, $"{name}.pattern", mapping.Pattern);
    }

    private static void ValidateText(List<string> errors, string name, string? value)
    {
        if (string.IsNullOrWhiteSpace(value) || value.Contains('\r') || value.Contains('\n'))
            errors.Add($"{name} must not be empty or contain line breaks");
    }
}

public static class TwinEngineEnvExporter
{
    private const string DefaultLanguagesPrefix = "Plugins__MultiLanguageProperty__DefaultLanguages__";
    private const string SubmodelTemplateMappingsPrefix = "TemplateManagement__TemplateMappingRules__SubmodelTemplateMappings__";
    private const string ShellTemplateMappingsPrefix = "TemplateManagement__TemplateMappingRules__ShellTemplateMappings__";
    private const string AasIdExtractionRulesPrefix = "TemplateManagement__TemplateMappingRules__AasIdExtractionRules__";

    /// <summary>
    /// Key prefixes fully owned by the data engine export. Existing container env entries with these
    /// prefixes must be dropped on recreate, otherwise removed list entries (e.g. a language) survive.
    /// </summary>
    public static IReadOnlyList<string> DataEngineManagedPrefixes { get; } =
    [
        DefaultLanguagesPrefix,
        SubmodelTemplateMappingsPrefix,
        ShellTemplateMappingsPrefix,
        AasIdExtractionRulesPrefix,
    ];

    public static string ToDataEngineEnvFile(TwinEngineDataEngineConfig dataEngine)
    {
        var env = new Dictionary<string, string>();

        foreach (var (language, index) in dataEngine.DefaultLanguages.Select((value, index) => (value, index)))
            env[$"{DefaultLanguagesPrefix}{index}"] = language;

        foreach (var (mapping, index) in dataEngine.TemplateMappings.Select((value, index) => (value, index)))
        {
            env[$"{SubmodelTemplateMappingsPrefix}{index}__templateId"] = mapping.TemplateId;
            env[$"{SubmodelTemplateMappingsPrefix}{index}__pattern__0"] = mapping.Pattern;
        }

        env[$"{ShellTemplateMappingsPrefix}0__templateId"] = dataEngine.ShellTemplateMapping.TemplateId;
        env[$"{ShellTemplateMappingsPrefix}0__pattern__0"] = dataEngine.ShellTemplateMapping.Pattern;

        env[$"{AasIdExtractionRulesPrefix}0__Strategy"] = dataEngine.AasIdExtractionRule.Strategy;
        env[$"{AasIdExtractionRulesPrefix}0__Pattern"] = dataEngine.AasIdExtractionRule.Pattern;
        env[$"{AasIdExtractionRulesPrefix}0__Index"] = dataEngine.AasIdExtractionRule.Index.ToString(CultureInfo.InvariantCulture);

        return ToEnvFileContent(env);
    }

    public static string ToDppPluginEnvFile(TwinEngineDppPluginConfig dppPlugin)
    {
        var env = new Dictionary<string, string>();

        foreach (var (rule, index) in dppPlugin.SubmodelNameRules.Select((value, index) => (value, index)))
        {
            env[$"ExtractionRules__SubmodelNameExtractionRules__{index}__SubmodelName"] = rule.SubmodelName;
            foreach (var (pattern, patternIndex) in rule.Patterns.Select((value, index) => (value, index)))
                env[$"ExtractionRules__SubmodelNameExtractionRules__{index}__pattern__{patternIndex}"] = pattern;
        }

        env["ExtractionRules__ProductIdExtractionRules__0__Pattern"] = dppPlugin.ProductIdExtractionRule.Pattern;
        env["ExtractionRules__ProductIdExtractionRules__0__Index"] = dppPlugin.ProductIdExtractionRule.Index.ToString(CultureInfo.InvariantCulture);
        env["ExtractionRules__ProductIdExtractionRules__0__Strategy"] = dppPlugin.ProductIdExtractionRule.Strategy;
        env["ExtractionRules__ProductIdExtractionRules__0__Description"] = dppPlugin.ProductIdExtractionRule.Description;

        return ToEnvFileContent(env);
    }

    private static string ToEnvFileContent(Dictionary<string, string> env) =>
        string.Join(Environment.NewLine, env.Select(item => $"{item.Key}={JsonSerializer.Serialize(item.Value)}")) + Environment.NewLine;
}

public sealed record TwinEngineConfigHistoryEntry(int Version, DateTime SavedAtUtc);

public sealed record TwinEngineDataEngineRecreateResult(string ContainerId, string ContainerName);

/// <summary>
/// Recreates the running twinengine-dataengine container via the Docker Engine API so that
/// env vars freshly exported by this plugin (which Docker only reads at container creation) take effect.
/// Requires the Docker socket/API to be reachable from the plugin host process.
/// </summary>
public sealed class TwinEngineDataEngineRecreator
{
    private const string ComposeServiceLabel = "com.docker.compose.service";
    private const string DataEngineServiceName = "twinengine-dataengine";

    private readonly string dockerHost = Environment.GetEnvironmentVariable("TWINENGINE_DOCKER_HOST")
        ?? "unix:///var/run/docker.sock";
    private readonly string configuredContainerName = Environment.GetEnvironmentVariable("TWINENGINE_DATAENGINE_CONTAINER_NAME")
        ?? string.Empty;

    public async Task<TwinEngineDataEngineRecreateResult> RecreateAsync(string envFilePath, CancellationToken cancellationToken)
    {
        using var client = new DockerClientConfiguration(new Uri(dockerHost)).CreateClient();

        var containerId = await FindContainerIdAsync(client, cancellationToken)
            ?? throw new InvalidOperationException($"Container fuer Dienst '{DataEngineServiceName}' wurde nicht gefunden.");

        var inspect = await client.Containers.InspectContainerAsync(containerId, cancellationToken);
        var containerName = inspect.Name.TrimStart('/');
        var fileEnv = ReadEnvFile(envFilePath);
        if (fileEnv.Count == 0)
            throw new InvalidOperationException($"Exportierte Konfiguration '{envFilePath}' fehlt oder ist leer. Bitte zuerst exportieren.");

        var mergedEnv = MergeEnv(inspect.Config.Env, fileEnv, TwinEngineEnvExporter.DataEngineManagedPrefixes);

        await client.Containers.StopContainerAsync(containerId, new ContainerStopParameters(), cancellationToken);
        await client.Containers.RemoveContainerAsync(containerId, new ContainerRemoveParameters { Force = true }, cancellationToken);

        var createParameters = new CreateContainerParameters(inspect.Config)
        {
            Name = containerName,
            Env = mergedEnv,
            HostConfig = inspect.HostConfig,
            NetworkingConfig = BuildNetworkingConfig(inspect.NetworkSettings),
        };

        var created = await client.Containers.CreateContainerAsync(createParameters, cancellationToken);
        await client.Containers.StartContainerAsync(created.ID, new ContainerStartParameters(), cancellationToken);

        return new TwinEngineDataEngineRecreateResult(created.ID, containerName);
    }

    private async Task<string?> FindContainerIdAsync(DockerClient client, CancellationToken cancellationToken)
    {
        var filterValue = string.IsNullOrWhiteSpace(configuredContainerName)
            ? $"{ComposeServiceLabel}={DataEngineServiceName}"
            : configuredContainerName;
        var filterKey = string.IsNullOrWhiteSpace(configuredContainerName) ? "label" : "name";

        var containers = await client.Containers.ListContainersAsync(
            new ContainersListParameters
            {
                All = true,
                Filters = new Dictionary<string, IDictionary<string, bool>>
                {
                    [filterKey] = new Dictionary<string, bool> { [filterValue] = true },
                },
            },
            cancellationToken);

        return containers.FirstOrDefault()?.ID;
    }

    private static IList<string> MergeEnv(
        IList<string> currentEnv,
        IReadOnlyDictionary<string, string> fileEnv,
        IReadOnlyList<string> managedPrefixes)
    {
        var merged = new Dictionary<string, string>(StringComparer.Ordinal);
        foreach (var entry in currentEnv)
        {
            var separatorIndex = entry.IndexOf('=');
            if (separatorIndex <= 0)
                continue;

            var key = entry[..separatorIndex];
            if (managedPrefixes.Any(prefix => key.StartsWith(prefix, StringComparison.Ordinal)))
                continue;

            merged[key] = entry[(separatorIndex + 1)..];
        }

        foreach (var (key, value) in fileEnv)
            merged[key] = value;

        return merged.Select(pair => $"{pair.Key}={pair.Value}").ToList();
    }

    private static Dictionary<string, string> ReadEnvFile(string path)
    {
        var result = new Dictionary<string, string>(StringComparer.Ordinal);
        if (!File.Exists(path))
            return result;

        foreach (var line in File.ReadAllLines(path))
        {
            if (string.IsNullOrWhiteSpace(line))
                continue;

            var separatorIndex = line.IndexOf('=');
            if (separatorIndex <= 0)
                continue;

            result[line[..separatorIndex]] = TryUnquote(line[(separatorIndex + 1)..]);
        }

        return result;
    }

    private static string TryUnquote(string rawValue)
    {
        try
        {
            return JsonSerializer.Deserialize<string>(rawValue) ?? rawValue;
        }
        catch (JsonException)
        {
            return rawValue;
        }
    }

    private static NetworkingConfig BuildNetworkingConfig(NetworkSettings networkSettings)
    {
        var endpoints = networkSettings.Networks.ToDictionary(
            pair => pair.Key,
            pair => new EndpointSettings
            {
                Aliases = pair.Value.Aliases,
                IPAMConfig = pair.Value.IPAMConfig,
            });
        return new NetworkingConfig { EndpointsConfig = endpoints };
    }
}