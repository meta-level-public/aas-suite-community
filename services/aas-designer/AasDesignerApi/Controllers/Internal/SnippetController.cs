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
    public class SnippetController : InternalApiBaseController
    {
        private readonly SnippetService _snippetService;

        public SnippetController(SnippetService snippetService)
        {
            _snippetService = snippetService;
        }

        [HttpPut]
        [AasDesignerAuthorize(
            RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
        )]
        public async Task<bool> Add(IFormCollection data)
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();
            Snippet snippet = new()
            {
                BesitzerId = benutzer.BenutzerId,
                Besitzer = benutzer.Benutzer,
            };
            snippet.VerifyInsertAllowed(benutzer);
            return await Task.FromResult(_snippetService.Save(data, benutzer));
        }

        [HttpGet]
        [AasDesignerAuthorize(
            RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
        )]
        public async Task<Snippet?> GetSnippetById(long id)
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();
            var snippet = await Task.FromResult(_snippetService.GetById(id));
            if (snippet != null)
            {
                snippet.VerifyReadAllowed(benutzer);
                return await Task.FromResult(_snippetService.GetById(id));
            }
            return null;
        }

        [HttpGet]
        [AasDesignerAuthorize(
            RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
        )]
        public async Task<List<Snippet>> GetSnippets(AasMetamodelVersion version)
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();
            Snippet readSubmodels = new()
            {
                BesitzerId = benutzer.BenutzerId,
                Besitzer = benutzer.Benutzer,
            };
            readSubmodels.VerifyReadAllowed(benutzer);
            return await Task.FromResult(
                _snippetService.GetSnippetsByOrganisation(benutzer, version)
            );
        }

        [HttpDelete]
        [AasDesignerAuthorize(
            RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
        )]
        public async Task<bool> Delete(long id)
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();

            var snippet = await Task.FromResult(_snippetService.GetById(id));

            if (snippet != null)
            {
                snippet.VerifyDeleteAllowed(benutzer);
                return await Task.FromResult(_snippetService.DeleteById(id));
            }
            else
            {
                return false;
            }
        }

        [HttpGet]
        [AasDesignerAuthorize(
            RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
        )]
        public async Task<ActionResult> Share(int id)
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();
            return await Task.FromResult(Ok(_snippetService.Share(benutzer.Benutzer, id)));
        }

        [HttpGet]
        [AasDesignerAuthorize(
            RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
        )]
        public async Task<ActionResult> Unshare(int id)
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();
            return await Task.FromResult(Ok(_snippetService.Unshare(benutzer.Benutzer, id)));
        }
    }
}
