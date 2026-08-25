using AasDesignerSystemManagementApi.SystemManagement.Model;
using AasDesignerSystemManagementApi.SystemManagement.Plugins;
using AasShared.Controllers;
using Microsoft.AspNetCore.Mvc;

namespace AasDesignerSystemManagementApi.Controllers;

[ApiController]
[Route("system-management-api/[controller]")]
[ApiExplorerSettings(GroupName = "internal-system-management")]
public class PluginsController : InternalApiBaseController
{
    private readonly IPluginRegistry _pluginRegistry;

    public PluginsController(IPluginRegistry pluginRegistry)
    {
        _pluginRegistry = pluginRegistry;
    }

    [HttpGet("menu-items")]
    public IReadOnlyList<PluginMenuItemDto> GetMenuItems()
    {
        return _pluginRegistry.GetPluginMenuItems();
    }

    [HttpGet("{pluginId}/assets/{**assetPath}")]
    public IActionResult GetAsset(string pluginId, string? assetPath)
    {
        var asset = _pluginRegistry.OpenAsset(pluginId, assetPath);
        if (asset == null)
            return NotFound();

        Response.Headers["X-Frame-Options"] = "SAMEORIGIN";
        return File(asset.Stream, asset.ContentType, enableRangeProcessing: true);
    }
}
