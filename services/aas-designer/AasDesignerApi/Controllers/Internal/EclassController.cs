using System.Web;
using AasDesignerApi.EClass;
using AasDesignerApi.Exceptions;
using AasDesignerApi.Middleware;
using AasDesignerApi.Model;
using AasDesignerApi.Service;
using AasDesignerAuthorization;
using AasDesignerCommon.Utils;
using AasDesignerModel.Model;
using AasShared.Controllers;
using AasShared.Exceptions;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;

namespace AasDesignerApi.Controllers.Internal
{
    [ApiController]
    [Route("api/[controller]/[action]")]
    [ApiExplorerSettings(GroupName = "internal")]
    public class EClassController : InternalApiBaseController
    {
        private const int DefaultLimitSize = 50;
        private const int DefaultOffsetSize = 0;
        private readonly EClassProxyService _eClassProxyService;
        private readonly EClassService _eClassService;

        public EClassController(EClassProxyService eclassProxyService, EClassService eClassService)
        {
            _eClassProxyService = eclassProxyService;
            _eClassService = eClassService;
        }

        [HttpGet]
        [AasDesignerAuthorize(
            RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
        )]
        public async Task<JObject?> Search(
            string typ,
            string? preferredName,
            string? irdi,
            string language = "de-DE",
            long limit = DefaultLimitSize,
            long offset = DefaultOffsetSize
        )
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser user)
                throw new UserNotFoundException();

            if (irdi != null)
            {
                string urlPart = $"{typ}/{HttpUtility.UrlEncode(irdi)}";

                return await _eClassProxyService.GetResult(
                    user.OrganisationId,
                    urlPart,
                    limit,
                    offset,
                    [],
                    language
                );
            }
            else
            {
                var param = new Dictionary<string, string?> { { "preferredName", preferredName } };

                return await _eClassProxyService.GetResult(
                    user.OrganisationId,
                    typ,
                    limit,
                    offset,
                    param,
                    language
                );
            }
        }

        [HttpGet]
        [AasDesignerAuthorize(
            RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
        )]
        public async Task<JObject?> GetItem(string irdi, string typ, string language = "de-DE")
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();

            string urlPart = $"{typ}/{HttpUtility.UrlEncode(irdi)}";
            var param = new Dictionary<string, string?>();

            return await _eClassProxyService.GetResult(
                benutzer.OrganisationId,
                urlPart,
                1,
                0,
                param,
                language
            );
        }

        [HttpGet]
        [AasDesignerAuthorize(
            RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
        )]
        public async Task<bool> HasEclassCert()
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();
            return await Task.FromResult(
                _eClassProxyService.HasEclassCert(benutzer.OrganisationId)
            );
        }

        [HttpGet]
        [AasDesignerAuthorize(
            RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
        )]
        public async Task<bool> HasEclassImported()
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();
            return await Task.FromResult(_eClassService.HasEclassImported(benutzer));
        }

        [HttpPost]
        [AasDesignerAuthorize(
            RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
        )]
        public async Task<List<string>> CreateProperties([FromBody] List<string> irdis)
        {
            var user =
                HttpContext.Items[AasDesignerConstants.CURRENT_USER] as Model.Benutzer
                ?? throw new UserNotFoundException();
            if (HttpContext.Items["CurrentOrganisation"] is not Organisation orga)
                throw new OrgaNotFoundException();

            return await Task.FromResult(_eClassService.GenerateProperties(user, irdis, orga.Id));
        }

        [HttpGet]
        [AasDesignerAuthorize(
            RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
        )]
        public async Task<List<string>> GetValuelistInfo(string irdi)
        {
            return await Task.FromResult(_eClassService.GetValuelistInfo(irdi));
        }

        [HttpGet]
        [AasDesignerAuthorize(
            RequiredRoles = [
                AuthRoles.ORGA_ADMIN,
                AuthRoles.BENUTZER,
                AuthRoles.SYSTEM_ADMIN,
                AuthRoles.VIEWER_NUTZER,
            ]
        )]
        public async Task<ActionResult<List<EClassProperty>>> FindProperties(string irdiPart)
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser user)
                throw new UserNotFoundException();

            var result = _eClassService.FindProperties(
                user.Benutzer,
                irdiPart,
                user.Organisation.Id
            );

            return await Task.FromResult(Ok(result));
        }
    }
}
