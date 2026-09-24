using AasDesignerApi.Model;
using AasDesignerAuthorization;
using AasDesignerSystemManagementApi.SystemManagement.Model;
using AasDesignerSystemManagementApi.SystemManagement.Plugins;
using AasShared.Controllers;
using AasShared.Utils;
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
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser appUser)
            return [];

        return _pluginRegistry.GetPluginMenuItems(appUser);
    }

    [HttpGet("{pluginId}/assets/{**assetPath}")]
    public IActionResult GetAsset(string pluginId, string? assetPath)
    {
        Response.Headers["X-Frame-Options"] = "SAMEORIGIN";

        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser appUser)
            return NotFound();

        var asset = _pluginRegistry.OpenAsset(appUser, pluginId, assetPath);
        if (asset == null)
            return NotFound();

        return File(asset.Stream, asset.ContentType, enableRangeProcessing: true);
    }
}
