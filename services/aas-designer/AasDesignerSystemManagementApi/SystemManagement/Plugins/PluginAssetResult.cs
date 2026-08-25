namespace AasDesignerSystemManagementApi.SystemManagement.Plugins;

public sealed class PluginAssetResult
{
    public required Stream Stream { get; init; }
    public required string ContentType { get; init; }
    public required string FileName { get; init; }
}
