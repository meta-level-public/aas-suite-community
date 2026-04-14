using AasDesignerAasApi.Infrastructure;
using AasDesignerAasApi.Infrastructure.Commands;
using AasDesignerAasApi.Infrastructure.Commands.ConfigureAndRecreateContainer;
using AasDesignerAasApi.Infrastructure.Commands.ConfigureAndRecreateContainerBulk;
using AasDesignerAasApi.Infrastructure.Commands.CreateInfrastructure;
using AasDesignerAasApi.Infrastructure.Commands.DeleteInfrastructure;
using AasDesignerAasApi.Infrastructure.Commands.EnableInfrastructure;
using AasDesignerAasApi.Infrastructure.Commands.RemoveStack;
using AasDesignerAasApi.Infrastructure.Commands.StartContainer;
using AasDesignerAasApi.Infrastructure.Commands.StopContainer;
using AasDesignerAasApi.Infrastructure.Commands.UpdateInfrastructure;
using AasDesignerAasApi.Infrastructure.Commands.UpdateInfrastructureData;
using AasDesignerAasApi.Infrastructure.Queries;
using AasDesignerAasApi.Infrastructure.Queries.GetAvailableBasyxVersions;
using AasDesignerAasApi.Infrastructure.Queries.GetAvailableInfrastructures;
using AasDesignerAasApi.Infrastructure.Queries.GetInfrastructureDetails;
using AasDesignerAasApi.Infrastructure.Queries.GetInfrastructureStatusList;
using AasDesignerAasApi.Orga.Queries.GetAllSavedInfrastructures;
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
public class AasInfrastructureController : InternalApiBaseController
{
    private readonly IServiceProvider _serviceProvider;

    public AasInfrastructureController(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    [HttpGet]
    [AasDesignerAuthorize(
        RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
    )]
    public async Task<List<AvailableInfastructure>> GetAvailableInfrastructures()
    {
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
            throw new UserNotFoundException();

        var mediator = new Mediator(_serviceProvider);

        var query = new GetAvailableInfastructuresQuery { AppUser = benutzer };

        return await mediator.Send(query);
    }

    [HttpGet]
    [AasDesignerAuthorize(
        RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
    )]
    public async Task<List<AvailableInfastructure>> GetAllSavedInfrastructures()
    {
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
            throw new UserNotFoundException();

        var mediator = new Mediator(_serviceProvider);

        var query = new GetAllSavedInfrastructuresQuery { AppUser = benutzer };

        return await mediator.Send(query);
    }

    [HttpGet]
    [AasDesignerAuthorize(
        RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
    )]
    public async Task<AasInfrastructureSettingsDto?> GetInfrastructureDetails(long id)
    {
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
            throw new UserNotFoundException();

        var mediator = new Mediator(_serviceProvider);

        var query = new GetInfrastructureDetailsQuery { AppUser = benutzer, Id = id };

        return await mediator.Send(query);
    }

    [HttpPost]
    [AasDesignerAuthorize(RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.SYSTEM_ADMIN])]
    public async Task<bool> AddInfrastructure([FromBody] AasInfrastructureSettingsDto settings)
    {
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
            throw new UserNotFoundException();

        var mediator = new Mediator(_serviceProvider);

        var command = new CreateInfrastructureCommand
        {
            AppUser = benutzer,
            AasInfrastructureSettings = settings,
        };
        return await mediator.Send(command);
    }

    [HttpPatch]
    [AasDesignerAuthorize(RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.SYSTEM_ADMIN])]
    public async Task<bool> UpdateInfrastructure([FromBody] AasInfrastructureSettingsDto settings)
    {
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
            throw new UserNotFoundException();

        var mediator = new Mediator(_serviceProvider);

        var command = new UpdateInfrastructureDataCommand
        {
            AppUser = benutzer,
            AasInfrastructureSettings = settings,
        };
        return await mediator.Send(command);
    }

    [HttpDelete]
    [AasDesignerAuthorize(RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.SYSTEM_ADMIN])]
    public async Task<bool> DeleteInfrastructure(long settingId)
    {
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
            throw new UserNotFoundException();

        var mediator = new Mediator(_serviceProvider);

        var command = new DeleteInfrastructureCommand { AppUser = benutzer, SettingId = settingId };
        return await mediator.Send(command);
    }

    [HttpPost]
    [AasDesignerAuthorize(RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.SYSTEM_ADMIN])]
    public async Task<bool> EnableInternalInfrastructure(long infrastructureId)
    {
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
            throw new UserNotFoundException();

        var mediator = new Mediator(_serviceProvider);

        var command = new EnableInternalInfrastructureCommand
        {
            AppUser = benutzer,
            InfrastructureId = infrastructureId,
        };

        return await mediator.Send(command);
    }

    [HttpPost]
    [AasDesignerAuthorize(RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.SYSTEM_ADMIN])]
    public async Task<bool> DisableInternalInfrastructure(long infrastructureId)
    {
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
            throw new UserNotFoundException();

        var mediator = new Mediator(_serviceProvider);

        var command = new DisableInternalInfrastructureCommand
        {
            AppUser = benutzer,
            InfrastructureId = infrastructureId,
        };

        return await mediator.Send(command);
    }

    [HttpPost]
    [AasDesignerAuthorize(RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.SYSTEM_ADMIN])]
    public async Task<bool> UpdateInternalInfrastructure(
        [FromBody] AasInfrastructureSettingsDto settings
    )
    {
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
            throw new UserNotFoundException();

        var mediator = new Mediator(_serviceProvider);

        var command = new UpdateInfrastructureCommand
        {
            AppUser = benutzer,
            AasInfrastructureSettings = settings,
        };

        return await mediator.Send(command);
    }

    [HttpGet]
    [AasDesignerAuthorize(RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.SYSTEM_ADMIN])]
    public async Task<AvailableBasyxVersions> GetAvailableBasyxVersions()
    {
        var mediator = new Mediator(_serviceProvider);

        return await mediator.Send(new GetAvailableBasyxVersionsQuery());
    }

    [HttpGet]
    [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
    public async Task<List<InfrastructureStatus>> GetStatusList()
    {
        var mediator = new Mediator(_serviceProvider);

        return await mediator.Send(new GetInfrastructureStatusListQuery());
    }

    [HttpPost]
    [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
    public async Task<bool> ConfigureAndRecreateContainer(RecreateContainerData data)
    {
        var mediator = new Mediator(_serviceProvider);

        return await mediator.Send(
            new ConfigureAndRecreateContainerCommand { RecreateData = data }
        );
    }

    [HttpPost]
    [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
    public async Task<bool> ConfigureAndRecreateContainerBulk(List<RecreateContainerData> data)
    {
        var mediator = new Mediator(_serviceProvider);

        return await mediator.Send(
            new ConfigureAndRecreateContainerBulkCommand { RecreateList = data }
        );
    }

    [HttpPost]
    [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
    public async Task<bool> StartContainer(string containerName)
    {
        var mediator = new Mediator(_serviceProvider);

        return await mediator.Send(new StartContainerCommand { ContainerName = containerName });
    }

    [HttpPost]
    [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
    public async Task<bool> StopContainer(string containerName)
    {
        var mediator = new Mediator(_serviceProvider);

        return await mediator.Send(new StopContainerCommand { ContainerName = containerName });
    }

    [HttpPost]
    [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
    public async Task<bool> RemoveStack(long infrastructureId)
    {
        var mediator = new Mediator(_serviceProvider);

        return await mediator.Send(new RemoveStackCommand { InfrastructureId = infrastructureId });
    }
}
