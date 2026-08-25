using AasDesignerApi.Model;
using AasDesignerApi.Model.Client;
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
    [ApiExplorerSettings(GroupName = "internal-orga")]
    public class InfrastrukturRechteController : InternalApiBaseController
    {
        private readonly OrganisationService _organisationService;

        public InfrastrukturRechteController(OrganisationService organisationService)
        {
            _organisationService = organisationService;
        }

        /// <summary>
        /// All infrastructures of an organisation with the permissions of a specific user.
        /// </summary>
        [HttpGet]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.SYSTEM_ADMIN])]
        public async Task<List<BenutzerInfrastrukturRechtDto>> GetUserInfraRechte(
            long organisationId,
            long userId
        )
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();

            var orga = _organisationService.GetVerifyOrga(organisationId);
            orga.VerifyReadAllowed(benutzer);

            return await Task.FromResult(
                _organisationService.GetUserInfraRechte(organisationId, userId)
            );
        }

        /// <summary>
        /// Set the permissions of a user for a specific infrastructure (upsert).
        /// DarfSchreiben implies DarfLesen.
        /// </summary>
        [HttpPut]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.SYSTEM_ADMIN])]
        public async Task<BenutzerInfrastrukturRechtDto> UpsertUserInfraRecht(
            long organisationId,
            long userId,
            long infraId,
            [FromBody] BenutzerInfrastrukturRechtDto dto
        )
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();

            var orga = _organisationService.GetVerifyOrga(organisationId);
            orga.VerifyUpdateAllowed(benutzer);

            return await Task.FromResult(
                _organisationService.UpsertUserInfraRecht(organisationId, userId, infraId, dto)
            );
        }

        /// <summary>
        /// All users of an organisation with their permissions for a specific infrastructure.
        /// </summary>
        [HttpGet]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.SYSTEM_ADMIN])]
        public async Task<List<InfraUserRechtDto>> GetInfraUserRechte(
            long organisationId,
            long infraId
        )
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();

            var orga = _organisationService.GetVerifyOrga(organisationId);
            orga.VerifyReadAllowed(benutzer);

            return await Task.FromResult(
                _organisationService.GetInfraUserRechte(organisationId, infraId)
            );
        }
    }
}
