using AasDesignerApi.Model;
using AasDesignerAuthorization;
using AasDesignerCommon.Utils;
using AasDesignerSharedLinksApi.SharedLinks.Commands.CheckValidity;
using AasDesignerSharedLinksApi.SharedLinks.Commands.CreateSharedLink;
using AasDesignerSharedLinksApi.SharedLinks.Commands.DeleteSharedLink;
using AasDesignerSharedLinksApi.SharedLinks.Queries.GetMySharedLinks;
using AasShared.Controllers;
using AasShared.Exceptions;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace AasDesignerSharedLinksApi.Controllers;

[ApiController]
[Route("shared-links-api/[controller]/[action]")]
[ApiExplorerSettings(GroupName = "internal-sharedlinks")]
public class SharedLinksController : InternalApiBaseController
{
    private readonly IServiceProvider _serviceProvider;

    public SharedLinksController(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    [HttpGet]
    [AasDesignerAuthorize(
        RequiredRoles = [AuthRoles.SYSTEM_ADMIN, AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER]
    )]
    public async Task<List<MySharedLink>> GetMySharedLinks()
    {
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser user)
            throw new UserNotFoundException();

        var mediator = new Mediator(_serviceProvider);

        var query = new GetMySharedLinksQuery { AppUser = user };

        return await mediator.Send(query);
    }

    [HttpPost]
    [AasDesignerAuthorize(
        RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
    )]
    public async Task<string> CreateSharedLink(CreateSharedLink createSharedLinkData)
    {
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
            throw new UserNotFoundException();

        var mediator = new Mediator(_serviceProvider);

        var command = new ShareAasCommand
        {
            AppUser = benutzer,
            CreateSharedLink = createSharedLinkData,
        };

        return await mediator.Send(command);
    }

    [HttpDelete]
    [AasDesignerAuthorize(
        RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
    )]
    public async Task<bool> DeleteSharedLink(long id)
    {
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
            throw new UserNotFoundException();

        var mediator = new Mediator(_serviceProvider);

        var command = new DeleteSharedLinkCommand { AppUser = benutzer, Id = id };

        return await mediator.Send(command);
    }

    [HttpGet]
    [AasDesignerAuthorize]
    [AllowAnonymous]
    public async Task<ActionResult<PublicViewerValidity>> CheckValidity(string guidString)
    {
        var mediator = new Mediator(_serviceProvider);

        var command = new CheckValidityCommand { SharedLinkGuid = Guid.Parse(guidString) };

        return await mediator.Send(command);
    }
}
