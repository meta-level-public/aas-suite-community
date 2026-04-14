using AasDesignerApi.Model;
using AasDesignerAuthorization;
using AasDesignerCommon.Utils;
using AasDesignerDashboardApi.Dashboard.Model;
using AasDesignerDashboardApi.Dashboard.Queries.GetDashboard;
using AasDesignerDashboardApi.Dashboard.Queries.GetMyLastAasQuery;
using AasDesignerDashboardApi.Dashboard.Queries.UpdateDashboard;
using AasShared.Controllers;
using AasShared.Exceptions;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace AasDesignerDashboardApi.Controllers;

[ApiController]
[Route("dashboard-api/[controller]/[action]")]
[ApiExplorerSettings(GroupName = "internal-dashboard")]
public class DashboardController : InternalApiBaseController
{
    private readonly IServiceProvider _serviceProvider;

    public DashboardController(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    [HttpGet]
    [AasDesignerAuthorize(RequiredRoles = [AuthRoles.BENUTZER, AuthRoles.ORGA_ADMIN])]
    public async Task<DashboardLayoutDto> GetDashboardLayout()
    {
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser user)
            throw new UserNotFoundException();

        var mediator = new Mediator(_serviceProvider);

        var query = new GetDashboardQuery { AppUser = user };

        return await mediator.Send(query);
    }

    [HttpPatch]
    [AasDesignerAuthorize(RequiredRoles = [AuthRoles.BENUTZER, AuthRoles.ORGA_ADMIN])]
    public async Task UpdateDashboard(DashboardLayoutDto dashboardLayoutDto)
    {
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser user)
            throw new UserNotFoundException();

        var mediator = new Mediator(_serviceProvider);

        var query = new UpdateDashboardCommand
        {
            AppUser = user,
            UpdatedDashboard = dashboardLayoutDto,
        };

        await mediator.Send(query);
    }

    [HttpGet]
    [AasDesignerAuthorize(RequiredRoles = [AuthRoles.BENUTZER, AuthRoles.ORGA_ADMIN])]
    public async Task<List<AdditionalDataSaveShell>> GetMyLastAas()
    {
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser user)
            throw new UserNotFoundException();

        var mediator = new Mediator(_serviceProvider);

        var query = new GetMyLastAasQuery { AppUser = user };

        return await mediator.Send(query);
    }
}
