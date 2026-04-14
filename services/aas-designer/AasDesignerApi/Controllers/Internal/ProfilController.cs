using AasDesignerApi.Benutzer;
using AasDesignerApi.Model;
using AasDesignerApi.Model.Client;
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
    public class ProfilController : InternalApiBaseController
    {
        private readonly BenutzerService _benutzerService;

        public ProfilController(BenutzerService benutzerService)
        {
            _benutzerService = benutzerService;
        }

        [HttpPost]
        [AasDesignerAuthorize(
            RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
        )]
        public async Task<ActionResult<bool>> UpdateProfil(ProfilDto profile)
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();
            return await Task.FromResult(_benutzerService.UpdateProfil(profile, benutzer.Benutzer));
        }
    }
}
