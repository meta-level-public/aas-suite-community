using AasDesignerApi.Model;
using AasDesignerAuthorization;
using AasShared.Controllers;
using Microsoft.AspNetCore.Mvc;

namespace AasDesignerApi.Controllers.Internal
{
    [ApiController]
    [Route("api/[controller]/[action]")]
    [ApiExplorerSettings(GroupName = "internal")]
    public class ValidatorsController : InternalApiBaseController
    {
        [HttpGet]
        [AasDesignerAuthorize(
            RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
        )]
        public async Task<ActionResult<bool>> ValidateUri(string? value)
        {
            if (value == null)
                return await Task.FromResult(true);
            try
            {
                new Uri(value.ToString());
                return await Task.FromResult(true);
            }
            catch
            {
                return await Task.FromResult(false);
            }
        }
    }
}
