using AasDesignerAasApi.Package.Commands.ActivatePcnListener;
using AasDesignerAasApi.Package.Commands.DeactivatePcnListener;
using AasDesignerAasApi.Package.Commands.DeletePcnListener;
using AasDesignerAasApi.Package.Commands.DeletePcnUpdateNotification;
using AasDesignerAasApi.Package.Commands.RegisterPcnListener;
using AasDesignerAasApi.Pcn;
using AasDesignerAasApi.Pcn.Commands.RegisterPcnListener;
using AasDesignerAasApi.Pcn.Queries.GetPcnRegistrationInformation;
using AasDesignerAasApi.Pcn.Queries.GetPcnUpdates;
using AasDesignerApi.Model;
using AasDesignerAuthorization;
using AasDesignerCommon.Utils;
using AasDesignerModel.Model;
using AasShared.Controllers;
using AasShared.Exceptions;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AasDesignerAasApi.Controllers;

[ApiController]
[Route("aas-api/[controller]/[action]")]
[ApiExplorerSettings(GroupName = "internal-aas")]
public class PcnController : InternalApiBaseController
{
    private readonly IServiceProvider _serviceProvider;

    public PcnController(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    [HttpGet]
    [AasDesignerAuthorize(
        RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
    )]
    public async Task<PcnInformationDto?> GetPcnRegistrationInformation(string aasIdentifier)
    {
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
            throw new UserNotFoundException();

        var mediator = new Mediator(_serviceProvider);

        var query = new GetPcnRegistrationInformationQuery
        {
            AppUser = benutzer,
            AasIdentifier = aasIdentifier,
        };

        return await mediator.Send(query);
    }

    [HttpPost]
    [AasDesignerAuthorize(
        RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
    )]
    public async Task<bool> RegisterForPcnNotification(
        PcnRegistrationRequest pcnRegistrationRequest
    )
    {
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
            throw new UserNotFoundException();

        var mediator = new Mediator(_serviceProvider);

        var query = new RegisterPcnListenerCommand
        {
            AppUser = benutzer,
            PcnRegistrationRequest = pcnRegistrationRequest,
        };

        return await mediator.Send(query);
    }

    [HttpPost]
    [AasDesignerAuthorize(
        RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
    )]
    public async Task<bool> DeletePcnNotification(long id)
    {
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
            throw new UserNotFoundException();

        var mediator = new Mediator(_serviceProvider);

        var query = new DeletePcnListenerCommand { AppUser = benutzer, Id = id };

        return await mediator.Send(query);
    }

    [HttpPost]
    [AasDesignerAuthorize(
        RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
    )]
    public async Task<bool> ActivatePcnNotification(long id)
    {
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
            throw new UserNotFoundException();

        var mediator = new Mediator(_serviceProvider);

        var query = new ActivatePcnListenerCommand { AppUser = benutzer, Id = id };

        return await mediator.Send(query);
    }

    [HttpPost]
    [AasDesignerAuthorize(
        RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
    )]
    public async Task<bool> DeactivatePcnNotification(long id)
    {
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
            throw new UserNotFoundException();

        var mediator = new Mediator(_serviceProvider);

        var query = new DeactivatePcnListenerCommand { AppUser = benutzer, Id = id };

        return await mediator.Send(query);
    }

    [HttpGet]
    [AasDesignerAuthorize(
        RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
    )]
    public async Task<List<PcnNotificationDto>> GetPcnUpdates()
    {
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
            throw new UserNotFoundException();

        var mediator = new Mediator(_serviceProvider);

        var query = new GetPcnUpdatesQuery { AppUser = benutzer };

        return await mediator.Send(query);
    }

    [HttpPost]
    [AasDesignerAuthorize(
        RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
    )]
    public async Task<bool> DeletePcnUpdateNotification(long id)
    {
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
            throw new UserNotFoundException();

        var mediator = new Mediator(_serviceProvider);

        var query = new DeletePcnUpdateNotificationCommand { AppUser = benutzer, Id = id };

        return await mediator.Send(query);
    }
}
