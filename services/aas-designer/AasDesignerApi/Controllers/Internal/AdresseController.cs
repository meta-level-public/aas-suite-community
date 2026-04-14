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
    public class AdresseController : InternalApiBaseController
    {
        private readonly AdresseService _addresseService;

        public AdresseController(AdresseService ddresseService)
        {
            _addresseService = ddresseService;
        }

        [HttpGet]
        [AasDesignerAuthorize(
            RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
        )]
        public async Task<ActionResult<List<Adresse>>> GetAdressen()
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();
            var readAdress = new Adresse
            {
                BesitzerId = benutzer.BenutzerId,
                Besitzer = benutzer.Benutzer,
            };
            readAdress.VerifyReadAllowed(benutzer);
            return await Task.FromResult(_addresseService.GetAdressen(benutzer));
        }

        [HttpPut]
        [AasDesignerAuthorize(
            RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
        )]
        public async Task<ActionResult<Adresse>> Add(Adresse adresse)
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();
            var insertAdress = new Adresse
            {
                BesitzerId = benutzer.BenutzerId,
                Besitzer = benutzer.Benutzer,
            };
            insertAdress.VerifyInsertAllowed(benutzer);
            return await Task.FromResult(_addresseService.Add(benutzer, adresse));
        }

        [HttpDelete]
        [AasDesignerAuthorize(
            RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
        )]
        public async Task<ActionResult<bool>> Remove(long id)
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();
            var removeAdress = _addresseService.GetAdressById(id);

            if (removeAdress != null)
            {
                removeAdress.VerifyDeleteAllowed(benutzer);
                return await Task.FromResult(_addresseService.Remove(id));
            }
            else
            {
                return BadRequest();
            }
        }

        [HttpPatch]
        [AasDesignerAuthorize(
            RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
        )]
        public async Task<ActionResult<bool>> Update(Adresse adresse)
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();
            var updateAdress = _addresseService.GetAdressById(adresse.Id);

            if (updateAdress != null)
            {
                updateAdress.VerifyUpdateAllowed(benutzer);
                return await Task.FromResult(_addresseService.Update(benutzer.Benutzer, adresse));
            }
            else
            {
                return BadRequest();
            }
        }

        [HttpGet]
        [AasDesignerAuthorize]
        public async Task<ActionResult<Adresse?>> GetById(long addressId)
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();

            var readAdress = _addresseService.GetAdressById(addressId);

            if (readAdress != null)
            {
                readAdress.VerifyReadAllowed(benutzer);
                return await Task.FromResult(
                    _addresseService.GetAdressByIdFromOrganisationUser(addressId)
                );
            }
            else
            {
                return BadRequest();
            }
        }
    }
}
