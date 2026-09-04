using System.Text.Json.Serialization;

namespace AasDesignerSystemManagementApi.SystemManagement.Model;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum PluginType
{
    GuiApp,
    SubmodelViewer,
    SaveInterceptor,
}

public class PluginManifestDto
{
    public int ManifestVersion { get; set; }
    public PluginType? Type { get; set; }
    public string Id { get; set; } = string.Empty;
    public string Route { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public string EntryPoint { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ShortLabel { get; set; } = string.Empty;
    public string RequiredRole { get; set; } = string.Empty;
    public List<long> OrganizationIds { get; set; } = [];
    public List<string> Roles { get; set; } = [];
    public bool RequiresWritableRepo { get; set; }
    public int SortOrder { get; set; }
    public string Version { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public PluginBackendManifestDto? Backend { get; set; }
}

public class PluginBackendManifestDto
{
    public string Assembly { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
}
