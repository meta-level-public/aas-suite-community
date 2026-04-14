using AasDesignerAasApi.ProductDesignation;
using AasDesignerAasApi.ProductDesignation.Commands.AddProductDesignation;
using AasDesignerAasApi.ProductDesignation.Commands.DeleteProductDesignation;
using AasDesignerAasApi.ProductDesignation.Commands.UpdateProductDesignation;
using AasDesignerAasApi.ProductDesignation.Queries.GetAllProductDesignations;
using AasDesignerApi.Model;
using AasDesignerAuthorization;
using AasDesignerCommon.Utils;
using AasShared.Controllers;
using AasShared.Exceptions;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AasDesignerAasApi.Controllers;

[ApiController]
[Route("aas-api/[controller]/[action]")]
[ApiExplorerSettings(GroupName = "internal-aas")]
public class ProductDesignationController : InternalApiBaseController
{
    private readonly IServiceProvider _serviceProvider;

    public ProductDesignationController(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    [HttpGet]
    [AasDesignerAuthorize(
        RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
    )]
    public async Task<List<ProductDesignationDto>> GetAllProductDesignations()
    {
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
            throw new UserNotFoundException();

        var mediator = new Mediator(_serviceProvider);

        var query = new GetAllProductDesignationsQuery { AppUser = benutzer };

        return await mediator.Send(query);
    }

    [HttpPost]
    [AasDesignerAuthorize(
        RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
    )]
    public async Task<bool> AddProductDesignation(ProductDesignationDto ProductDesignationDto)
    {
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
            throw new UserNotFoundException();

        var mediator = new Mediator(_serviceProvider);

        var query = new AddProductDesignationCommand
        {
            AppUser = benutzer,
            ProductDesignationDto = ProductDesignationDto,
        };

        return await mediator.Send(query);
    }

    [HttpPost]
    [AasDesignerAuthorize(
        RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
    )]
    public async Task<bool> UpdateProductDesignation(ProductDesignationDto ProductDesignationDto)
    {
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
            throw new UserNotFoundException();

        var mediator = new Mediator(_serviceProvider);

        var command = new UpdateProductDesignationCommand
        {
            AppUser = benutzer,
            ProductDesignationDto = ProductDesignationDto,
        };

        return await mediator.Send(command);
    }

    [HttpDelete]
    [AasDesignerAuthorize(
        RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
    )]
    public async Task<bool> DeleteProductDesignation(long id)
    {
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
            throw new UserNotFoundException();

        var mediator = new Mediator(_serviceProvider);

        var command = new DeleteProductDesignationCommand { AppUser = benutzer, Id = id };

        return await mediator.Send(command);
    }
}
