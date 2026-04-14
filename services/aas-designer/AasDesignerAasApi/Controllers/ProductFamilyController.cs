using AasDesignerAasApi.ProductFamily;
using AasDesignerAasApi.ProductFamily.Commands.AddProductFamily;
using AasDesignerAasApi.ProductFamily.Commands.DeleteProductFamily;
using AasDesignerAasApi.ProductFamily.Commands.UpdateProductFamily;
using AasDesignerAasApi.ProductFamily.Queries.GetAllProductFamilies;
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
public class ProductFamilyController : InternalApiBaseController
{
    private readonly IServiceProvider _serviceProvider;

    public ProductFamilyController(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    [HttpGet]
    [AasDesignerAuthorize(
        RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
    )]
    public async Task<List<ProductFamilyDto>> GetAllProductFamilys()
    {
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
            throw new UserNotFoundException();

        var mediator = new Mediator(_serviceProvider);

        var query = new GetAllProductFamiliesQuery { AppUser = benutzer };

        return await mediator.Send(query);
    }

    [HttpPost]
    [AasDesignerAuthorize(
        RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
    )]
    public async Task<bool> AddProductFamily(ProductFamilyDto productFamilyDto)
    {
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
            throw new UserNotFoundException();

        var mediator = new Mediator(_serviceProvider);

        var query = new AddProductFamilyCommand
        {
            AppUser = benutzer,
            ProductFamilyDto = productFamilyDto,
        };

        return await mediator.Send(query);
    }

    [HttpPost]
    [AasDesignerAuthorize(
        RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
    )]
    public async Task<bool> UpdateProductFamily(ProductFamilyDto ProductFamilyDto)
    {
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
            throw new UserNotFoundException();

        var mediator = new Mediator(_serviceProvider);

        var command = new UpdateProductFamilyCommand
        {
            AppUser = benutzer,
            ProductFamilyDto = ProductFamilyDto,
        };

        return await mediator.Send(command);
    }

    [HttpDelete]
    [AasDesignerAuthorize(
        RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
    )]
    public async Task<bool> DeleteProductFamily(long id)
    {
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
            throw new UserNotFoundException();

        var mediator = new Mediator(_serviceProvider);

        var command = new DeleteProductFamilyCommand { AppUser = benutzer, Id = id };

        return await mediator.Send(command);
    }
}
