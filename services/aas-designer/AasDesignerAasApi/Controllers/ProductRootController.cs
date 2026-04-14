using AasDesignerAasApi.ProductRoot;
using AasDesignerAasApi.ProductRoot.Commands.AddProductRoot;
using AasDesignerAasApi.ProductRoot.Commands.DeleteProductRoot;
using AasDesignerAasApi.ProductRoot.Commands.UpdateProductRoot;
using AasDesignerAasApi.ProductRoot.Queries.GetAllProductRoots;
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
public class ProductRootController : InternalApiBaseController
{
    private readonly IServiceProvider _serviceProvider;

    public ProductRootController(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    [HttpGet]
    [AasDesignerAuthorize(
        RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
    )]
    public async Task<List<ProductRootDto>> GetAllProductRoots()
    {
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
            throw new UserNotFoundException();

        var mediator = new Mediator(_serviceProvider);

        var query = new GetAllProductRootsQuery { AppUser = benutzer };

        return await mediator.Send(query);
    }

    [HttpPost]
    [AasDesignerAuthorize(
        RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
    )]
    public async Task<bool> AddProductRoot(ProductRootDto productRootDto)
    {
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
            throw new UserNotFoundException();

        var mediator = new Mediator(_serviceProvider);

        var query = new AddProductRootCommand
        {
            AppUser = benutzer,
            ProductRootDto = productRootDto,
        };

        return await mediator.Send(query);
    }

    [HttpPost]
    [AasDesignerAuthorize(
        RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
    )]
    public async Task<bool> UpdateProductRoot(ProductRootDto productRootDto)
    {
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
            throw new UserNotFoundException();

        var mediator = new Mediator(_serviceProvider);

        var command = new UpdateProductRootCommand
        {
            AppUser = benutzer,
            ProductRootDto = productRootDto,
        };

        return await mediator.Send(command);
    }

    [HttpDelete]
    [AasDesignerAuthorize(
        RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
    )]
    public async Task<bool> DeleteProductRoot(long id)
    {
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
            throw new UserNotFoundException();

        var mediator = new Mediator(_serviceProvider);

        var command = new DeleteProductRootCommand { AppUser = benutzer, Id = id };

        return await mediator.Send(command);
    }
}
