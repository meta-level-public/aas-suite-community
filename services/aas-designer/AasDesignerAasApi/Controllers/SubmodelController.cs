using AasDesignerAasApi.ConceptDescriptions.Queries.GetSmList;
using AasDesignerAasApi.ConceptDescriptions.Queries.GetSmPlain;
using AasDesignerApi.Model;
using AasDesignerAuthorization;
using AasDesignerCommon.Utils;
using AasShared.Exceptions;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace AasDesignerAasApi.Controllers
{
    [ApiController]
    [Route("aas-api/[controller]/[action]")]
    [ApiExplorerSettings(GroupName = "internal-aas")]
    public class SubmodelController : Controller
    {
        private readonly ILogger<SubmodelController> _logger;
        private readonly IServiceProvider _serviceProvider;

        public SubmodelController(
            ILogger<SubmodelController> logger,
            IServiceProvider serviceProvider
        )
        {
            _logger = logger;
            _serviceProvider = serviceProvider;
        }

        [HttpPost]
        [AasDesignerAuthorize(
            RequiredRoles = [AuthRoles.BENUTZER, AuthRoles.ORGA_ADMIN, AuthRoles.SYSTEM_ADMIN]
        )]
        public async Task<SmVm> GetSmList(
            int count = 10,
            string? cursor = null,
            string filterIdShort = ""
        )
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();

            var mediator = new Mediator(_serviceProvider);

            var command = new GetSmListQuery
            {
                AppUser = benutzer,
                Count = count,
                Cursor = cursor,
                FilterIdShort = filterIdShort,
            };

            return await mediator.Send(command);
        }

        [HttpPost]
        [AasDesignerAuthorize(
            RequiredRoles = [AuthRoles.BENUTZER, AuthRoles.ORGA_ADMIN, AuthRoles.SYSTEM_ADMIN]
        )]
        public async Task<string> GetSmPlain(string smIdentifier)
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();

            var mediator = new Mediator(_serviceProvider);

            var command = new GetSmPlainQuery { AppUser = benutzer, SmIdentifier = smIdentifier };

            return await mediator.Send(command);
        }
    }
}
