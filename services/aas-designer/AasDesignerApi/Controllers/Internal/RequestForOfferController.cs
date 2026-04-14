using AasDesignerApi.Model;
using AasDesignerAuthorization;
using AasShared.Controllers;
using Microsoft.AspNetCore.Mvc;
using VwsPortalApi.RequestForOffer;

namespace AasDesignerApi.Controllers.Internal
{
    [ApiController]
    [Route("api/[controller]/[action]")]
    [ApiExplorerSettings(GroupName = "internal")]
    public class RequestForOfferController : InternalApiBaseController
    {
        private readonly RequestForOfferService _requestService;

        public RequestForOfferController(RequestForOfferService requestService)
        {
            _requestService = requestService;
        }

        [HttpGet]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
        public async Task<List<RequestForOffer>> GetAll()
        {
            return await Task.FromResult(_requestService.GetAll());
        }

        [HttpDelete]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
        public async Task<bool> Delete(long id)
        {
            return await Task.FromResult(_requestService.DeleteRequest(id));
        }
    }
}
