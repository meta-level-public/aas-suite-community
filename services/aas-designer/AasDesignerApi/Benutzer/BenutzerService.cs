using System.Net;
using AasDesignerApi.Authorization;
using AasDesignerApi.Authorization.Model;
using AasDesignerApi.Localization;
using AasDesignerApi.Mail;
using AasDesignerApi.Model;
using AasDesignerApi.Model.Client;
using AasDesignerApi.Service;
using AasDesignerCommon.Utils;
using AasDesignerModel;
using AasDesignerModel.Model;
using AasShared.Configuration;
using AasShared.Exceptions;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;

namespace AasDesignerApi.Benutzer
{
    public class BenutzerService
    {
        private readonly IApplicationDbContext _context;
        private readonly MailService _mailer;
        private readonly AppSettings _config;
        private readonly JwtUtils _jwtUtils;
        private readonly KeycloakAdminService _keycloakAdminService;

        public BenutzerService(
            IApplicationDbContext context,
            AppSettings config,
            MailService mailer,
            JwtUtils jwtUtils,
            KeycloakAdminService keycloakAdminService
        )
        {
            _context = context;
            _mailer = mailer;
            _config = config;
            _jwtUtils = jwtUtils;
            _keycloakAdminService = keycloakAdminService;
        }

        public Model.Benutzer GetById(long id)
        {
            return _context.Benutzers.First(b => b.Id == id);
        }

        public bool UpdateProfil(ProfilDto profil, Model.Benutzer benutzer)
        {
            // TODO: Prüfen, ob wir hier nicht auch organisationsspezifische Einstellungen speichern müssen
            if (this.EmailIsAlreadyUsedExceptItself(benutzer.Id, profil.Email))
            {
                throw new EntryAlreadyExistsException("EMAILADRESS_ALREADY_REGISTERED");
            }
            var dbBenutzer = _context.Benutzers.Find(benutzer.Id);
            if (dbBenutzer != null)
            {
                dbBenutzer.Name = profil.Name;
                dbBenutzer.Vorname = profil.Vorname;
                dbBenutzer.Email = profil.Email;
                dbBenutzer.ProfilbildBase64 = profil.ProfilbildBase64;
                _context.SaveChanges();
                return true;
            }
            throw new UserNotFoundException("USER_NOT_FOUND");
        }

        public bool Update(long updateUserId, BenutzerUpdateDto benutzerUpdateDto, AppUser benutzer)
        {
            bool result = false;

            Model.Benutzer? foundUser = _context.Benutzers.FirstOrDefault(b =>
                b.Id == updateUserId
            );

            if (foundUser != null)
            {
                if (!EmailIsAlreadyUsedExceptItself(updateUserId, benutzerUpdateDto.Email))
                {
                    foundUser.Vorname = benutzerUpdateDto.Vorname;
                    foundUser.Name = benutzerUpdateDto.Name;
                    foundUser.Email = benutzerUpdateDto.Email;
                    foundUser.Geloescht = benutzerUpdateDto.Geloescht;
                    foundUser.Telefon = benutzerUpdateDto.Telefon ?? string.Empty;
                    foundUser.AccountAktiv = benutzerUpdateDto.AccountAktiv;
                    foundUser.BenutzerRollen = benutzerUpdateDto.BenutzerRollen;

                    _context.SaveChanges();

                    result = true;
                }
                else
                {
                    throw new EntryAlreadyExistsException("EMAILADRESS_ALREADY_REGISTERED");
                }
            }

            return result;
        }

        public bool UpdateSettings(BenutzerEinstellungen einstellungen, Model.Benutzer benutzer)
        {
            benutzer.Einstellungen = einstellungen;
            _context.Attach(benutzer);
            _context.SaveChanges();

            return true;
        }

        public void SetMostRecentlyUsedSnippet(long id, Model.Benutzer benutzer)
        {
            var snippet = _context.Snippets.FirstOrDefault(s => s.Id == id);
            if (snippet != null)
            {
                var snippetVerwendung = new SnippetVerwendung
                {
                    SnippetId = id,
                    SnippetName = snippet.Name,
                    SnippetTyp = snippet.Typ,
                    Datum = DateTime.Now,
                };

                if (benutzer.Einstellungen == null)
                {
                    benutzer.Einstellungen = new BenutzerEinstellungen();
                }
                benutzer.Einstellungen.LetzteSnippets.Add(snippetVerwendung);
                _context.Update(benutzer);
                _context.SaveChanges();
            }
        }

        public bool Remove(long removeUserId)
        {
            bool result = false;

            var foundUser = _context.Benutzers.Find(removeUserId);

            if (foundUser != null)
            {
                foundUser.Geloescht = true;
                foundUser.AccountAktiv = false;

                _context.SaveChanges();
                result = true;
            }

            return result;
        }

        public OrganisationUebersichtBenutzerDto GetUserById(long retrieveUserId)
        {
            OrganisationUebersichtBenutzerDto result = null!;

            var foundUser = _context
                .Benutzers.Include(b => b.BenutzerOrganisationen)
                    .ThenInclude(o => o.Organisation)
                .FirstOrDefault(b => b.Id == retrieveUserId);

            if (foundUser != null)
            {
                result = MapToUserOrganisationUebersichtBenutzerDto(foundUser);
            }

            return result;
        }

        public bool ChangeStatus(long changeUserId, bool status)
        {
            bool result = false;

            var foundUser = _context.Benutzers.SingleOrDefault(b => b.Id == changeUserId);

            if (
                foundUser != null
                && !foundUser.BenutzerRollen.Exists(br => br == AuthRoles.SYSTEM_ADMIN)
            )
            {
                foundUser.AccountAktiv = status;

                _context.SaveChanges();
            }
            result = true;

            return result;
        }

        private static OrganisationUebersichtBenutzerDto MapToUserOrganisationUebersichtBenutzerDto(
            Model.Benutzer user
        )
        {
            return new OrganisationUebersichtBenutzerDto()
            {
                Id = user.Id,
                Name = user.Name,
                Vorname = user.Vorname,
                Geloescht = user.Geloescht,
                Email = user.Email,
                Telefon = user.Telefon,
                AccountAktiv = user.AccountAktiv,
                BenutzerRollen = user.BenutzerRollen,
            };
        }

        public bool EmailIsAlreadyUsed(string email)
        {
            return _context.Benutzers.Any(b =>
                b.Email.ToLower() == email.ToLower() && !b.Geloescht
            );
        }

        public bool EmailIsAlreadyUsedExceptItself(long updateUserId, string email)
        {
            return _context.Benutzers.Any(b =>
                b.Id != updateUserId && b.Email.ToLower() == email.ToLower() && !b.Geloescht
            );
        }

        public Model.Benutzer GetSystemUserByApikey(Model.Apikey apikey)
        {
            return _context
                .BenutzerOrganisations.Include(bo => bo.Benutzer)
                .Where(b => b.OrganisationId == apikey!.OrganisationId && b.Benutzer.IsSystemUser)
                .Select(bo => bo.Benutzer)
                .First();
        }

        public AppUser GetSystemAppUserByApikey(Model.Apikey apikey)
        {
            var benutzer = _context
                .BenutzerOrganisations.Include(bo => bo.Benutzer)
                .Where(b => b.OrganisationId == apikey!.OrganisationId && b.Benutzer.IsSystemUser)
                .Select(bo => bo.Benutzer)
                .First();
            var orga = _context.Organisations.Find(apikey.OrganisationId);

            if (orga == null)
                throw new AppException("ORGANISATION_NOT_FOUND");

            return new AppUser(
                benutzer,
                orga,
                [AuthRoles.VIEWER_NUTZER],
                orga.AasInfrastructureSettings.First(),
                "en",
                string.Empty
            );
        }

        public Invitation InviteUser(InvitationDto invitationDto, AppUser benutzer)
        {
            var invitation = new Invitation
            {
                Name = invitationDto.Name,
                Vorname = invitationDto.Vorname,
                Email = invitationDto.Email,
                OrganisationId = benutzer.OrganisationId,
                BenutzerRollen = invitationDto.BenutzerRollen,
                ValidUntil = DateTimeOffset.Now.AddDays(14),
                InvitationGuid = Guid.NewGuid(),
                Language = invitationDto.Language,
            };

            var orga = _context.Organisations.First(o => o.Id == benutzer.OrganisationId);

            _context.Invitations.Add(invitation);
            _context.SaveChanges();

            SendInvitationMail(invitation, orga);

            return invitation;
        }

        public void ResendInvitationMail(long id, AppUser benutzer)
        {
            var invitation = _context.Invitations.First(i => i.Id == id);
            invitation.VerifyDeleteAllowed(benutzer);

            invitation.ValidUntil = DateTimeOffset.Now.AddDays(14);
            _context.SaveChanges();

            var orga = _context.Organisations.First(o => o.Id == invitation.OrganisationId);
            SendInvitationMail(invitation, orga);
        }

        private void SendInvitationMail(Invitation invitation, Organisation orga)
        {
            var url =
                $"{_config.BaseApiUrl}/Benutzer/AcceptInvitation?guid={invitation.InvitationGuid}";

            var text = File.ReadAllText(
                Path.Combine(
                    AppContext.BaseDirectory,
                    "Mail",
                    "Templates",
                    $"user-einladung-tmpl.{invitation.Language}.html"
                )
            );

            text = text.Replace("{{username}}", $"{invitation.Vorname} {invitation.Name}");
            text = text.Replace("{{contact.EMAIL}}", invitation.Email);
            text = text.Replace("{{endDate}}", invitation.ValidUntil.ToString());
            text = text.Replace("{{organisation}}", orga.Name);
            text = text.Replace("{{url}}", url);
            var subject =
                invitation.Language == "de"
                    ? "[AAS Designer] Einladung"
                    : "[AAS Designer] Invitation";

            _mailer.SendMail(invitation.Email, subject, text, true);
        }

        public async Task<string> AcceptInvitation(string guid)
        {
            var invitation = await _context.Invitations.FirstOrDefaultAsync(i =>
                i.InvitationGuid.Equals(new Guid(guid))
            );

            if (invitation == null)
                return LocalizedMessageFactory
                    .GetLocalizedMessages("en")
                    .GetInvitationNotFoundMessage(_config.BaseUrl);

            if (invitation.ValidUntil < DateTimeOffset.Now)
                return LocalizedMessageFactory
                    .GetLocalizedMessages(invitation.Language)
                    .GetInvitationExpiredMessage(_config.BaseUrl);

            // prüfen, ob der Nutzer bereits der Organisation angehört!
            var existingUser = _context.BenutzerOrganisations.FirstOrDefault(bo =>
                bo.Benutzer.Email.ToLower() == invitation.Email.ToLower()
                && bo.OrganisationId == invitation.OrganisationId
            );
            if (existingUser != null)
            {
                return LocalizedMessageFactory
                    .GetLocalizedMessages(invitation.Language)
                    .GetInvitationAlreadyMemberOfOrganisation(_config.BaseUrl);
            }

            // prüfen, ob bei der Organisation noch Lizenzen verfügbar sind
            var orga = _context.Organisations.First(o => o.Id == invitation.OrganisationId);
            if (!orga.MoreUsersAllowed(_context))
            {
                return LocalizedMessageFactory
                    .GetLocalizedMessages(invitation.Language)
                    .GetInvitationNoMoreLicensesMessage(_config.BaseUrl);
            }

            // prüfen ob schon ein account mit dieser emailadresse existiert
            var existingUsers = _context
                .Benutzers.Where(b => b.Email == invitation.Email && !b.Geloescht)
                .ToList();

            if (existingUsers.Count == 0)
            {
                return LocalizedMessageFactory
                    .GetLocalizedMessages(invitation.Language)
                    .GetInvitationCreateAccountMessage(_config.BaseUrl, guid);
            }
            if (existingUsers.Count == 1)
            {
                var user = existingUsers.First();
                user.BenutzerOrganisationen.Add(
                    new BenutzerOrganisation
                    {
                        OrganisationId = invitation.OrganisationId,
                        BenutzerRollen = invitation.BenutzerRollen,
                        BenutzerId = user.Id,
                        AccountAktiv = true,
                    }
                );
                _context.Invitations.Remove(invitation);
                await _context.SaveChangesAsync();

                if (_keycloakAdminService.IsProvisioningEnabled)
                {
                    var provisionedUser =
                        await _keycloakAdminService.EnsureUserWithOrganisationRolesAsync(
                            user.Email,
                            user.Vorname,
                            user.Name,
                            invitation.OrganisationId,
                            invitation.BenutzerRollen,
                            null,
                            false
                        );

                    if (provisionedUser != null)
                    {
                        user.ExternalIdentityProvider = "Keycloak";
                        user.ExternalIdentitySubject = provisionedUser.UserId;
                        user.ExternalIdentityUsername = provisionedUser.Email;
                        await _context.SaveChangesAsync();
                    }
                }

                return LocalizedMessageFactory
                    .GetLocalizedMessages(invitation.Language)
                    .GetInvitationSuccessMessage(_config.BaseUrl);
            }

            // und wenn wir mehrere finden? -> Problem!
            return LocalizedMessageFactory
                .GetLocalizedMessages(invitation.Language)
                .GetInvitationMultipleUsersMessage(_config.BaseUrl);
        }

        public Invitation? GetInvitation(string guid)
        {
            return _context.Invitations.FirstOrDefault(i =>
                i.InvitationGuid.Equals(new Guid(guid))
            );
        }

        public AuthenticateResponse? CreateAccountByInvitation(
            Invitation invitation,
            string password,
            string ipAddress
        )
        {
            KeycloakProvisionedUser? provisionedUser = null;
            if (_keycloakAdminService.IsProvisioningEnabled)
            {
                provisionedUser = _keycloakAdminService
                    .EnsureUserWithOrganisationRolesAsync(
                        invitation.Email,
                        invitation.Vorname,
                        invitation.Name,
                        invitation.OrganisationId,
                        invitation.BenutzerRollen,
                        password,
                        false
                    )
                    .GetAwaiter()
                    .GetResult();
            }

            var user = new Model.Benutzer()
            {
                Vorname = invitation.Vorname,
                Name = invitation.Name,
                Email = invitation.Email,
                EmailBestaetigt = true,
                BenutzerRollen = [],
                AccountAktiv = true,
                BenutzerOrganisationen =
                [
                    new BenutzerOrganisation
                    {
                        OrganisationId = invitation.OrganisationId,
                        BenutzerRollen = invitation.BenutzerRollen,
                        AccountAktiv = true,
                    },
                ],
                DatenschutzAccepted = true,
                DatenschutzAcceptedDate = DateTime.Now,
                LetzerLogin = DateTime.Now,
                ExternalIdentityProvider = provisionedUser != null ? "Keycloak" : string.Empty,
                ExternalIdentitySubject = provisionedUser?.UserId ?? string.Empty,
                ExternalIdentityUsername = provisionedUser?.Email ?? string.Empty,
            };

            var dbInvitation = _context.Invitations.FirstOrDefault(i =>
                i.InvitationGuid.Equals(invitation.InvitationGuid)
            );
            if (dbInvitation != null)
                _context.Invitations.Remove(dbInvitation);

            _context.Benutzers.Add(user);
            _context.SaveChanges();

            user = _context
                .Benutzers.Include(b => b.BenutzerOrganisationen)
                    .ThenInclude(bo => bo.Organisation)
                .First(b => b.Id == user.Id);

            var jwtToken = _jwtUtils.GenerateJwtToken(user);
            var refreshToken = _jwtUtils.GenerateRefreshToken(ipAddress);
            user.RefreshTokens.Add(refreshToken);
            _context.SaveChanges();

            // save changes to db
            return new AuthenticateResponse(
                user,
                jwtToken,
                refreshToken.Token,
                ResultCode.OK,
                user.BenutzerOrganisationen,
                _config.SingleTenantMode
            );
        }

        public List<UserOrgaUebersichtDto> GetUserOrgaUebersicht(Model.Benutzer benutzer)
        {
            return _context
                .BenutzerOrganisations.Where(bo => bo.BenutzerId == benutzer.Id && !bo.Geloescht)
                .Select(bo => new UserOrgaUebersichtDto
                {
                    OrgaName = bo.Organisation.Name,
                    BenutzerRollen = bo.BenutzerRollen,
                    Aktiv = bo.AccountAktiv,
                })
                .ToList();
        }
    }
}
