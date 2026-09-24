namespace AasDesignerSystemManagementApi.SystemManagement.Model;

public class PluginMenuItemDto
{
    public PluginType Type { get; set; }
    public string Id { get; set; } = string.Empty;
    public string Route { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ShortLabel { get; set; } = string.Empty;
    public string RequiredRole { get; set; } = string.Empty;
    public List<long> OrganizationIds { get; set; } = [];
    public List<string> Roles { get; set; } = [];
    public bool RequiresWritableRepo { get; set; }
    public int SortOrder { get; set; }
    public string Version { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public string AssetPath { get; set; } = string.Empty;
    public string EntryPointPath { get; set; } = string.Empty;
}
