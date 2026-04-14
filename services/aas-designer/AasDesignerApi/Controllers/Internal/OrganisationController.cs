using AasDesignerApi.EClass;
using AasDesignerApi.Jobs;
using AasDesignerApi.Model;
using AasDesignerApi.Model.Client;
using AasDesignerApi.Orga;
using AasDesignerApi.Service;
using AasDesignerApi.Statistics;
using AasDesignerAuthorization;
using AasDesignerCommon.Statistics;
using AasDesignerCommon.Utils;
using AasDesignerModel.Model;
using AasShared.Controllers;
using AasShared.Exceptions;
using Microsoft.AspNetCore.Mvc;
using static AasDesignerApi.Service.OrganisationService;

namespace AasDesignerApi.Controllers.Internal
{
    [ApiController]
    [Route("api/[controller]/[action]")]
    [ApiExplorerSettings(GroupName = "internal-orga")]
    public class OrganisationController : InternalApiBaseController
    {
        private readonly StatisticsLogger _statisticsLogger;
        private readonly EclassImportService _eclassImportService;
        private readonly IBackgroundTaskQueue _taskQueue;
        private readonly EClassBackgroundService _eclassBackgroundService;
        private readonly OrganisationService _organisationService;
        private readonly EclassCertificateService _eclassCertificateService;

        public OrganisationController(
            OrganisationService organisationService,
            EclassCertificateService eclassCertificateService,
            StatisticsLogger statisticsLogger,
            EclassImportService eClassImportService,
            IBackgroundTaskQueue taskQueue,
            EClassBackgroundService eclassBackgroundService
        )
        {
            _organisationService = organisationService;
            _eclassCertificateService = eclassCertificateService;
            _statisticsLogger = statisticsLogger;
            _eclassImportService = eClassImportService;
            _taskQueue = taskQueue;
            _eclassBackgroundService = eclassBackgroundService;
        }

        [HttpGet]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
        public async Task<List<OrganisationUebersichtDto>> GetAll()
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();

            Organisation addOrganisation = new();

            addOrganisation.VerifyReadAllowed(benutzer);

            return await Task.FromResult(_organisationService.GetOrganisation());
        }

        [HttpPut]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
        public async Task<Organisation?> Add(AddOrgaData addOrgaData)
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();

            Organisation addOrganisation = new();
            addOrganisation.VerifyInsertAllowed(benutzer);

            var res = _organisationService.Add(addOrgaData, out var userAlreadyExists);
            if (res != null)
                _statisticsLogger.LogAction(StatisticActionType.REGISTRATION, res.Id);
            return await Task.FromResult(res);
        }

        [HttpPatch]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN, AuthRoles.ORGA_ADMIN])]
        public async Task<bool> Update(long organisationId, OrganisationUpdateDto organisation)
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();

            var updateOrganisation = _organisationService.GetVerifyOrga(organisationId);
            updateOrganisation.VerifyUpdateAllowed(benutzer);

            return await Task.FromResult(_organisationService.Update(organisation, organisationId));
        }

        [HttpPatch]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN, AuthRoles.ORGA_ADMIN])]
        public async Task<bool> UpdateUserRoles(long organisationId, long userId, string[] newRoles)
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();

            var updateOrganisation = _organisationService.GetVerifyOrga(organisationId);
            updateOrganisation.VerifyUpdateAllowed(benutzer);

            return await Task.FromResult(
                _organisationService.UpdateUserRoles(newRoles, benutzer, userId)
            );
        }

        [HttpDelete]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN, AuthRoles.ORGA_ADMIN])]
        public async Task<bool> DeleteUser(long organisationId, long userId)
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();

            var updateOrganisation = _organisationService.GetVerifyOrga(organisationId);
            updateOrganisation.VerifyUpdateAllowed(benutzer);

            return await Task.FromResult(_organisationService.DeleteUser(benutzer, userId));
        }

        [HttpDelete]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
        public async Task<bool> Delete(long organisationId)
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();

            var deleteOrganisation = _organisationService.GetVerifyOrga(organisationId);
            deleteOrganisation.VerifyDeleteAllowed(benutzer);

            return await Task.FromResult(_organisationService.Remove(organisationId));
        }

        [HttpGet]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN, AuthRoles.ORGA_ADMIN])]
        public async Task<List<string>> GetOrganisationRoles()
        {
            return await Task.FromResult(_organisationService.GetRoles());
        }

        [HttpPatch]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
        public async Task<bool> ChangeStatus(long organisationId, bool status = false)
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();

            var updateOrganisation = _organisationService.GetVerifyOrga(organisationId);
            updateOrganisation.VerifyUpdateAllowed(benutzer);

            return await Task.FromResult(_organisationService.ChangeStatus(organisationId, status));
        }

        [HttpGet]
        [AasDesignerAuthorize(
            RequiredRoles = [AuthRoles.SYSTEM_ADMIN, AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER]
        )]
        public async Task<OrganisationUebersichtDto?> GetById(long organisationId)
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();

            var readOrganisation = _organisationService.GetVerifyOrga(organisationId);
            readOrganisation.VerifyReadAllowed(benutzer);

            return await Task.FromResult(_organisationService.GetById(organisationId));
        }

        [HttpGet]
        [AasDesignerAuthorize(
            RequiredRoles = [AuthRoles.SYSTEM_ADMIN, AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER]
        )]
        public async Task<List<OrganisationUebersichtBenutzerDto>> GetOrganisationUsersById(
            long organisationId
        )
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();

            var readOrganisation = _organisationService.GetVerifyOrga(organisationId);
            readOrganisation.VerifyReadAllowed(benutzer);

            return await Task.FromResult(_organisationService.GetOrganisationUsers(organisationId));
        }

        [HttpGet]
        [AasDesignerAuthorize(
            RequiredRoles = [AuthRoles.SYSTEM_ADMIN, AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER]
        )]
        public async Task<OrganisationUebersichtBenutzerDto> GetUserById(
            long organisationId,
            long userId
        )
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();

            var readOrganisation = _organisationService.GetVerifyOrga(organisationId);
            readOrganisation.VerifyReadAllowed(benutzer);

            return await Task.FromResult(_organisationService.GetUserById(organisationId, userId));
        }

        [HttpGet]
        [AasDesignerAuthorize(
            RequiredRoles = [AuthRoles.SYSTEM_ADMIN, AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER]
        )]
        public async Task<List<OrganisationUebersichtBenutzerDto>> GetOrgaAdmins(
            long organisationId,
            long userId
        )
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();
            var readOrganisation = _organisationService.GetOrganisationById(organisationId);
            readOrganisation.VerifyReadAllowed(benutzer);

            return await Task.FromResult(_organisationService.GetOrgaAdmins(organisationId));
        }

        [HttpPost, DisableRequestSizeLimit]
        [RequestFormLimits(
            ValueLengthLimit = int.MaxValue,
            MultipartBodyLengthLimit = long.MaxValue
        )]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.ORGA_ADMIN])]
        public async Task<EclassCertificate> UploadEclasseCertificate(IFormFile file)
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();

            var updateOrganisation = new Organisation { Id = benutzer.OrganisationId };
            updateOrganisation.VerifyReadAllowed(benutzer);

            return await Task.FromResult(
                _eclassCertificateService.Upload(file, benutzer.OrganisationId)
            );
        }

        [HttpGet]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.ORGA_ADMIN])]
        public async Task<EclassCertificate?> GetEclassCertificate()
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();
            var updateOrganisation = new Organisation { Id = benutzer.OrganisationId };
            updateOrganisation.VerifyReadAllowed(benutzer);

            return await Task.FromResult(
                _eclassCertificateService.GetByCurrentOrga(benutzer.Organisation.Id)
            );
        }

        [HttpGet]
        [AasDesignerAuthorize(
            RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.SYSTEM_ADMIN, AuthRoles.BENUTZER]
        )]
        public async Task<OrganisationUserSeatStats?> GetUserSeatStats(long orgaId)
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();
            var updateOrganisation = _organisationService.GetOrganisationById(orgaId);
            updateOrganisation.VerifyReadAllowed(benutzer);

            return await Task.FromResult(_organisationService.GetOrganisationUserSeatStats(orgaId));
        }

        [HttpDelete]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.ORGA_ADMIN])]
        public async Task<ActionResult<bool>> DeleteEclasseCertificate()
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();
            var updateOrganisation = new Organisation { Id = benutzer.OrganisationId };
            updateOrganisation.VerifyReadAllowed(benutzer);

            return await Task.FromResult(
                _eclassCertificateService.Delete(benutzer.Organisation.Id)
            );
        }

        [HttpPut]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
        public async Task<bool> AddPaymentModel(long paymentModelId, long orgaId)
        {
            return await Task.FromResult(
                _organisationService.AddPaymentModel(paymentModelId, orgaId)
            );
        }

        [HttpPatch]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
        public async Task<bool> UpdatePaymentModel(
            long oldPaymentModelId,
            long newPaymentModelId,
            long orgaId,
            DateTime? endDate = null
        )
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();

            return await Task.FromResult(
                _organisationService.UpdatePaymentModel(
                    oldPaymentModelId,
                    newPaymentModelId,
                    orgaId,
                    endDate,
                    benutzer
                )
            );
        }

        [HttpPatch]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
        public async Task<bool> UpdatePaymentModelEndDate(
            long paymentModelId,
            DateTime? endDate = null
        )
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();

            return await Task.FromResult(
                _organisationService.UpdatePaymentModelEndDate(paymentModelId, endDate, benutzer)
            );
        }

        [HttpGet]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN, AuthRoles.ORGA_ADMIN])]
        public async Task<int> GetActiveUsersCount(long id)
        {
            return await Task.FromResult(_organisationService.GetActiveUsersCount(id));
        }

        [HttpDelete]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
        public async Task<bool> RemovePaymentOption(long id)
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();

            return await Task.FromResult(_organisationService.RemovePaymentOption(id, benutzer));
        }

        [HttpGet]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.ORGA_ADMIN])]
        public async Task<List<OrgaTokenDto>> GetOrgaTokens()
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();
            Organisation organisation = new() { Id = benutzer.OrganisationId };
            organisation.VerifyReadAllowed(benutzer);

            return await Task.FromResult(_organisationService.GetTokens(benutzer));
        }

        [HttpGet]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.ORGA_ADMIN])]
        public async Task<List<string>> GetAvailableScopes()
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();
            Organisation organisation = new() { Id = benutzer.OrganisationId };
            organisation.VerifyReadAllowed(benutzer);

            return await Task.FromResult(ApiScopes.GetOrgaScopes());
        }

        [HttpDelete]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.ORGA_ADMIN])]
        public async Task<ActionResult> DeleteToken(long id)
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();
            var updateOrganisation = new Organisation { Id = benutzer.OrganisationId };
            updateOrganisation.VerifyDeleteAllowed(benutzer);

            _organisationService.DeleteToken(benutzer, id);
            return await Task.FromResult(Ok());
        }

        [HttpPut]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.ORGA_ADMIN])]
        public async Task<OrgaTokenDto> AddToken(OrgaTokenDto apikey)
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();
            var updateOrganisation = new Organisation { Id = benutzer.OrganisationId };
            updateOrganisation.VerifyInsertAllowed(benutzer);

            return await Task.FromResult(_organisationService.AddToken(benutzer, apikey));
        }

        [HttpPatch]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.ORGA_ADMIN])]
        public async Task<ActionResult> ActivateToken(long id)
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();
            var updateOrganisation = new Organisation { Id = benutzer.OrganisationId };
            updateOrganisation.VerifyUpdateAllowed(benutzer);

            _organisationService.ActivateToken(benutzer, id);

            return await Task.FromResult(Ok());
        }

        [HttpPatch]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.ORGA_ADMIN])]
        public async Task<ActionResult> DeactivateToken(long id)
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();
            var updateOrganisation = new Organisation { Id = benutzer.OrganisationId };
            updateOrganisation.VerifyUpdateAllowed(benutzer);

            _organisationService.DeactivateToken(benutzer, id);

            return await Task.FromResult(Ok());
        }

        [HttpGet]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.SYSTEM_ADMIN])]
        public async Task<int> GetMaxUsersCount(long id)
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();
            var orga = _organisationService.GetOrganisationById(id);
            orga.VerifyReadAllowed(benutzer);

            return await Task.FromResult(_organisationService.GetMaxUsersCount(id));
        }

        [HttpGet]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.SYSTEM_ADMIN])]
        public async Task<List<EClassImportQueueItemDto>> CheckPendingImport()
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();
            return await Task.FromResult(_eclassImportService.CheckPendingImport(benutzer));
        }

        [HttpDelete]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.SYSTEM_ADMIN])]
        public async Task<List<EClassImportQueueItemDto>> DeletePendingImport(long id)
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();
            return await Task.FromResult(_eclassImportService.DeletePendingImport(benutzer, id));
        }

        [HttpPost, DisableRequestSizeLimit]
        [RequestFormLimits(
            ValueLengthLimit = int.MaxValue,
            MultipartBodyLengthLimit = long.MaxValue
        )]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.ORGA_ADMIN])]
        public async Task<bool> ImportEclassFile(IFormFile file)
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();

            var updateOrganisation = new Organisation { Id = benutzer.OrganisationId };
            updateOrganisation.VerifyReadAllowed(benutzer);

            var importId = _eclassImportService.StoreImportEclass(benutzer, file);

            await _taskQueue.QueueBackgroundWorkItemAsync(ct => RunImportEclassAsync(importId, ct));

            return await Task.FromResult(true);
        }

        private ValueTask RunImportEclassAsync(long importId, CancellationToken token)
        {
            _eclassBackgroundService.ImportEclass(importId);
            return new ValueTask();
        }

        [HttpGet]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN, AuthRoles.ORGA_ADMIN])]
        public async Task<List<Invitation>> GetPendingInvitations()
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();
            return await Task.FromResult(_organisationService.GetInvitations(benutzer));
        }

        [HttpDelete]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN, AuthRoles.ORGA_ADMIN])]
        public async Task DeleteInvitation(long id)
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();
            var deleteInvitation = _organisationService.GetInvitationById(id);
            deleteInvitation.VerifyDeleteAllowed(benutzer);

            _organisationService.DeleteInvitation(deleteInvitation);
        }

        [HttpGet]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.ORGA_ADMIN])]
        public async Task<List<Model.OrganisationPaymentModel>> GetPaymentModels(long orgaId)
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();
            var organisation = _organisationService.GetOrganisationById(orgaId);
            organisation.VerifyReadAllowed(benutzer);

            return await Task.FromResult(_organisationService.GetPaymentModels(orgaId));
        }

        [HttpGet]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.ORGA_ADMIN])]
        public async Task<List<OrganisationUebersichtBenutzerDto>> GetMoveTargets(
            long orgaId,
            long userTomoveId
        )
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();
            var organisation = _organisationService.GetOrganisationById(orgaId);
            organisation.VerifyReadAllowed(benutzer);

            return await Task.FromResult(_organisationService.GetMoveTargets(orgaId, userTomoveId));
        }

        [HttpGet]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
        public async Task<List<OrganisationAdminUebersichtDto>> GetAdminOrgaUebersicht()
        {
            return await Task.FromResult(_organisationService.GetAdminOrgaUebersicht());
        }

        [HttpPost]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
        public async Task<bool> CreateInfrastructure(long orgaId)
        {
            return await _organisationService.CreateInfrastructureAsync(orgaId);
        }
    }
}
