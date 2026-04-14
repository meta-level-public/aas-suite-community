using AasDesignerApi.Benutzer;
using AasDesignerApi.Invoice;
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
    public class InvoiceController : InternalApiBaseController
    {
        private readonly InvoiceService _invoiceService;

        public InvoiceController(
            InvoiceService invoiceService,
            EclassCertificateService eclassCertificateService,
            BenutzerService benutzerService
        )
        {
            _invoiceService = invoiceService;
        }

        [HttpGet]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
        public async Task<List<OrgaRechnung>> Generate(string rechnungsMonatString)
        {
            var benutzer = HttpContext.Items[AasDesignerConstants.CURRENT_USER] as Model.Benutzer;
            if (benutzer == null)
                throw new UserNotFoundException();

            return await Task.FromResult(_invoiceService.Generate(rechnungsMonatString, benutzer));
        }

        [HttpGet]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
        public async Task<List<OrgaRechnung>> Load(string rechnungsMonatString)
        {
            var benutzer = HttpContext.Items[AasDesignerConstants.CURRENT_USER] as Model.Benutzer;
            if (benutzer == null)
                throw new UserNotFoundException();

            return await Task.FromResult(_invoiceService.Load(rechnungsMonatString, benutzer));
        }
    }
}
