using AasDesignerAasApi.Settings.Queries.GetViewerSettings;
using AasDesignerApi.Model;
using AasDesignerAuthorization;
using AasDesignerCommon.Utils;
using AasDesignerSystemManagementApi.Settings.Queries.GetViewerSettings;
using AasShared.Controllers;
using AasShared.Exceptions;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AasDesignerSystemManagementApi.Controllers;

[ApiController]
[Route("aas-api/[controller]/[action]")]
[ApiExplorerSettings(GroupName = "internal-aas")]
public class SettingsController : InternalApiBaseController
{
    private readonly IServiceProvider _serviceProvider;

    public SettingsController(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    [HttpGet]
    [AasDesignerAuthorize(
        RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
    )]
    public async Task<ViewerSettingsDto> GetViewerSettings(long infrastructureId)
    {
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
            throw new UserNotFoundException();

        var mediator = new Mediator(_serviceProvider);

        var query = new GetViewerSettingsQuery
        {
            AppUser = benutzer,
            InfrastructureId = infrastructureId,
        };

        return await mediator.Send(query);
    }
}
