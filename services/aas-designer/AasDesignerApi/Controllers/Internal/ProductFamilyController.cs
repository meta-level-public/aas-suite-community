using AasDesignerApi.Model;
using AasDesignerApi.Service;
using AasDesignerAuthorization;
using AasDesignerCommon.Utils;
using AasShared.Controllers;
using AasShared.Exceptions;
using Microsoft.AspNetCore.Mvc;

namespace AasDesignerApi.Controllers.Internal
{
    [ApiController]
    [Route("api/[controller]/[action]")]
    [ApiExplorerSettings(GroupName = "internal")]
    public class ProductFamilyController : InternalApiBaseController
    {
        private readonly ProductFamilyService _productFamilyService;

        public ProductFamilyController(ProductFamilyService productFamilyService)
        {
            _productFamilyService = productFamilyService;
        }

        [HttpPut]
        [AasDesignerAuthorize(
            RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
        )]
        public async Task<ActionResult<ProductFamily>> Add(ProductFamily productFamily)
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();

            var newProductFamily = new ProductFamily
            {
                BesitzerId = benutzer.BenutzerId,
                Besitzer = benutzer.Benutzer,
            };
            newProductFamily.VerifyInsertAllowed(benutzer);

            return await Task.FromResult(_productFamilyService.Add(benutzer, productFamily));
        }

        [HttpGet]
        [AasDesignerAuthorize(
            RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
        )]
        public async Task<ActionResult<ProductFamily?>> GetById(long id)
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();

            var readProductFamily = _productFamilyService.GetById(id);
            if (readProductFamily != null)
            {
                readProductFamily.VerifyReadAllowed(benutzer);

                return await Task.FromResult(_productFamilyService.GetById(id));
            }
            else
            {
                return BadRequest();
            }
        }

        [HttpGet]
        [AasDesignerAuthorize(
            RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
        )]
        public async Task<ActionResult<List<ProductFamily>>> GetProductFamilys()
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();

            var readProductFamily = new ProductFamily()
            {
                BesitzerId = benutzer.BenutzerId,
                Besitzer = benutzer.Benutzer,
            };
            readProductFamily.VerifyReadAllowed(benutzer);

            return await Task.FromResult(_productFamilyService.GetProductFamilys(benutzer));
        }

        [HttpDelete]
        [AasDesignerAuthorize(
            RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
        )]
        public async Task<ActionResult<bool>> Remove(long id)
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();

            var removeProductFamily = _productFamilyService.GetById(id);
            if (removeProductFamily != null)
            {
                removeProductFamily.VerifyDeleteAllowed(benutzer);

                return await Task.FromResult(_productFamilyService.Remove(id));
            }
            else
            {
                return BadRequest();
            }
        }

        [HttpPatch]
        [AasDesignerAuthorize]
        public async Task<ActionResult<bool>> Update(ProductFamily productFamily)
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();

            if (productFamily.Id == null)
                throw new InvalidDataException("Id is required");
            var updateProductFamily = _productFamilyService.GetById(productFamily.Id.Value);
            if (updateProductFamily != null)
            {
                updateProductFamily.VerifyUpdateAllowed(benutzer);

                return await Task.FromResult(
                    _productFamilyService.Update(benutzer.Benutzer, productFamily)
                );
            }
            else
            {
                return BadRequest();
            }
        }
    }
}
