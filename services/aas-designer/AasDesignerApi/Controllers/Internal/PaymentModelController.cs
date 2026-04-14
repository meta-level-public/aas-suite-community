using AasDesignerApi.Model;
using AasDesignerApi.PaymentModel;
using AasDesignerAuthorization;
using AasShared.Controllers;
using Microsoft.AspNetCore.Mvc;

namespace AasDesignerApi.Controllers.Internal
{
    [ApiController]
    [Route("api/[controller]/[action]")]
    [ApiExplorerSettings(GroupName = "internal")]
    public class PaymentModelController : InternalApiBaseController
    {
        private readonly PaymentModelService _paymentService;

        public PaymentModelController(PaymentModelService paymentService)
        {
            _paymentService = paymentService;
        }

        [HttpGet]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
        public async Task<List<Model.PaymentModel>> GetAll()
        {
            return await Task.FromResult(_paymentService.GetAll());
        }

        [HttpGet]
        public async Task<List<Model.PaymentModel>> GetAllUserSelectable()
        {
            return await Task.FromResult(_paymentService.GetAllUserSelectable());
        }

        [HttpPut]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
        public async Task<Model.PaymentModel> Add(Model.PaymentModel paymentModel)
        {
            return await Task.FromResult(_paymentService.Add(paymentModel));
        }

        [HttpDelete]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
        public async Task<bool> Delete(long id)
        {
            return await Task.FromResult(_paymentService.Remove(id));
        }

        [HttpPatch]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
        public async Task<bool> Update(Model.PaymentModel paymentModel)
        {
            return await Task.FromResult(_paymentService.Update(paymentModel));
        }

        [HttpGet]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
        public async Task<Model.PaymentModel> GetById(long id)
        {
            return await Task.FromResult(_paymentService.GetById(id));
        }
    }
}
