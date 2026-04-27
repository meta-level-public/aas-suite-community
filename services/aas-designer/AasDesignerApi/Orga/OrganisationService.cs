using System.Net.Mail;
using AasDesignerAasApi.Infrastructure;
using AasDesignerApi.Authorization;
using AasDesignerApi.Benutzer;
using AasDesignerApi.Model;
using AasDesignerApi.Model.Client;
using AasDesignerApi.Orga;
using AasDesignerCommon.Utils;
using AasDesignerModel;
using AasDesignerModel.Model;
using AasShared.Configuration;
using AasShared.Exceptions;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;

namespace AasDesignerApi.Service;

public class OrganisationService
{
    private readonly IApplicationDbContext _context;
    private readonly BenutzerService _benutzerService;
    private readonly InfrastructureRequester _infrastructureRequester;
    private readonly AppSettings _appsettings;
    private readonly KeycloakAdminService _keycloakAdminService;

    public OrganisationService(
        IApplicationDbContext context,
        BenutzerService benutzerService,
        InfrastructureRequester infrastructureRequester,
        AppSettings appSettings,
        KeycloakAdminService keycloakAdminService
    )
    {
        _context = context;
        _benutzerService = benutzerService;
        _infrastructureRequester = infrastructureRequester;
        _appsettings = appSettings;
        _keycloakAdminService = keycloakAdminService;
    }

    public Organisation GetOrganisationById(long organisationId)
    {
        return _context.Organisations.First(o => o.Id == organisationId);
    }

    public Organisation GetVerifyOrga(long organisationId)
    {
        return _context.Organisations.First(o => o.Id == organisationId);
    }

    public List<OrganisationUebersichtDto> GetOrganisation()
    {
        return _context
            .Organisations.Where(o => !o.Geloescht)
            .Select(BuildOrganisationUebersichtDto)
            .ToList();
    }

    private static List<string> EnsureUserRoles(Model.Benutzer user)
    {
        user.BenutzerRollen ??= [];
        return user.BenutzerRollen;
    }

    private static List<string> MergeOrganisationAndUserRoles(
        BenutzerOrganisation benutzerOrganisation
    )
    {
        var organisationRoles = benutzerOrganisation.BenutzerRollen ?? [];
        var userRoles = benutzerOrganisation.Benutzer.BenutzerRollen ?? [];
        return organisationRoles.Concat(userRoles).ToList();
    }

    public bool Update(OrganisationUpdateDto updatedOrganisation, long organisationId)
    {
        var foundOrganisation = _context.Organisations.First(o => o.Id == organisationId);

        foundOrganisation.Name = updatedOrganisation.Name;
        foundOrganisation.Email = updatedOrganisation.Email;
        foundOrganisation.Telefon = updatedOrganisation.Telefon ?? string.Empty;
        foundOrganisation.Fax = updatedOrganisation.Fax ?? string.Empty;

        foundOrganisation.Bundesland = updatedOrganisation.Bundesland ?? string.Empty;
        foundOrganisation.LaenderCode = updatedOrganisation.LaenderCode ?? string.Empty;
        foundOrganisation.Ort = updatedOrganisation.Ort;
        foundOrganisation.Plz = updatedOrganisation.Plz;
        foundOrganisation.Strasse = updatedOrganisation.Strasse;

        foundOrganisation.IriPrefix = updatedOrganisation.IriPrefix;
        foundOrganisation.ThemeUrl = updatedOrganisation.ThemeUrl;

        foundOrganisation.AccountAktiv = updatedOrganisation.AccountAktiv;
        foundOrganisation.LogoBase64 = updatedOrganisation.LogoBase64;
        _context.SaveChanges();

        return true;
    }

    public int GetMaxUsersCount(long organisationId)
    {
        if (_appsettings.SingleTenantMode)
        {
            return -1;
        }

        var orga = _context.Organisations.First(o => o.Id == organisationId);

        return orga.GetMaxUsersCount(_context);
    }

    public OrganisationUebersichtDto? GetById(long organisationId)
    {
        return _context
            .Organisations.Include(o => o.Bezahlmodelle.Where(ob => !ob.Geloescht))
                .ThenInclude(bm => bm.PaymentModel)
            .Include(o => o.OwnedEclassData)
            .Where(o => o.Id == organisationId)
            .AsSplitQuery()
            .Select(BuildOrganisationUebersichtDto)
            .FirstOrDefault();
    }

    public Organisation? Add(AddOrgaData addOrgaData, out bool userAlreadyExists, bool aktiv = true)
    {
        Organisation? organisation = null;

        #region Organisation Address
        Adresse adresse = new()
        {
            Name = addOrgaData.Orga.Name,
            Strasse = addOrgaData.Orga.Strasse,
            Bundesland = addOrgaData.Orga.Bundesland,
            Ort = addOrgaData.Orga.Ort,
            LaenderCode = addOrgaData.Orga.LaenderCode,
            Plz = addOrgaData.Orga.Plz,
        };
        #endregion

        #region Organisation Daten
        organisation = new Organisation
        {
            Name = addOrgaData.Orga.Name,
            Telefon = addOrgaData.Orga?.Telefon ?? string.Empty,
            Email = addOrgaData.Orga?.Email ?? string.Empty,
            Fax = addOrgaData.Orga?.Fax ?? string.Empty,
            AccountAktiv = aktiv,
            Strasse = addOrgaData.Orga?.Strasse ?? string.Empty,
            Bundesland = addOrgaData.Orga?.Bundesland ?? string.Empty,
            Ort = addOrgaData.Orga?.Ort ?? string.Empty,
            LaenderCode = addOrgaData.Orga?.LaenderCode ?? string.Empty,
            Plz = addOrgaData.Orga?.Plz ?? string.Empty,
        };
        #endregion

        #region Benutzer
        var userExists = _benutzerService.EmailIsAlreadyUsed(addOrgaData.Admin.Email);
        Model.Benutzer newUser;
        userAlreadyExists = false;

        if (userExists)
        {
            newUser = _context.Benutzers.First(b =>
                b.Email == addOrgaData.Admin.Email && !b.Geloescht
            );
            userAlreadyExists = true;
        }
        else
        {
            newUser = new()
            {
                Vorname = addOrgaData.Admin.Vorname,
                Name = addOrgaData.Admin.Name,
                Telefon = addOrgaData.Admin.Telefon ?? "",
                Email = addOrgaData.Admin.Email,
                EmailBestaetigt = true,
                DatenschutzAccepted = true,
                DatenschutzAcceptedDate = DateTime.Now,
                IsSystemUser = false,
            };
        }
        #endregion

        Model.Benutzer systemUser = new()
        {
            Vorname = "system",
            Name = "user",
            Email = "system@hat.keine",
            EmailBestaetigt = true,
            BenutzerRollen = [AuthRoles.INTERNAL_SYSTEM_USER],
            IsSystemUser = true,
        };

        try
        {
            _context.Database.BeginTransaction();

            _context.Organisations.Add(organisation);
            if (!userExists)
            {
                _context.Benutzers.Add(newUser);
            }
            _context.Benutzers.Add(systemUser);

            _context.SaveChanges();

            var benutzerOrganisation = new BenutzerOrganisation
            {
                Organisation = organisation,
                OrganisationId = organisation.Id,
                Benutzer = newUser,
                BenutzerId = newUser.Id,
                BenutzerRollen = addOrgaData.Admin.BenutzerRollen,
                AccountAktiv = true,
            };

            var systemUserOrganisation = new BenutzerOrganisation
            {
                Organisation = organisation,
                OrganisationId = organisation.Id,
                Benutzer = systemUser,
                BenutzerId = systemUser.Id,
                AccountAktiv = true,
            };
            adresse.BesitzerId = newUser.Id;
            adresse.BesitzerOrganisationId = organisation.Id;
            _context.Adresses.Add(adresse);

            _context.BenutzerOrganisations.Add(benutzerOrganisation);
            _context.BenutzerOrganisations.Add(systemUserOrganisation);

            _context.SaveChanges();
            ProvisionOrganisationUser(
                newUser,
                organisation.Id,
                addOrgaData.Admin.BenutzerRollen,
                userAlreadyExists ? null : addOrgaData.Admin.Passwort
            );
            _context.Database.CommitTransaction();
        }
        catch
        {
            if (_context.Database.CurrentTransaction != null)
            {
                _context.Database.CurrentTransaction.Rollback();
            }
            throw;
        }

        _infrastructureRequester.RequestInfrastructure(organisation);

        return organisation;
    }

    public bool Remove(long id)
    {
        bool result = false;

        var gefundeneOrganisation = _context.Organisations.FirstOrDefault(a => a.Id == id);

        if (gefundeneOrganisation != null)
        {
            gefundeneOrganisation.Geloescht = true;
            gefundeneOrganisation.AccountAktiv = false;

            _context.SaveChanges();
            result = true;
        }

        return result;
    }

    public List<string> GetRoles()
    {
        return AuthRoles.GetRoles();
    }

    public bool ChangeStatus(long organisationId, bool status)
    {
        bool result = false;

        var organisation = _context.Organisations.SingleOrDefault(b => b.Id == organisationId);

        if (organisation != null)
        {
            organisation.AccountAktiv = status;
            _context.SaveChanges();

            result = true;
        }

        return result;
    }

    public List<OrganisationUebersichtBenutzerDto> GetOrganisationUsers(long organisationId)
    {
        var benutzerOrgas = _context
            .BenutzerOrganisations.Include(bo => bo.Benutzer)
            .Where(b =>
                b.OrganisationId == organisationId && !b.Geloescht && !b.Benutzer.IsSystemUser
            )
            .ToList();

        return benutzerOrgas
            .Select(b => new OrganisationUebersichtBenutzerDto
            {
                Id = b.Benutzer.Id,
                Name = b.Benutzer.Name,
                Vorname = b.Benutzer.Vorname,
                Email = b.Benutzer.Email,
                Telefon = b.Benutzer.Telefon,
                AccountAktiv = b.AccountAktiv,
                CreatedBySso = b.CreatedBySso,
                Geloescht = b.Benutzer.Geloescht,
                BenutzerRollen = MergeOrganisationAndUserRoles(b),
            })
            .ToList();
    }

    public List<OrganisationUebersichtBenutzerDto> GetOrgaAdmins(long organisationId)
    {
        var benutzerOrgas = _context
            .BenutzerOrganisations.Include(bo => bo.Benutzer)
            .Where(b =>
                b.OrganisationId == organisationId && !b.Geloescht && !b.Benutzer.IsSystemUser
            )
            .ToList();

        return benutzerOrgas
            .Where(bo => bo.BenutzerRollen.Contains(AuthRoles.ORGA_ADMIN))
            .Select(b => new OrganisationUebersichtBenutzerDto
            {
                Id = b.Benutzer.Id,
                Name = b.Benutzer.Name,
                Vorname = b.Benutzer.Vorname,
                Email = b.Benutzer.Email,
                Telefon = b.Benutzer.Telefon,
                AccountAktiv = b.AccountAktiv,
                CreatedBySso = b.CreatedBySso,
                Geloescht = b.Benutzer.Geloescht,
                BenutzerRollen = MergeOrganisationAndUserRoles(b),
            })
            .ToList();
    }

    public OrganisationUebersichtBenutzerDto GetUserById(long organisationId, long userId)
    {
        return _context
            .BenutzerOrganisations.Include(bo => bo.Benutzer)
            .Where(b =>
                b.OrganisationId == organisationId
                && !b.Geloescht
                && !b.Benutzer.IsSystemUser
                && b.BenutzerId == userId
            )
            .Select(b => new OrganisationUebersichtBenutzerDto
            {
                Id = b.Benutzer.Id,
                Name = b.Benutzer.Name,
                Vorname = b.Benutzer.Vorname,
                Email = b.Benutzer.Email,
                Telefon = b.Benutzer.Telefon,
                AccountAktiv = b.AccountAktiv,
                CreatedBySso = b.CreatedBySso,
                Geloescht = b.Benutzer.Geloescht,
                BenutzerRollen = MergeOrganisationAndUserRoles(b),
            })
            .First();
    }

    private static OrganisationUebersichtDto BuildOrganisationUebersichtDto(Organisation o)
    {
        return new OrganisationUebersichtDto
        {
            Id = o.Id,
            Name = o.Name,
            Telefon = o.Telefon,
            Email = o.Email,
            Fax = o.Fax,
            Strasse = o.Strasse ?? string.Empty,
            Bundesland = o.Bundesland ?? string.Empty,
            Ort = o.Ort ?? string.Empty,
            LaenderCode = o.LaenderCode ?? string.Empty,
            Plz = o.Plz ?? string.Empty,
            Geloescht = o.Geloescht,
            AccountAktiv = o.AccountAktiv,
            AenderungsBenutzer = o.AenderungsBenutzer,
            AenderungsDatum = o.AenderungsDatum,
            AnlageBenutzer = o.AnlageBenutzer,
            AnlageDatum = o.AnlageDatum,
            IriPrefix = o.IriPrefix,
            ThemeUrl = o.ThemeUrl ?? string.Empty,
            Bezahlmodelle = o.Bezahlmodelle ?? [],
            MaintenanceActive = o.MaintenanceActive,
            OwnedEclassData = o.OwnedEclassData,
            LogoBase64 = o.LogoBase64 ?? string.Empty,
        };
    }

    public bool AddPaymentModel(long paymentModelId, long orgaId)
    {
        var orga = _context.Organisations.Include(o => o.Bezahlmodelle).First(o => o.Id == orgaId);
        var paymentModel = _context.PaymentModels.First(p => p.Id == paymentModelId);

        var orgaPaymentModel = new OrganisationPaymentModel
        {
            Organisation = orga,
            PaymentModel = paymentModel,
        };

        _context.OrganisationPaymentModels.Add(orgaPaymentModel);
        _context.SaveChanges();

        return true;
    }

    private void SyncKeycloakUserRolesForOrganisation(
        Model.Benutzer user,
        long organisationId,
        IReadOnlyCollection<string> roles
    )
    {
        ProvisionOrganisationUser(user, organisationId, roles, null);
    }

    private void ProvisionOrganisationUser(
        Model.Benutzer user,
        long organisationId,
        IReadOnlyCollection<string> roles,
        string? password
    )
    {
        if (!_keycloakAdminService.IsProvisioningEnabled)
        {
            return;
        }

        var provisionedUser = _keycloakAdminService
            .EnsureUserWithOrganisationRolesAsync(
                user.Email,
                user.Vorname,
                user.Name,
                organisationId,
                roles,
                password,
                false
            )
            .GetAwaiter()
            .GetResult();

        if (provisionedUser != null)
        {
            user.ExternalIdentityProvider = "Keycloak";
            user.ExternalIdentitySubject = provisionedUser.UserId;
            user.ExternalIdentityUsername = provisionedUser.Email;
            _context.SaveChanges();
        }
    }

    public bool UpdatePaymentModel(
        long oldPaymentModelId,
        long newPaymentModelId,
        long orgaId,
        DateTime? endDate,
        Model.AppUser user
    )
    {
        _context.Database.BeginTransaction();

        var orga = _context.Organisations.Include(o => o.Bezahlmodelle).First(o => o.Id == orgaId);
        var newPaymentModel = _context.PaymentModels.First(p => p.Id == newPaymentModelId);
        var orgaPaymentModel = _context.OrganisationPaymentModels.First(op =>
            op.OrganisationId == orgaId && op.PaymentModelId == oldPaymentModelId && !op.Geloescht
        );

        orgaPaymentModel.LoeschBenutzer = user.Benutzer.Email;
        orgaPaymentModel.LoeschDatum = DateTime.Now.ToUniversalTime();
        orgaPaymentModel.Geloescht = true;
        _context.SaveChanges();

        var newOrgaPaymentModel = new OrganisationPaymentModel
        {
            Organisation = orga,
            PaymentModel = newPaymentModel,
            EndDate = endDate,
        };

        _context.OrganisationPaymentModels.Add(newOrgaPaymentModel);
        _context.SaveChanges();

        _context.Database.CommitTransaction();

        return true;
    }

    public bool UpdatePaymentModelEndDate(
        long paymentModelId,
        DateTime? endDate,
        Model.AppUser user
    )
    {
        var orgaPaymentModel = _context.OrganisationPaymentModels.First(op =>
            op.Id == paymentModelId && !op.Geloescht
        );

        orgaPaymentModel.EndDate = endDate;
        _context.SaveChanges();

        return true;
    }

    public int GetActiveUsersCount(long orgaId)
    {
        return _context.BenutzerOrganisations.Count(b =>
            b.OrganisationId == orgaId
            && b.AccountAktiv
            && b.Benutzer.AccountAktiv
            && !b.Geloescht
            && !b.Benutzer.IsSystemUser
        );
    }

    public bool RemovePaymentOption(long paymentOptionId, AppUser user)
    {
        var payment = _context.OrganisationPaymentModels.First(p => p.Id == paymentOptionId);

        payment.LoeschBenutzer = user.Benutzer.Email;
        payment.LoeschDatum = DateTime.Now.ToUniversalTime();
        payment.Geloescht = true;

        _context.SaveChanges();

        return true;
    }

    public List<OrgaTokenDto> GetTokens(AppUser user)
    {
        var apikeys = _context
            .Apikeys.Include(a => a.AasInfrastructureSettings)
            .Where(a =>
                a.OrganisationId == user.OrganisationId && !a.Geloescht && a.BenutzerId == null
            )
            .ToList();

        var result = new List<OrgaTokenDto>();
        apikeys.ForEach(a =>
            result.Add(
                new OrgaTokenDto
                {
                    Id = a.Id,
                    Key = a.Key,
                    ValidUntil = a.ValidUntil,
                    Active = a.Active,
                    Notice = a.Notice,
                    AasInfrastructureName = a.AasInfrastructureSettings?.Name ?? string.Empty,
                    AasInfrastructureId = a.AasInfrastructureSettings?.Id,
                    Scopes = a.Scopes,
                }
            )
        );

        return result;
    }

    public void DeleteToken(AppUser user, long id)
    {
        var apikey = _context.Apikeys.First(a =>
            a.OrganisationId == user.OrganisationId && a.Id == id
        );
        _context.Remove(apikey);

        _context.SaveChanges();
    }

    public OrgaTokenDto AddToken(AppUser user, OrgaTokenDto orgaToken)
    {
        var apikey = new Model.Apikey
        {
            OrganisationId = user.OrganisationId,
            Active = true,
            AasInfrastructureSettingsId = orgaToken.AasInfrastructureId,
            Key = Guid.NewGuid(),
            Notice = orgaToken.Notice,
            Scopes = orgaToken.Scopes,
            ValidUntil = orgaToken.ValidUntil,
        };

        _context.Apikeys.Add(apikey);
        _context.SaveChanges();

        orgaToken.Id = apikey.Id;
        orgaToken.Key = apikey.Key;

        var aasinfra = _context.AasInfrastructureSettings.First(a =>
            a.Id == orgaToken.AasInfrastructureId
        );
        orgaToken.AasInfrastructureName = aasinfra.Name;

        return orgaToken;
    }

    public void ActivateToken(AppUser user, long id)
    {
        var apikey = _context.Apikeys.First(a =>
            a.OrganisationId == user.OrganisationId && a.Id == id
        );

        apikey.Active = true;

        _context.SaveChanges();
    }

    public void DeactivateToken(AppUser user, long id)
    {
        var apikey = _context.Apikeys.First(a =>
            a.OrganisationId == user.OrganisationId && a.Id == id
        );

        apikey.Active = false;

        _context.SaveChanges();
    }

    public List<Invitation> GetInvitations(AppUser benutzer)
    {
        return _context
            .Invitations.Where(i => i.OrganisationId == benutzer.OrganisationId)
            .ToList();
    }

    public Invitation GetInvitationById(long id)
    {
        return _context.Invitations.First(i => i.Id == id);
    }

    public void DeleteInvitation(long id)
    {
        var invitation = _context.Invitations.First(i => i.Id == id);
        DeleteInvitation(invitation);
    }

    public void DeleteInvitation(Invitation invitation)
    {
        _context.Remove(invitation);
        _context.SaveChanges();
    }

    public List<OrganisationPaymentModel> GetPaymentModels(long orgaId)
    {
        return _context
            .OrganisationPaymentModels.Include(op => op.PaymentModel)
            .Where(op => op.OrganisationId == orgaId && !op.PaymentModel.Geloescht && !op.Geloescht)
            .ToList();
    }

    internal bool UpdateUser(BenutzerUpdateDto updateDto, AppUser benutzer, long userId)
    {
        var orgaUserToUpdate = _context
            .BenutzerOrganisations.Include(bo => bo.Benutzer)
            .First(bo => bo.BenutzerId == userId && bo.OrganisationId == benutzer.OrganisationId);

        if (
            !orgaUserToUpdate.AccountAktiv
            && updateDto.AccountAktiv
            && !benutzer.Organisation.MoreUsersAllowed(_context)
        )
        {
            throw new OperationNotAllowedException("NO_MORE_USERS_ALLOWED");
        }

        orgaUserToUpdate.AccountAktiv = updateDto.AccountAktiv;
        orgaUserToUpdate.BenutzerRollen = updateDto.BenutzerRollen;

        if (updateDto.BenutzerRollen.Contains(AuthRoles.SYSTEM_ADMIN))
        {
            orgaUserToUpdate.Benutzer.BenutzerRollen = new List<string> { AuthRoles.SYSTEM_ADMIN };
            orgaUserToUpdate.BenutzerRollen = updateDto
                .BenutzerRollen.Where(r => r != AuthRoles.SYSTEM_ADMIN)
                .ToList();
        }
        else
        {
            EnsureUserRoles(orgaUserToUpdate.Benutzer).Remove(AuthRoles.SYSTEM_ADMIN);
        }

        _context.SaveChanges();
        SyncKeycloakUserRolesForOrganisation(
            orgaUserToUpdate.Benutzer,
            benutzer.OrganisationId,
            orgaUserToUpdate.BenutzerRollen
        );

        return true;
    }

    internal bool DeleteUser(AppUser benutzer, long userId)
    {
        var orgaUserToDelete = _context.BenutzerOrganisations.First(bo =>
            bo.BenutzerId == userId && bo.OrganisationId == benutzer.OrganisationId
        );

        orgaUserToDelete.Geloescht = true;
        orgaUserToDelete.AccountAktiv = false;
        orgaUserToDelete.IsStammOrga = false;
        orgaUserToDelete.PersonalAccessToken = string.Empty;
        orgaUserToDelete.PersonalAccessTokenValidUntil = default;

        _context.SaveChanges();

        return true;
    }

    public OrganisationUserSeatStats GetOrganisationUserSeatStats(long orgaId)
    {
        var orga = _context
            .Organisations.Include(o => o.Bezahlmodelle)
                .ThenInclude(b => b.PaymentModel)
            .First(o => o.Id == orgaId);
        var users = _context.BenutzerOrganisations.Where(b =>
            b.OrganisationId == orgaId && !b.Geloescht && !b.Benutzer.IsSystemUser
        );
        var activeUsersCount = users.Count(b =>
            b.AccountAktiv && b.Benutzer.AccountAktiv && !b.Benutzer.IsSystemUser && !b.Geloescht
        );
        return new OrganisationUserSeatStats
        {
            MaxUserSeatsCount = orga.GetMaxUsersCount(_context),
            ActiveUserSeatsCount = activeUsersCount,
            TotalUsersCount = users.Count(),
        };
    }

    internal List<OrganisationUebersichtBenutzerDto> GetMoveTargets(
        long organisationId,
        long userToMoveId
    )
    {
        var benutzerOrgas = _context
            .BenutzerOrganisations.Include(bo => bo.Benutzer)
            .Where(b =>
                b.OrganisationId == organisationId && !b.Geloescht && b.BenutzerId != userToMoveId
            )
            .ToList();

        return benutzerOrgas
            .Select(b => new OrganisationUebersichtBenutzerDto
            {
                Id = b.Benutzer.Id,
                Name = b.Benutzer.Name,
                Vorname = b.Benutzer.Vorname,
                Email = b.Benutzer.Email,
                Telefon = b.Benutzer.Telefon,
                AccountAktiv = b.AccountAktiv,
                Geloescht = b.Benutzer.Geloescht,
                BenutzerRollen = b.BenutzerRollen,
                IsSystemUser = b.Benutzer.IsSystemUser,
            })
            .ToList();
    }

    internal List<OrganisationAdminUebersichtDto> GetAdminOrgaUebersicht()
    {
        var orgas = _context
            .Organisations.Include(o => o.AasInfrastructureSettings)
            .Where(o => !o.Geloescht)
            .ToList()
            .Select(o => new OrganisationAdminUebersichtDto(
                o,
                _context,
                _appsettings.SingleTenantMode
            ))
            .ToList();

        return orgas;
    }

    internal bool UpdateUserRoles(string[] newRoles, AppUser benutzer, long userId)
    {
        newRoles ??= [];

        if (
            userId == benutzer.BenutzerId
            && benutzer.BenutzerRollen.Contains(AuthRoles.ORGA_ADMIN)
            && !newRoles.Contains(AuthRoles.ORGA_ADMIN)
        )
        {
            throw new OperationNotAllowedException("ORGA_ADMIN_CANNOT_REMOVE_OWN_ROLE");
        }

        var orgaUserToUpdate = _context
            .BenutzerOrganisations.Include(bo => bo.Benutzer)
            .First(bo => bo.BenutzerId == userId && bo.OrganisationId == benutzer.OrganisationId);

        orgaUserToUpdate.BenutzerRollen = newRoles.ToList();

        if (newRoles.Contains(AuthRoles.SYSTEM_ADMIN))
        {
            orgaUserToUpdate.Benutzer.BenutzerRollen = [AuthRoles.SYSTEM_ADMIN];
            orgaUserToUpdate.BenutzerRollen = newRoles
                .Where(r => r != AuthRoles.SYSTEM_ADMIN)
                .ToList();
        }
        else
        {
            EnsureUserRoles(orgaUserToUpdate.Benutzer).Remove(AuthRoles.SYSTEM_ADMIN);
        }

        _context.SaveChanges();
        SyncKeycloakUserRolesForOrganisation(
            orgaUserToUpdate.Benutzer,
            benutzer.OrganisationId,
            orgaUserToUpdate.BenutzerRollen
        );

        return true;
    }

    internal async Task<bool> CreateInfrastructureAsync(long orgaId)
    {
        var orga = await _context
            .Organisations.Include(o => o.AasInfrastructureSettings)
            .Where(o => o.Id == orgaId)
            .FirstOrDefaultAsync();

        if (orga == null)
            throw new Exception("Organisation not found");

        var infrastructure = orga.AasInfrastructureSettings.FirstOrDefault(x =>
            x.IsInternal && !x.Geloescht
        );

        if (infrastructure == null)
        {
            // neu erstellen
            _infrastructureRequester.RequestInfrastructure(orga);
            return true;
        }
        else
        {
            var version = "2.0.0-milestone-04";

            infrastructure.AasDiscoveryVersion = version;
            infrastructure.AasRegistryVersion = version;
            infrastructure.AasRepositoryVersion = version;
            infrastructure.SubmodelRegistryVersion = version;
            infrastructure.SubmodelRepositoryVersion = version;
            infrastructure.ConceptDescriptionRepositoryVersion = version;

            infrastructure.ContainerGuid = orga.InternalAasInfrastructureGuid;
            infrastructure.MongoContainer = $"aas-suite-mongo-{orga.InternalAasInfrastructureGuid}";
            infrastructure.MqttContainer = $"aas-suite-mqtt-{orga.InternalAasInfrastructureGuid}";
            infrastructure.AasEnvContainer =
                $"aas-suite-aas-env-{orga.InternalAasInfrastructureGuid}";
            infrastructure.AasRegistryContainer =
                $"aas-suite-aas-registry-{orga.InternalAasInfrastructureGuid}";
            infrastructure.SmRegistryContainer =
                $"aas-suite-sm-registry-{orga.InternalAasInfrastructureGuid}";
            infrastructure.AasDiscoveryContainer =
                $"aas-suite-aas-discovery-{orga.InternalAasInfrastructureGuid}";

            _context.SaveChanges();
            var externalUrl =
                $"{_appsettings.BaseUrl.AppendSlash()}aas-proxy/"
                + infrastructure.Id
                + "/aas-repo/";
            InfrastructureChangeRequester.RequestInfrastructureChange(
                orga.InternalAasInfrastructureGuid,
                _appsettings.ContainerManagerInboxDirectory,
                infrastructure,
                externalUrl
            );

            return true;
        }
    }
}
