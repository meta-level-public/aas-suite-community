namespace AasDesignerSystemManagementApi.SystemManagement.Model;

public class PluginManifestDto
{
    public int ManifestVersion { get; set; }
    public string Id { get; set; } = string.Empty;
    public string Route { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public string EntryPoint { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ShortLabel { get; set; } = string.Empty;
    public string RequiredRole { get; set; } = string.Empty;
    public bool RequiresWritableRepo { get; set; }
    public int SortOrder { get; set; }
    public string Version { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
}
