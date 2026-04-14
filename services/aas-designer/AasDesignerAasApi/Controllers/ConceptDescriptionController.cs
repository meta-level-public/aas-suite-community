using AasCore.Aas3_1;
using AasDesignerAasApi.ConceptDescriptions.Commands.DeleteConceptDescription;
using AasDesignerAasApi.ConceptDescriptions.Queries.GetAllCds;
using AasDesignerAasApi.ConceptDescriptions.Queries.GetCdList;
using AasDesignerAasApi.ConceptDescriptions.Queries.GetSingleCd;
using AasDesignerAasApi.Infrastructure.Commands.UpdateConceptDescription;
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
    public class ConceptDescriptionController : Controller
    {
        private readonly ILogger<ConceptDescriptionController> _logger;
        private readonly IServiceProvider _serviceProvider;

        public ConceptDescriptionController(
            ILogger<ConceptDescriptionController> logger,
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
        public async Task<CdVm> GetCdList(
            int count = 10,
            string? cursor = null,
            string filterIdShort = ""
        )
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();

            var mediator = new Mediator(_serviceProvider);

            var command = new GetCdListQuery
            {
                AppUser = benutzer,
                Count = count,
                Cursor = cursor,
                FilterIdShort = filterIdShort,
            };

            return await mediator.Send(command);
        }

        [HttpGet]
        [AasDesignerAuthorize(
            RequiredRoles = [AuthRoles.BENUTZER, AuthRoles.ORGA_ADMIN, AuthRoles.SYSTEM_ADMIN]
        )]
        public async Task<AllCdsVm> GetAllCds(
            int count = 10,
            string? cursor = null,
            string filterIdShort = ""
        )
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();

            var mediator = new Mediator(_serviceProvider);

            var command = new GetAllCdsQuery
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
        public async Task<string> GetCd(string id)
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();

            var mediator = new Mediator(_serviceProvider);

            var command = new GetSingleCdQuery { AppUser = benutzer, Id = id };

            return await mediator.Send(command);
        }

        [HttpPost]
        [AasDesignerAuthorize(
            RequiredRoles = [AuthRoles.BENUTZER, AuthRoles.ORGA_ADMIN, AuthRoles.SYSTEM_ADMIN]
        )]
        public async Task<bool> UpdateCd(string cdString)
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();

            var mediator = new Mediator(_serviceProvider);

            var command = new UpdateConceptDescriptionCommand
            {
                AppUser = benutzer,
                ConceptDescriptionString = cdString,
            };

            return await mediator.Send(command);
        }

        [HttpDelete]
        [AasDesignerAuthorize(
            RequiredRoles = [AuthRoles.BENUTZER, AuthRoles.ORGA_ADMIN, AuthRoles.SYSTEM_ADMIN]
        )]
        public async Task<bool> DeleteCd(string cdIdentifierBase64)
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();

            var mediator = new Mediator(_serviceProvider);

            var command = new DeleteConceptDescriptionCommand
            {
                AppUser = benutzer,
                CdIdentifierBase64 = cdIdentifierBase64,
            };

            return await mediator.Send(command);
        }
    }
}
