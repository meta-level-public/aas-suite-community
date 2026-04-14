using AasDesignerApi.Idta;
using AasDesignerApi.Model;
using AasDesignerApi.Service;
using AasDesignerAuthorization;
using AasShared.Controllers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;

namespace AasDesignerApi.Controllers.Internal
{
    [ApiController]
    [Route("api/[controller]/[action]")]
    [ApiExplorerSettings(GroupName = "internal")]
    public class IdtaController : InternalApiBaseController
    {
        private readonly IdtaService _idtaService;

        public IdtaController(IdtaService idtaService)
        {
            _idtaService = idtaService;
        }

        [HttpGet]
        [AasDesignerAuthorize(
            RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
        )]
        public async Task<List<IdtaItem>> GetTree()
        {
            return await Task.FromResult(_idtaService.GetTree());
        }

        [HttpGet]
        [AasDesignerAuthorize(
            RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
        )]
        public async Task<FileContentResult> GetFile(string filename)
        {
            byte[] imgdata = _idtaService.GetFile(filename);
            new FileExtensionContentTypeProvider().TryGetContentType(
                filename,
                out string? contentType
            );
            return await Task.FromResult(File(imgdata, contentType ?? "application/octet-strean"));
        }
    }
}
