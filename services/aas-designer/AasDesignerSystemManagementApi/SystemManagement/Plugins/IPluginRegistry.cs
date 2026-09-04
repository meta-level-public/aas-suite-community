using AasDesignerApi.Model;
using AasDesignerSystemManagementApi.SystemManagement.Model;

namespace AasDesignerSystemManagementApi.SystemManagement.Plugins;

public interface IPluginRegistry
{
    IReadOnlyList<PluginMenuItemDto> GetPluginMenuItems(AppUser appUser);
    PluginAssetResult? OpenAsset(AppUser appUser, string pluginId, string? assetPath);
}
