using AasDesignerSystemManagementApi.SystemManagement.Model;

namespace AasDesignerSystemManagementApi.SystemManagement.Plugins;

public interface IPluginRegistry
{
    IReadOnlyList<PluginMenuItemDto> GetPluginMenuItems();
    PluginAssetResult? OpenAsset(string pluginId, string? assetPath);
}
