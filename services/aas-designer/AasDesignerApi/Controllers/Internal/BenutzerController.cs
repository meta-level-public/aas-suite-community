using AasDesignerApi.Authorization.Model;
using AasDesignerApi.Benutzer;
using AasDesignerApi.Model;
using AasDesignerApi.Model.Client;
using AasDesignerApi.Statistics;
using AasDesignerAuthorization;
using AasDesignerCommon.Statistics;
using AasDesignerCommon.Utils;
using AasDesignerModel.Model;
using AasShared.Controllers;
using AasShared.Exceptions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Primitives;

namespace AasDesignerApi.Controllers.Internal
{
    [ApiController]
    [Route("api/[controller]/[action]")]
    [ApiExplorerSettings(GroupName = "internal")]
    public class BenutzerController : InternalApiBaseController
    {
        private readonly BenutzerService _benutzerService;
        private readonly StatisticsLogger _statisticsLogger;

        public BenutzerController(
            BenutzerService benutzerService,
            StatisticsLogger statisticsLogger
        )
        {
            _benutzerService = benutzerService;
            _statisticsLogger = statisticsLogger;
        }

        [HttpGet]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER])]
        public async Task<OrganisationUebersichtBenutzerDto> GetById(long id)
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();
            var readUser = _benutzerService.GetById(id);
            readUser.VerifyReadAllowed(benutzer);

            return await Task.FromResult(_benutzerService.GetUserById(id));
        }

        [HttpPost]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN, AuthRoles.ORGA_ADMIN])]
        public async Task<Invitation> Invite(InvitationDto invitationDto)
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();
            var readUser = new Model.Benutzer()
            {
                BenutzerOrganisationen =
                [
                    new BenutzerOrganisation() { OrganisationId = benutzer.OrganisationId },
                ],
            };
            readUser.VerifyInsertAllowed(benutzer);

            return _benutzerService.InviteUser(invitationDto, benutzer);
        }

        [HttpPost]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN, AuthRoles.ORGA_ADMIN])]
        public async Task<ActionResult> ResendInvitation(long id)
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();

            _benutzerService.ResendInvitationMail(id, benutzer);
            return await Task.FromResult(Ok());
        }

        [HttpPut]
        [AasDesignerAuthorize(
            RequiredRoles = [AuthRoles.SYSTEM_ADMIN, AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER]
        )]
        public async Task<bool> Update(long id, BenutzerUpdateDto benutzerDto)
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();
            var changeUser = _benutzerService.GetById(id);
            changeUser.VerifyUpdateAllowed(benutzer);

            return await Task.FromResult(_benutzerService.Update(id, benutzerDto, benutzer));
        }

        [HttpDelete]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN, AuthRoles.ORGA_ADMIN])]
        public async Task<bool> Delete(long benutzerId)
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();
            var deleteUser = _benutzerService.GetById(benutzerId);
            deleteUser.VerifyDeleteAllowed(benutzer);

            return await Task.FromResult(_benutzerService.Remove(benutzerId));
        }

        [HttpPatch]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.ORGA_ADMIN])]
        public async Task<bool> ChangeStatus(long userId, bool status = false)
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();
            var changeUser = _benutzerService.GetById(userId);
            changeUser.VerifyUpdateAllowed(benutzer);

            return await Task.FromResult(_benutzerService.ChangeStatus(userId, status));
        }

        [HttpGet]
        [AasDesignerAuthorize]
        public async Task<bool> EmailAvailable(string email)
        {
            var benutzer = HttpContext.Items[AasDesignerConstants.CURRENT_USER] as Model.Benutzer;

            if (benutzer == null)
                throw new UserNotFoundException();
            return await Task.FromResult(
                !_benutzerService.EmailIsAlreadyUsedExceptItself(benutzer.Id, email)
            );
        }

        [HttpPatch]
        [AasDesignerAuthorize(
            RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
        )]
        public async Task<bool> UpdateSettings(BenutzerEinstellungen einstellungen)
        {
            var benutzer = HttpContext.Items[AasDesignerConstants.CURRENT_USER] as Model.Benutzer;

            if (benutzer == null)
                throw new UserNotFoundException();
            return await Task.FromResult(!_benutzerService.UpdateSettings(einstellungen, benutzer));
        }

        [HttpGet]
        [AasDesignerAuthorize(
            RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
        )]
        public async Task<List<SnippetVerwendung>> GetMostRecentlyUsedSnippets()
        {
            var benutzer = HttpContext.Items[AasDesignerConstants.CURRENT_USER] as Model.Benutzer;

            if (benutzer == null)
                throw new UserNotFoundException();
            return await Task.FromResult(
                benutzer.Einstellungen?.LetzteSnippets ?? new List<SnippetVerwendung>()
            );
        }

        [HttpGet]
        [AasDesignerAuthorize(
            RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
        )]
        public async Task<List<UserOrgaUebersichtDto>> GetUserOrgaUebersicht()
        {
            var benutzer = HttpContext.Items[AasDesignerConstants.CURRENT_USER] as Model.Benutzer;

            if (benutzer == null)
                throw new UserNotFoundException();
            return await Task.FromResult(_benutzerService.GetUserOrgaUebersicht(benutzer));
        }

        [HttpPut]
        [AasDesignerAuthorize(
            RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
        )]
        public async Task SetMostRecentlyUsedSnippet([FromQuery] long id)
        {
            var benutzer = HttpContext.Items[AasDesignerConstants.CURRENT_USER] as Model.Benutzer;

            if (benutzer == null)
                throw new UserNotFoundException();
            _benutzerService.SetMostRecentlyUsedSnippet(id, benutzer);
            await Task.FromResult(Ok());
        }

        [HttpGet]
        public async Task<ActionResult<string>> AcceptInvitation(string guid)
        {
            var res = await _benutzerService.AcceptInvitation(guid);
            return new ContentResult
            {
                ContentType = "text/html",
                StatusCode = StatusCodes.Status200OK,
                Content = res,
            };
        }

        [HttpGet]
        public async Task<Invitation?> GetInvitation(string guid)
        {
            return await Task.FromResult(_benutzerService.GetInvitation(guid));
        }

        [HttpPost]
        public async Task<AuthenticateResponse?> CreateAccountByInvitation(
            CreateAccountByInvitationDto request
        )
        {
            return await Task.FromResult(
                _benutzerService.CreateAccountByInvitation(
                    request.Invitation,
                    request.Password,
                    IpAddress()
                )
            );
        }

        private string IpAddress()
        {
            // get source ip address for the current request
            if (Request.Headers.ContainsKey("X-Forwarded-For"))
                return StringValues.IsNullOrEmpty(Request.Headers["X-Forwarded-For"])
                    ? string.Empty
                    : Request.Headers["X-Forwarded-For"].ToString();
            else
                return HttpContext.Connection?.RemoteIpAddress?.MapToIPv4().ToString()
                    ?? string.Empty;
        }
    }

    public class CreateAccountByInvitationDto
    {
        public Invitation Invitation { get; set; } = null!;
        public string Password { get; set; } = string.Empty;
    }
}
