using System.Text.Json;
using AasSuitePluginAbstractions;
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

            var exportPath = await store.ExportAsync(config, cancellationToken);
            return Results.Ok(new { exported = true, version = config.Version, path = exportPath });
        });
    }
}

public sealed class TwinEngineConfigStore
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        WriteIndented = true,
    };

    private readonly SemaphoreSlim gate = new(1, 1);
    private readonly string configPath = Environment.GetEnvironmentVariable("TWINENGINE_CONFIG_PATH")
        ?? Path.Combine(AppContext.BaseDirectory, "twinengine-config", "config.json");
    private readonly string exportPath = Environment.GetEnvironmentVariable("TWINENGINE_EXPORT_PATH")
        ?? Path.Combine(AppContext.BaseDirectory, "twinengine-config", "twinengine-dataengine.env");

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
        }
        finally
        {
            gate.Release();
        }
    }

    public async Task<string> ExportAsync(TwinEngineConfig config, CancellationToken cancellationToken)
    {
        await gate.WaitAsync(cancellationToken);
        try
        {
            await EnsureDirectoryAsync(exportPath, cancellationToken);
            var temporaryPath = $"{exportPath}.tmp";
            await File.WriteAllTextAsync(temporaryPath, TwinEngineEnvExporter.ToEnvFile(config), cancellationToken);
            File.Move(temporaryPath, exportPath, true);
            return exportPath;
        }
        finally
        {
            gate.Release();
        }
    }

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
    public List<TwinEngineTemplateMapping> TemplateMappings { get; set; } = [];
    public List<TwinEngineSubmodelNameRule> SubmodelNameRules { get; set; } = [];
}

public sealed class TwinEngineTemplateMapping
{
    public string TemplateId { get; set; } = string.Empty;
    public string Pattern { get; set; } = string.Empty;
}

public sealed class TwinEngineSubmodelNameRule
{
    public string SubmodelName { get; set; } = string.Empty;
    public List<string> Patterns { get; set; } = [];
}

public static class TwinEngineConfigDefaults
{
    public static TwinEngineConfig Create() => new()
    {
        Version = 1,
        TemplateMappings =
        [
            new() { TemplateId = "https://admin-shell.io/idta/SubmodelTemplate/TechnicalData/2/0", Pattern = "TechnicalData" },
            new() { TemplateId = "https://admin-shell.io/idta/SubmodelTemplate/DigitalNameplate/3/0", Pattern = "Nameplate" },
            new() { TemplateId = "https://admin-shell.io/idta/SubmodelTemplate/MaintenanceInstructions/1/0", Pattern = "MaintenanceInstructions" },
            new() { TemplateId = "https://admin-shell.io/idta/SubmodelTemplate/CarbonFootprint/1/0", Pattern = "CarbonFootprint" },
            new() { TemplateId = "https://admin-shell.io/idta/SubmodelTemplate/HandoverDocumentation/2/0", Pattern = "HandoverDocumentation" },
        ],
        SubmodelNameRules =
        [
            new() { SubmodelName = "NamePlate", Patterns = ["Nameplate", "NamePlate"] },
            new() { SubmodelName = "MaintenanceInstructions", Patterns = ["MaintenanceInstructions", "MaintenanceInstruction"] },
            new() { SubmodelName = "HandoverDocumentation", Patterns = ["HandoverDocumentation", "HandoverDocumentations"] },
            new() { SubmodelName = "TechnicalData", Patterns = ["TechnicalData"] },
            new() { SubmodelName = "CarbonFootprint", Patterns = ["CarbonFootprint", "Footprint", "Carbon"] },
        ],
    };
}

public static class TwinEngineConfigValidator
{
    public static List<string> Validate(TwinEngineConfig? config)
    {
        if (config == null)
            return ["Configuration must be an object"];

        var errors = new List<string>();
        ValidateTemplateMappings(errors, config.TemplateMappings);
        ValidateSubmodelNameRules(errors, config.SubmodelNameRules);
        return errors;
    }

    private static void ValidateTemplateMappings(List<string> errors, List<TwinEngineTemplateMapping>? mappings)
    {
        if (mappings == null || mappings.Count != 5)
        {
            errors.Add("templateMappings must contain exactly five entries");
            return;
        }

        foreach (var (mapping, index) in mappings.Select((value, index) => (value, index)))
        {
            if (!Uri.TryCreate(mapping.TemplateId, UriKind.Absolute, out _))
                errors.Add($"templateMappings[{index}].templateId must be a valid URL");
            ValidateText(errors, $"templateMappings[{index}].pattern", mapping.Pattern);
        }
    }

    private static void ValidateSubmodelNameRules(List<string> errors, List<TwinEngineSubmodelNameRule>? rules)
    {
        var patternCounts = new[] { 2, 2, 2, 1, 3 };
        if (rules == null || rules.Count != patternCounts.Length)
        {
            errors.Add("submodelNameRules must contain exactly five entries");
            return;
        }

        foreach (var (rule, index) in rules.Select((value, index) => (value, index)))
        {
            ValidateText(errors, $"submodelNameRules[{index}].submodelName", rule.SubmodelName);
            if (rule.Patterns == null || rule.Patterns.Count != patternCounts[index])
            {
                errors.Add($"submodelNameRules[{index}].patterns must contain exactly {patternCounts[index]} entries");
                continue;
            }

            foreach (var (pattern, patternIndex) in rule.Patterns.Select((value, index) => (value, index)))
                ValidateText(errors, $"submodelNameRules[{index}].patterns[{patternIndex}]", pattern);
        }
    }

    private static void ValidateText(List<string> errors, string name, string? value)
    {
        if (string.IsNullOrWhiteSpace(value) || value.Contains('\r') || value.Contains('\n'))
            errors.Add($"{name} must not be empty or contain line breaks");
    }
}

public static class TwinEngineEnvExporter
{
    public static string ToEnvFile(TwinEngineConfig config)
    {
        var env = new Dictionary<string, string>();

        foreach (var (mapping, index) in config.TemplateMappings.Select((value, index) => (value, index)))
        {
            env[$"TemplateManagement__TemplateMappingRules__SubmodelTemplateMappings__{index}__templateId"] = mapping.TemplateId;
            env[$"TemplateManagement__TemplateMappingRules__SubmodelTemplateMappings__{index}__pattern__0"] = mapping.Pattern;
        }

        foreach (var (rule, index) in config.SubmodelNameRules.Select((value, index) => (value, index)))
        {
            env[$"ExtractionRules__SubmodelNameExtractionRules__{index}__SubmodelName"] = rule.SubmodelName;
            foreach (var (pattern, patternIndex) in rule.Patterns.Select((value, index) => (value, index)))
                env[$"ExtractionRules__SubmodelNameExtractionRules__{index}__pattern__{patternIndex}"] = pattern;
        }

        return string.Join(Environment.NewLine, env.Select(item => $"{item.Key}={JsonSerializer.Serialize(item.Value)}")) + Environment.NewLine;
    }
}