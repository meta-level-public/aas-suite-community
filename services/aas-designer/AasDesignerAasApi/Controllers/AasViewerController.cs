using AasDesignerAasApi.Shells.Queries.GetViewerDescriptor;
using AasDesignerAasApi.Viewer.Queries.GetRawDescriptor;
using AasDesignerApi.Model;
using AasDesignerAuthorization;
using AasDesignerCommon.Utils;
using AasDesignerModel;
using AasShared.Controllers;
using AasShared.Exceptions;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace AasDesignerAasApi.Controllers;

[ApiController]
[Route("aas-viewer-api")]
[ApiExplorerSettings(GroupName = "aas-viewer")]
public class AasViewerController : InternalApiBaseController
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<AasViewerController> _logger;
    private readonly IServiceProvider _serviceProvider;

    public AasViewerController(
        IApplicationDbContext context,
        ILogger<AasViewerController> logger,
        IServiceProvider serviceProvider
    )
    {
        _context = context;
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    [HttpGet]
    [Route("descriptor")]
    [AasDesignerAuthorize(
        RequiredRoles = [
            AuthRoles.VIEWER_NUTZER,
            AuthRoles.BENUTZER,
            AuthRoles.ORGA_ADMIN,
            AuthRoles.SYSTEM_ADMIN,
        ]
    )]
    public async Task<ViewerDescriptor> GetViewerDescriptor(string aasIdentifier)
    {
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
            throw new UserNotFoundException();

        var mediator = new Mediator(_serviceProvider);

        var command = new GetViewerDescriptorQuery
        {
            AppUser = benutzer,
            AasIdentifier = aasIdentifier,
        };

        return await mediator.Send(command);
    }

    [HttpGet]
    [Route("raw-descriptor")]
    [AasDesignerAuthorize(
        RequiredRoles = [AuthRoles.BENUTZER, AuthRoles.ORGA_ADMIN, AuthRoles.SYSTEM_ADMIN]
    )]
    public async Task<RawDescriptor> GetRawDescriptor(string aasIdentifier)
    {
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
            throw new UserNotFoundException();

        var mediator = new Mediator(_serviceProvider);

        var command = new GetRawDescriptorQuery
        {
            AppUser = benutzer,
            AasIdentifier = aasIdentifier,
        };

        return await mediator.Send(command);
    }
}
