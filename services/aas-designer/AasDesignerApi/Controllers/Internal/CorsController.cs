using AasDesignerApi.Model;
using AasDesignerAuthorization;
using AasShared.Controllers;
using Microsoft.AspNetCore.Mvc;
using VwsPortalApi.Cors;

namespace AasDesignerApi.Controllers.Internal
{
    [ApiController]
    [Route("api/[controller]/[action]")]
    [ApiExplorerSettings(GroupName = "internal")]
    public class CorsController : InternalApiBaseController
    {
        private readonly CorsService _corsService;

        public CorsController(CorsService corsService)
        {
            _corsService = corsService;
        }

        [HttpGet]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
        public async Task<List<CorsConfig>> GetAll()
        {
            return await Task.FromResult(_corsService.GetAll());
        }

        [HttpPut]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
        public async Task<bool> Create(CorsConfig config)
        {
            return await Task.FromResult(_corsService.CreateConfig(config));
        }

        [HttpPatch]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
        public async Task<bool> Update(CorsConfig config)
        {
            return await Task.FromResult(_corsService.UpdateConfig(config));
        }

        [HttpDelete]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
        public async Task<bool> Delete(long id)
        {
            return await Task.FromResult(_corsService.DeleteConfig(id));
        }
    }
}
