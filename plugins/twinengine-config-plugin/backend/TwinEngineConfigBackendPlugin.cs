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
    public TwinEngineGeneral General { get; set; } = new();
    public TwinEnginePlugin Plugin { get; set; } = new();
    public List<TwinEngineTemplateMapping> TemplateMappings { get; set; } = [];
    public TwinEngineIdRules IdRules { get; set; } = new();
    public TwinEngineDppPlugin DppPlugin { get; set; } = new();
}

public sealed class TwinEngineGeneral
{
    public string DataEngineRepositoryBaseUrl { get; set; } = string.Empty;
    public string CustomerDomainUrl { get; set; } = string.Empty;
    public List<string> DefaultLanguages { get; set; } = [];
}

public sealed class TwinEnginePlugin
{
    public string BaseUrl { get; set; } = string.Empty;
    public string HealthEndpoint { get; set; } = string.Empty;
    public string AuthorizationHeader { get; set; } = string.Empty;
    public string OrganizationHeader { get; set; } = string.Empty;
}

public sealed class TwinEngineTemplateMapping
{
    public string TemplateId { get; set; } = string.Empty;
    public string Pattern { get; set; } = string.Empty;
}

public sealed class TwinEngineIdRules
{
    public TwinEngineSplitRule Aas { get; set; } = new();
    public TwinEngineSplitRule Product { get; set; } = new();
}

public sealed class TwinEngineSplitRule
{
    public string Strategy { get; set; } = string.Empty;
    public string Pattern { get; set; } = string.Empty;
    public int Index { get; set; }
}

public sealed class TwinEngineDppPlugin
{
    public string IndexContextPrefix { get; set; } = string.Empty;
    public bool HasShellDescriptor { get; set; }
    public bool HasAssetInformation { get; set; }
    public bool HasAssetIdSearch { get; set; }
    public List<TwinEngineSubmodelNameRule> SubmodelNameRules { get; set; } = [];
    public TwinEngineSplitRule ProductIdRule { get; set; } = new();
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
        General = new()
        {
            DataEngineRepositoryBaseUrl = "http://twinengine-dataengine:8080",
            CustomerDomainUrl = "https://mm-software.com",
            DefaultLanguages = ["en", "de"],
        },
        Plugin = new()
        {
            BaseUrl = "http://dpp-plugin:8080",
            HealthEndpoint = "/healthz",
            AuthorizationHeader = "X-Auth-Token",
            OrganizationHeader = "X-Tenant-Context",
        },
        TemplateMappings =
        [
            new() { TemplateId = "https://admin-shell.io/idta/SubmodelTemplate/TechnicalData/2/0", Pattern = "TechnicalData" },
            new() { TemplateId = "https://admin-shell.io/idta/SubmodelTemplate/DigitalNameplate/3/0", Pattern = "Nameplate" },
            new() { TemplateId = "https://admin-shell.io/idta/SubmodelTemplate/MaintenanceInstructions/1/0", Pattern = "MaintenanceInstructions" },
            new() { TemplateId = "https://admin-shell.io/idta/SubmodelTemplate/CarbonFootprint/1/0", Pattern = "CarbonFootprint" },
            new() { TemplateId = "https://admin-shell.io/idta/SubmodelTemplate/HandoverDocumentation/2/0", Pattern = "HandoverDocumentation" },
        ],
        IdRules = new()
        {
            Aas = new() { Strategy = "Split", Pattern = "/", Index = 5 },
            Product = new() { Strategy = "Split", Pattern = "/", Index = 5 },
        },
        DppPlugin = new()
        {
            IndexContextPrefix = "_aastwinengineindex_",
            HasShellDescriptor = true,
            HasAssetInformation = true,
            HasAssetIdSearch = true,
            SubmodelNameRules =
            [
                new() { SubmodelName = "NamePlate", Patterns = ["Nameplate", "NamePlate"] },
                new() { SubmodelName = "MaintenanceInstructions", Patterns = ["MaintenanceInstructions", "MaintenanceInstruction"] },
                new() { SubmodelName = "HandoverDocumentation", Patterns = ["HandoverDocumentation", "HandoverDocumentations"] },
                new() { SubmodelName = "TechnicalData", Patterns = ["TechnicalData"] },
                new() { SubmodelName = "CarbonFootprint", Patterns = ["CarbonFootprint", "Footprint", "Carbon"] },
            ],
            ProductIdRule = new() { Strategy = "Split", Pattern = "/", Index = 5 },
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
        ValidateUrl(errors, "general.dataEngineRepositoryBaseUrl", config.General?.DataEngineRepositoryBaseUrl);
        ValidateUrl(errors, "general.customerDomainUrl", config.General?.CustomerDomainUrl);
        ValidateUrl(errors, "plugin.baseUrl", config.Plugin?.BaseUrl);

        if (config.General?.DefaultLanguages == null || config.General.DefaultLanguages.Count == 0)
            errors.Add("general.defaultLanguages must contain at least one language");
        if (config.TemplateMappings == null)
            errors.Add("templateMappings must be an array");
        else
            foreach (var (mapping, index) in config.TemplateMappings.Select((value, index) => (value, index)))
                if (string.IsNullOrWhiteSpace(mapping.TemplateId) || string.IsNullOrWhiteSpace(mapping.Pattern))
                    errors.Add($"templateMappings[{index}] requires templateId and pattern");

        ValidateSplitRule(errors, "idRules.aas", config.IdRules?.Aas);
        ValidateSplitRule(errors, "idRules.product", config.IdRules?.Product);
        if (string.IsNullOrWhiteSpace(config.DppPlugin?.IndexContextPrefix))
            errors.Add("dppPlugin.indexContextPrefix is required");
        if (config.DppPlugin?.SubmodelNameRules == null)
            errors.Add("dppPlugin.submodelNameRules must be an array");
        ValidateSplitRule(errors, "dppPlugin.productIdRule", config.DppPlugin?.ProductIdRule);
        return errors;
    }

    private static void ValidateUrl(List<string> errors, string name, string? value)
    {
        if (!Uri.TryCreate(value, UriKind.Absolute, out _))
            errors.Add($"{name} must be a valid URL");
    }

    private static void ValidateSplitRule(List<string> errors, string name, TwinEngineSplitRule? rule)
    {
        if (rule == null || rule.Strategy != "Split" || string.IsNullOrWhiteSpace(rule.Pattern) || rule.Index < 0)
            errors.Add($"{name} has an invalid strategy, pattern, or index");
    }
}

public static class TwinEngineEnvExporter
{
    public static string ToEnvFile(TwinEngineConfig config)
    {
        var env = new Dictionary<string, string>
        {
            ["General__DataEngineRepositoryBaseUrl"] = config.General.DataEngineRepositoryBaseUrl,
            ["General__CustomerDomainUrl"] = config.General.CustomerDomainUrl,
            ["Plugins__MultiLanguageProperty__DefaultLanguages__0"] = config.General.DefaultLanguages.ElementAtOrDefault(0) ?? string.Empty,
            ["Plugins__MultiLanguageProperty__DefaultLanguages__1"] = config.General.DefaultLanguages.ElementAtOrDefault(1) ?? string.Empty,
            ["Plugins__Instances__0__baseUrl"] = config.Plugin.BaseUrl,
            ["Plugins__Instances__0__Name"] = "RelationalDatabasePlugin",
            ["Plugins__Instances__0__healthEndpoint"] = config.Plugin.HealthEndpoint,
            ["Plugins__Instances__0__headerMappings__0__source"] = "Authorization",
            ["Plugins__Instances__0__headerMappings__0__target"] = config.Plugin.AuthorizationHeader,
            ["Plugins__Instances__0__headerMappings__0__required"] = "false",
            ["Plugins__Instances__0__headerMappings__1__source"] = "X-Organization-Id",
            ["Plugins__Instances__0__headerMappings__1__target"] = config.Plugin.OrganizationHeader,
            ["Plugins__Instances__0__headerMappings__1__required"] = "false",
            ["TemplateManagement__TemplateMappingRules__AasIdExtractionRules__0__Strategy"] = config.IdRules.Aas.Strategy,
            ["TemplateManagement__TemplateMappingRules__AasIdExtractionRules__0__Pattern"] = config.IdRules.Aas.Pattern,
            ["TemplateManagement__TemplateMappingRules__AasIdExtractionRules__0__Index"] = config.IdRules.Aas.Index.ToString(),
            ["TemplateManagement__TemplateMappingRules__ShellTemplateMappings__0__templateId"] = "https://mm-software.com/aas/aasTemplate",
            ["TemplateManagement__TemplateMappingRules__ShellTemplateMappings__0__pattern__0"] = ".+",
            ["TemplateManagement__AasTemplateRepository__Name"] = "AasTemplateRepository",
            ["TemplateManagement__AasTemplateRepository__baseUrl"] = "http://aasrepository-go:8080",
            ["TemplateManagement__AasTemplateRepository__headerMappings__0__source"] = "Authorization",
            ["TemplateManagement__AasTemplateRepository__headerMappings__0__target"] = "Authorization",
            ["TemplateManagement__AasTemplateRepository__headerMappings__0__required"] = "false",
            ["TemplateManagement__AasTemplateRepository__healthEndpoint"] = "/health",
            ["TemplateManagement__SubmodelTemplateRepository__Name"] = "SubmodelTemplateRepository",
            ["TemplateManagement__SubmodelTemplateRepository__baseUrl"] = "http://submodelrepository-go:8080",
            ["TemplateManagement__SubmodelTemplateRepository__headerMappings__0__source"] = "Authorization",
            ["TemplateManagement__SubmodelTemplateRepository__headerMappings__0__target"] = "Authorization",
            ["TemplateManagement__SubmodelTemplateRepository__headerMappings__0__required"] = "false",
            ["TemplateManagement__SubmodelTemplateRepository__healthEndpoint"] = "/health",
            ["TemplateManagement__ConceptDescriptionTemplateRepository__Name"] = "ConceptDescriptionTemplateRepository",
            ["TemplateManagement__ConceptDescriptionTemplateRepository__baseUrl"] = "http://conceptdescriptionrepository-go:8080",
            ["TemplateManagement__ConceptDescriptionTemplateRepository__headerMappings__0__source"] = "Authorization",
            ["TemplateManagement__ConceptDescriptionTemplateRepository__headerMappings__0__target"] = "Authorization",
            ["TemplateManagement__ConceptDescriptionTemplateRepository__headerMappings__0__required"] = "false",
            ["TemplateManagement__ConceptDescriptionTemplateRepository__healthEndpoint"] = "/health",
            ["TemplateManagement__AasTemplateRegistry__Name"] = "AasTemplateRegistry",
            ["TemplateManagement__AasTemplateRegistry__baseUrl"] = "http://aasregistry-go:8082",
            ["TemplateManagement__AasTemplateRegistry__headerMappings__0__source"] = "Authorization",
            ["TemplateManagement__AasTemplateRegistry__headerMappings__0__target"] = "Authorization",
            ["TemplateManagement__AasTemplateRegistry__headerMappings__0__required"] = "false",
            ["TemplateManagement__AasTemplateRegistry__healthEndpoint"] = "/health",
            ["TemplateManagement__SubmodelTemplateRegistry__Name"] = "SubmodelTemplateRegistry",
            ["TemplateManagement__SubmodelTemplateRegistry__baseUrl"] = "http://submodelregistry-go:8083",
            ["TemplateManagement__SubmodelTemplateRegistry__headerMappings__0__source"] = "Authorization",
            ["TemplateManagement__SubmodelTemplateRegistry__headerMappings__0__target"] = "Authorization",
            ["TemplateManagement__SubmodelTemplateRegistry__headerMappings__0__required"] = "false",
            ["TemplateManagement__SubmodelTemplateRegistry__healthEndpoint"] = "/health",
            ["ExtractionRules__ProductIdExtractionRules__0__Pattern"] = config.DppPlugin.ProductIdRule.Pattern,
            ["ExtractionRules__ProductIdExtractionRules__0__Index"] = config.DppPlugin.ProductIdRule.Index.ToString(),
            ["ExtractionRules__ProductIdExtractionRules__0__Strategy"] = config.DppPlugin.ProductIdRule.Strategy,
            ["Semantics__IndexContextPrefix"] = config.DppPlugin.IndexContextPrefix,
            ["Capabilities__HasShellDescriptor"] = config.DppPlugin.HasShellDescriptor.ToString().ToLowerInvariant(),
            ["Capabilities__HasAssetInformation"] = config.DppPlugin.HasAssetInformation.ToString().ToLowerInvariant(),
            ["Capabilities__HasAssetIdSearch"] = config.DppPlugin.HasAssetIdSearch.ToString().ToLowerInvariant(),
        };

        foreach (var (mapping, index) in config.TemplateMappings.Select((value, index) => (value, index)))
        {
            env[$"TemplateManagement__TemplateMappingRules__SubmodelTemplateMappings__{index}__templateId"] = mapping.TemplateId;
            env[$"TemplateManagement__TemplateMappingRules__SubmodelTemplateMappings__{index}__pattern__0"] = mapping.Pattern;
        }

        foreach (var (rule, index) in config.DppPlugin.SubmodelNameRules.Select((value, index) => (value, index)))
        {
            env[$"ExtractionRules__SubmodelNameExtractionRules__{index}__SubmodelName"] = rule.SubmodelName;
            foreach (var (pattern, patternIndex) in rule.Patterns.Select((value, index) => (value, index)))
                env[$"ExtractionRules__SubmodelNameExtractionRules__{index}__pattern__{patternIndex}"] = pattern;
        }

        return string.Join(Environment.NewLine, env.Select(item => $"{item.Key}={JsonSerializer.Serialize(item.Value)}")) + Environment.NewLine;
    }
}