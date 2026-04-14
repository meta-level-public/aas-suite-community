namespace AasDesignerApi.Authorization;

using System.Net.Mail;
using System.Security.Authentication;
using System.Text.Json;
using AasDesignerApi.Authorization.Model;
using AasDesignerApi.Controllers.Internal;
using AasDesignerApi.Model;
using AasDesignerApi.Model.Client;
using AasDesignerCommon.Utils;
using AasDesignerModel;
using AasDesignerModel.Model;
using AasShared.Configuration;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Primitives;

public class UserService : IUserService
{
    private readonly IApplicationDbContext _context;
    private readonly JwtUtils _jwtUtils;
    private readonly AppSettings _appSettings;

    public UserService(IApplicationDbContext context, JwtUtils jwtUtils, AppSettings appSettings)
    {
        _context = context;
        _jwtUtils = jwtUtils;
        _appSettings = appSettings;
    }

    public AuthenticateResponse Authenticate(AuthenticateRequest model, string ipAddress)
    {
        _ = model;
        _ = ipAddress;
        throw new AuthenticationException("PASSWORD_LOGIN_DISABLED");
    }

    private static List<BenutzerOrganisation> GetValidOrgas(Benutzer user)
    {
        List<BenutzerOrganisation> validOrgas = [];
        if (user.BenutzerOrganisationen != null)
        {
            foreach (var orga in user.BenutzerOrganisationen)
            {
                if (orga.Organisation.Bezahlmodelle != null)
                {
                    validOrgas.Add(orga);
                }
            }
        }

        return validOrgas;
    }

    private Organisation? GetDefaultOrganisation()
    {
        return _context
            .Organisations.Include(o =>
                o.Bezahlmodelle.Where(bm =>
                    !bm.Geloescht && (bm.EndDate >= DateTime.Now || bm.EndDate == null)
                )
            )
                .ThenInclude(bm => bm.PaymentModel)
            .FirstOrDefault(o => !o.Geloescht);
    }

    private List<string> ResolveLoginRoles(ExternalLoginResult response)
    {
        return response.Roles.Count > 0 && HasValidAasSuiteRoles(response.Roles)
            ? GetValidAasSuiteRoles(response.Roles)
            : [AuthRoles.BENUTZER];
    }

    private bool TryRestoreSingleTenantOrganisation(Benutzer benutzer, ExternalLoginResult result)
    {
        if (!_appSettings.SingleTenantMode)
        {
            return false;
        }

        var defaultOrga = GetDefaultOrganisation();
        if (defaultOrga == null)
        {
            return false;
        }

        var existingMembership = _context.BenutzerOrganisations.FirstOrDefault(bo =>
            bo.BenutzerId == benutzer.Id && bo.OrganisationId == defaultOrga.Id
        );

        if (existingMembership != null)
        {
            existingMembership.Geloescht = false;
            existingMembership.AccountAktiv = true;
            existingMembership.CreatedBySso = true;
            existingMembership.IsStammOrga = true;
            existingMembership.BenutzerRollen = ResolveLoginRoles(result);
        }
        else
        {
            _context.BenutzerOrganisations.Add(
                new BenutzerOrganisation
                {
                    Organisation = defaultOrga,
                    Benutzer = benutzer,
                    BenutzerRollen = ResolveLoginRoles(result),
                    AccountAktiv = true,
                    IsStammOrga = true,
                    CreatedBySso = true,
                }
            );
        }

        benutzer.CreatedBySso = true;
        _context.SaveChanges();

        return true;
    }

    public AuthenticateResponse AuthenticateViewer(ViewerLogin loginData)
    {
        var sharedLink = _context.SharedLinks.FirstOrDefault(sl => sl.Guid == loginData.Guid);

        if (sharedLink == null)
        {
            throw new AuthenticationException("SHARED_LINK_DOES_NOT_EXIST");
        }
        if (sharedLink.Ablaufdatum < DateTime.Now)
        {
            throw new AuthenticationException("SHARED_LINK_EXPIRED");
        }
        if (
            sharedLink.HasPasswort
            && sharedLink.Passwort
                != (
                    loginData.Passwort != null
                        ? PasswordHelper.GenerateHash(loginData.Passwort, _appSettings.Salt)
                        : string.Empty
                )
        )
        {
            throw new AuthenticationException("SHARED_LINK_WRONG_PASSWORD");
        }

        var orga = _context.Organisations.FirstOrDefault(o =>
            o.Id == sharedLink.BesitzerOrganisationId
        );
        if (orga == null)
        {
            throw new AuthenticationException("ORGANISATION_NOT_FOUND");
        }

        var infrastructure = _context.AasInfrastructureSettings.FirstOrDefault(i =>
            i.Id == sharedLink.AasInfrastrukturId
        );
        if (infrastructure == null)
        {
            throw new AuthenticationException("INFRASTRUCTURE_NOT_FOUND");
        }
        // authentication successful so generate user in dictionary
        Benutzer user = ViewerUserCacheService.CreateNewViewerUser(loginData, orga, infrastructure);

        // now create jwt and refresh tokens
        var jwtToken = _jwtUtils.GenerateJwtToken(user);
        var refreshToken = _jwtUtils.GenerateRefreshToken(string.Empty);
        user.RefreshTokens.Add(refreshToken);
        user.LetzerLogin = DateTime.Now;

        return new AuthenticateResponse(
            user,
            jwtToken,
            refreshToken.Token,
            ResultCode.OK,
            user.BenutzerOrganisationen,
            _appSettings.SingleTenantMode
        );
    }

    public AuthenticateResponse RefreshToken(string token, string ipAddress)
    {
        var user = GetUserByRefreshToken(token);
        var refreshToken = user.RefreshTokens.Single(x => x.Token == token);

        if (refreshToken.IsRevoked)
        {
            // revoke all descendant tokens in case this token has been compromised
            RevokeDescendantRefreshTokens(
                refreshToken,
                user,
                ipAddress,
                $"Attempted reuse of revoked ancestor token: {token}"
            );
            _context.Update(user);
            _context.SaveChanges();
            throw new AuthenticationException("TOKEN_REVOKED");
        }

        if (!refreshToken.IsActive)
            throw new AuthenticationException("INVALID_TOKEN");

        // replace old refresh token with a new one (rotate token)
        var newRefreshToken = RotateRefreshToken(refreshToken, ipAddress);
        user.RefreshTokens.Add(newRefreshToken);

        // remove old refresh tokens from user
        RemoveOldRefreshTokens(user);

        // save changes to db
        _context.Update(user);
        _context.SaveChanges();

        // generate new jwt
        var jwtToken = _jwtUtils.GenerateJwtToken(user);

        return new AuthenticateResponse(
            user,
            jwtToken,
            newRefreshToken.Token,
            ResultCode.OK,
            GetValidOrgas(user),
            _appSettings.SingleTenantMode
        );
    }

    public void RevokeToken(string token, string ipAddress)
    {
        var user = GetUserByRefreshToken(token);
        var refreshToken = user.RefreshTokens.Single(x => x.Token == token);

        if (!refreshToken.IsActive)
            throw new AuthenticationException("INVALID_TOKEN");

        // revoke token and save
        RevokeRefreshToken(refreshToken, ipAddress, "Revoked without replacement");
        _context.Update(user);
        _context.SaveChanges();
    }

    public IQueryable<Benutzer> GetAll()
    {
        return _context.Benutzers;
    }

    public void Delete(long id)
    {
        var benutzer = _context.Benutzers.First(a => a.Id == id);
        _context.Remove(benutzer);
        _context.SaveChanges();
    }

    // helper methods

    private Benutzer GetUserByRefreshToken(string token)
    {
        var user = _context
            .Benutzers.Include(b => b.BenutzerOrganisationen)
                .ThenInclude(bo => bo.Organisation)
            .AsSplitQuery()
            .SingleOrDefault(u => u.RefreshTokens.Any(t => t.Token == token));

        if (user == null)
            throw new AuthenticationException("INVALID_TOKEN");

        return user;
    }

    private RefreshToken RotateRefreshToken(RefreshToken refreshToken, string ipAddress)
    {
        var newRefreshToken = _jwtUtils.GenerateRefreshToken(ipAddress);
        RevokeRefreshToken(refreshToken, ipAddress, "Replaced by new token", newRefreshToken.Token);
        return newRefreshToken;
    }

    private void RemoveOldRefreshTokens(Benutzer benutzer)
    {
        // remove old inactive refresh tokens from user based on TTL in app settings
        benutzer.RefreshTokens.RemoveAll(x =>
            !x.IsActive && x.Created.AddDays(_appSettings.RefreshTokenTTL) <= DateTime.UtcNow
        );
    }

    private void RevokeDescendantRefreshTokens(
        RefreshToken refreshToken,
        Benutzer benutzer,
        string ipAddress,
        string reason
    )
    {
        // recursively traverse the refresh token chain and ensure all descendants are revoked
        if (!string.IsNullOrEmpty(refreshToken.ReplacedByToken))
        {
            var childToken = benutzer.RefreshTokens.SingleOrDefault(x =>
                x.Token == refreshToken.ReplacedByToken
            );
            if (childToken != null)
            {
                if (childToken.IsActive)
                    RevokeRefreshToken(childToken, ipAddress, reason);
                else
                    RevokeDescendantRefreshTokens(childToken, benutzer, ipAddress, reason);
            }
        }
    }

    private void RevokeRefreshToken(
        RefreshToken token,
        string ipAddress,
        string? reason = null,
        string? replacedByToken = null
    )
    {
        token.Revoked = DateTime.UtcNow;
        token.RevokedByIp = ipAddress;
        token.ReasonRevoked = reason;
        token.ReplacedByToken = replacedByToken;
    }

    public long GetOrgaIdBySharedLinkUser(Benutzer benutzer)
    {
        var sharedLink = _context.SharedLinks.FirstOrDefault(sl =>
            sl.Guid.ToString() == benutzer.Name
        );
        if (sharedLink == null)
            throw new InvalidDataException($"No shared link for id {benutzer.Name} found");

        var orgaId = sharedLink.BesitzerOrganisationId;

        if (orgaId == null)
            throw new InvalidDataException($"No OrgaId found for shared link id {benutzer.Name}");

        return orgaId.Value;
    }

    public Benutzer GetById(long id)
    {
        return _context.Benutzers.First(b => b.Id == id);
    }

    public AppUser GetAppUser(long benutzerId, long orgaId, long aasSettingId)
    {
        if (benutzerId < 0)
            return ViewerUserCacheService.UserCache.FirstOrDefault(u => u.Key == benutzerId).Value;

        var benutzerOrga = _context
            .BenutzerOrganisations.Include(bo => bo.Benutzer)
            .Include(bo => bo.Organisation)
                .ThenInclude(o => o.AasInfrastructureSettings.Where(s => s.Id == aasSettingId))
            .FirstOrDefault(bo => bo.BenutzerId == benutzerId && bo.OrganisationId == orgaId);
        if (benutzerOrga == null)
            throw new InvalidDataException(
                $"No BenutzerOrga found for id {benutzerId} and orgaId {orgaId}"
            );
        List<string> rollen =
        [
            .. benutzerOrga.BenutzerRollen,
            .. benutzerOrga.Benutzer.BenutzerRollen,
        ];
        rollen = rollen.Distinct().ToList();
        return new AppUser
        {
            BenutzerId = benutzerOrga.BenutzerId,
            OrganisationId = benutzerOrga.OrganisationId,
            BenutzerRollen = rollen,
            Organisation = benutzerOrga.Organisation,
            Benutzer = benutzerOrga.Benutzer,
            CurrentInfrastructureSettings =
                benutzerOrga.Organisation.AasInfrastructureSettings.FirstOrDefault(s =>
                    s.Id == aasSettingId
                ) ?? new AasInfrastructureSettings(),
            CurrentPersonalAccessToken = benutzerOrga.PersonalAccessToken,
        };
    }

    public AppUser? GetDefaultAppUser(long benutzerId)
    {
        if (benutzerId < 0)
        {
            return ViewerUserCacheService.UserCache.FirstOrDefault(u => u.Key == benutzerId).Value;
        }

        var benutzerOrga = _context
            .BenutzerOrganisations.Include(bo => bo.Benutzer)
            .Include(bo => bo.Organisation)
                .ThenInclude(o => o.AasInfrastructureSettings)
            .Where(bo => bo.BenutzerId == benutzerId && !bo.Geloescht && bo.AccountAktiv)
            .OrderByDescending(bo => bo.LastLogin)
            .FirstOrDefault();

        if (benutzerOrga == null)
        {
            return null;
        }

        List<string> rollen =
        [
            .. benutzerOrga.BenutzerRollen,
            .. benutzerOrga.Benutzer.BenutzerRollen,
        ];
        rollen = rollen.Distinct().ToList();

        return new AppUser
        {
            BenutzerId = benutzerOrga.BenutzerId,
            OrganisationId = benutzerOrga.OrganisationId,
            BenutzerRollen = rollen,
            Organisation = benutzerOrga.Organisation,
            Benutzer = benutzerOrga.Benutzer,
            CurrentInfrastructureSettings =
                benutzerOrga.Organisation.AasInfrastructureSettings.FirstOrDefault()
                ?? new AasInfrastructureSettings(),
            CurrentPersonalAccessToken = benutzerOrga.PersonalAccessToken,
        };
    }

    public async Task<AuthenticateResponse> AuthenticateExternalSession(
        string token,
        string ipAddress
    )
    {
        var ssoConfig = BuildKeycloakConfiguration();

        if (ssoConfig == null)
        {
            throw new AuthenticationException("SSO_CONFIG_NOT_FOUND");
        }

        var result = await JwtUtils.ValidateExternalJwtTokenAsync(token, ssoConfig);

        if (result.ResultCode != ResultCode.OK)
        {
            return new AuthenticateResponse()
            {
                ResultCode = result.ResultCode,
                AdditionalMessage = result.Message,
            };
        }
        else
        {
            // Benutzer ermitteln
            var identityProvider = string.IsNullOrWhiteSpace(ssoConfig.Type)
                ? "SSO"
                : ssoConfig.Type.Trim();
            var externalSubject = (result.Subject ?? string.Empty).Trim();
            var externalUsername = (result.PreferredUsername ?? string.Empty).Trim();
            var resolvedEmail = (result.Email ?? string.Empty).Trim();

            if (
                string.IsNullOrWhiteSpace(resolvedEmail)
                && MailAddress.TryCreate(externalUsername, out _)
            )
            {
                // Some IdPs do not emit an explicit email claim; use preferred_username when it is a valid mail address.
                resolvedEmail = externalUsername;
            }

            var benutzerQuery = _context
                .Benutzers.Include(b => b.BenutzerOrganisationen)
                    .ThenInclude(bo => bo.Organisation)
                        .ThenInclude(o =>
                            o.Bezahlmodelle.Where(bm =>
                                !bm.Geloescht && (bm.EndDate >= DateTime.Now || bm.EndDate == null)
                            )
                        )
                            .ThenInclude(bm => bm.PaymentModel)
                .Where(b => !b.Geloescht);

            Benutzer? benutzer = null;
            if (
                identityProvider.Equals("Keycloak", StringComparison.OrdinalIgnoreCase)
                && !string.IsNullOrWhiteSpace(externalSubject)
            )
            {
                benutzer = benutzerQuery.FirstOrDefault(b =>
                    b.ExternalIdentityProvider == identityProvider
                    && b.ExternalIdentitySubject == externalSubject
                );
            }
            if (benutzer == null && !string.IsNullOrWhiteSpace(resolvedEmail))
            {
                benutzer = benutzerQuery.FirstOrDefault(b => b.Email == resolvedEmail);
            }

            if (benutzer == null && string.IsNullOrWhiteSpace(resolvedEmail))
            {
                return new AuthenticateResponse() { ResultCode = ResultCode.NO_EMAIL_FOUND };
            }

            if (benutzer != null && !string.IsNullOrWhiteSpace(externalSubject))
            {
                var identityAlreadyAssigned = _context.Benutzers.Any(b =>
                    !b.Geloescht
                    && b.Id != benutzer.Id
                    && b.ExternalIdentityProvider == identityProvider
                    && b.ExternalIdentitySubject == externalSubject
                );

                if (identityAlreadyAssigned)
                {
                    return new AuthenticateResponse()
                    {
                        ResultCode = ResultCode.INVALID_TOKEN,
                        AdditionalMessage = "External identity is already assigned to another user",
                    };
                }

                benutzer.ExternalIdentityProvider = identityProvider;
                benutzer.ExternalIdentitySubject = externalSubject;
                benutzer.ExternalIdentityUsername = externalUsername;
            }

            if (
                benutzer != null
                && identityProvider.Equals("Keycloak", StringComparison.OrdinalIgnoreCase)
            )
            {
                // For IdP-backed login we trust Keycloak's identity lifecycle and do not block on legacy local email confirmation state.
                benutzer.EmailBestaetigt = true;
            }

            if (benutzer == null)
            {
                if (_appSettings.SingleTenantMode)
                {
                    var defaultOrga = GetDefaultOrganisation();
                    if (defaultOrga == null)
                    {
                        return new AuthenticateResponse()
                        {
                            ResultCode = ResultCode.ERROR,
                            AdditionalMessage =
                                "No default organisation found for single-tenant setup",
                        };
                    }

                    if (defaultOrga.MoreUsersAllowed(_context))
                    {
                        var foundRoles = ResolveLoginRoles(result);

                        benutzer = new Benutzer
                        {
                            Email = resolvedEmail,
                            Vorname = result.Firstname,
                            Name = result.Lastname,
                            CreatedBySso = true,
                            EmailBestaetigt = true,
                            ExternalIdentityProvider = identityProvider,
                            ExternalIdentitySubject = externalSubject,
                            ExternalIdentityUsername = externalUsername,
                        };
                        var benutzerOrga = new BenutzerOrganisation
                        {
                            Organisation = defaultOrga,
                            BenutzerRollen = foundRoles,
                            Benutzer = benutzer,
                            AccountAktiv = true,
                            IsStammOrga = true,
                            CreatedBySso = true,
                        };
                        benutzer.BenutzerOrganisationen.Add(benutzerOrga);
                        _context.Benutzers.Add(benutzer);
                        _context.SaveChanges();
                        var singleTenantOrgas = GetValidOrgas(benutzer);
                        var internalJwtToken = _jwtUtils.GenerateJwtToken(benutzer);
                        var internalRefreshToken = _jwtUtils.GenerateRefreshToken(ipAddress);
                        benutzer.RefreshTokens.Add(internalRefreshToken);
                        _context.SaveChanges();

                        return new AuthenticateResponse(
                            benutzer,
                            internalJwtToken,
                            internalRefreshToken.Token,
                            ResultCode.OK,
                            singleTenantOrgas,
                            _appSettings.SingleTenantMode
                        )
                        {
                            PreferredOrgaId = singleTenantOrgas.FirstOrDefault()?.OrganisationId,
                        };
                    }

                    return new AuthenticateResponse()
                    {
                        ResultCode = ResultCode.NO_MORE_USERS_ALLOWED,
                    };
                }

                return new AuthenticateResponse()
                {
                    ResultCode = ResultCode.USER_NOT_FOUND,
                    AdditionalMessage = "User must be provisioned in AAS before first login",
                };
            }
            if (!benutzer.AccountAktiv)
            {
                return new AuthenticateResponse()
                {
                    ResultCode = ResultCode.ACCOUNT_NICHT_AKTIVIERT,
                };
            }
            if (!benutzer.EmailBestaetigt)
            {
                return new AuthenticateResponse()
                {
                    ResultCode = ResultCode.EMAIL_NICHT_BESTAETIGT,
                };
            }

            benutzer.BenutzerOrganisationen = GetValidOrgas(benutzer);
            if (benutzer.BenutzerOrganisationen.Count == 0)
            {
                if (TryRestoreSingleTenantOrganisation(benutzer, result))
                {
                    benutzer = _context
                        .Benutzers.Include(b => b.BenutzerOrganisationen)
                            .ThenInclude(bo => bo.Organisation)
                                .ThenInclude(o =>
                                    o.Bezahlmodelle.Where(bm =>
                                        !bm.Geloescht
                                        && (bm.EndDate >= DateTime.Now || bm.EndDate == null)
                                    )
                                )
                                    .ThenInclude(bm => bm.PaymentModel)
                        .First(b => b.Id == benutzer.Id);
                    benutzer.BenutzerOrganisationen = GetValidOrgas(benutzer);
                }
            }
            if (benutzer.BenutzerOrganisationen.Count == 0)
            {
                return new AuthenticateResponse()
                {
                    ResultCode = ResultCode.ERROR,
                    AdditionalMessage = "NO_ACTIVE_ORGANISATION",
                };
            }

            if (!benutzer.DatenschutzAccepted)
            {
                var internalJwtToken = _jwtUtils.GenerateJwtToken(benutzer);
                var internalRefreshToken = _jwtUtils.GenerateRefreshToken(ipAddress);
                benutzer.RefreshTokens.Add(internalRefreshToken);
                _context.SaveChanges();

                var preferredOrgaForPrivacy = benutzer
                    .BenutzerOrganisationen.OrderByDescending(bo => bo.LastLogin)
                    .Select(bo => bo.OrganisationId)
                    .FirstOrDefault();
                return new AuthenticateResponse(
                    benutzer,
                    internalJwtToken,
                    internalRefreshToken.Token,
                    ResultCode.DATENSCHUTZ_NOT_ACCEPTED,
                    benutzer.BenutzerOrganisationen,
                    _appSettings.SingleTenantMode
                )
                {
                    PreferredOrgaId = preferredOrgaForPrivacy,
                };
            }

            var keycloakRolesByOrganisation = identityProvider.Equals(
                "Keycloak",
                StringComparison.OrdinalIgnoreCase
            )
                ? GetKeycloakRolesByOrganisation(result.ValidatedToken)
                : null;

            benutzer.BenutzerOrganisationen.ForEach(bo =>
            {
                if (
                    keycloakRolesByOrganisation != null
                    && keycloakRolesByOrganisation.TryGetValue(bo.OrganisationId, out var orgaRoles)
                    && orgaRoles.Count > 0
                )
                {
                    bo.BenutzerRollen = orgaRoles;
                }
                else if (result.Roles.Count > 0 && HasValidAasSuiteRoles(result.Roles))
                {
                    // Rollen aktualisieren
                    bo.BenutzerRollen = GetValidAasSuiteRoles(result.Roles);
                }
                bo.LastLogin = DateTime.Now;
            });

            // Keep profile fields in sync with external identity provider.
            benutzer.Email = result.Email ?? string.Empty;
            benutzer.Vorname = result.Firstname ?? string.Empty;
            benutzer.Name = result.Lastname ?? string.Empty;
            if (!string.IsNullOrWhiteSpace(externalSubject))
            {
                benutzer.ExternalIdentityProvider = identityProvider;
                benutzer.ExternalIdentitySubject = externalSubject;
                benutzer.ExternalIdentityUsername = externalUsername;
            }
            _context.SaveChanges();

            var internalJwt = _jwtUtils.GenerateJwtToken(benutzer);
            var internalRefresh = _jwtUtils.GenerateRefreshToken(ipAddress);
            benutzer.RefreshTokens.Add(internalRefresh);
            _context.SaveChanges();

            var preferredOrga = benutzer
                .BenutzerOrganisationen.OrderByDescending(bo => bo.LastLogin)
                .Select(bo => bo.OrganisationId)
                .FirstOrDefault();

            return new AuthenticateResponse(
                benutzer,
                internalJwt,
                internalRefresh.Token,
                result.ResultCode,
                benutzer.BenutzerOrganisationen,
                _appSettings.SingleTenantMode
            )
            {
                PreferredOrgaId = preferredOrga,
            };
        }
        ;
    }

    private ExternalIdentityProviderConfiguration? BuildKeycloakConfiguration()
    {
        if (!_appSettings.KeycloakEnabled)
        {
            return null;
        }

        if (
            string.IsNullOrWhiteSpace(_appSettings.KeycloakWellKnownUrl)
            || string.IsNullOrWhiteSpace(_appSettings.KeycloakIssuer)
            || string.IsNullOrWhiteSpace(_appSettings.KeycloakClientId)
        )
        {
            return null;
        }

        var publicIssuer = string.IsNullOrWhiteSpace(_appSettings.KeycloakPublicIssuer)
            ? _appSettings.KeycloakIssuer
            : _appSettings.KeycloakPublicIssuer;

        return new ExternalIdentityProviderConfiguration
        {
            Type = "Keycloak",
            WellKnownUrl = _appSettings.KeycloakWellKnownUrl,
            Issuer = publicIssuer,
            Audience = string.IsNullOrWhiteSpace(_appSettings.KeycloakAudience)
                ? _appSettings.KeycloakClientId
                : _appSettings.KeycloakAudience,
            AuthorizationUrl = publicIssuer,
            ResouceAccessName = _appSettings.KeycloakResourceAccessName,
            EMailClaimName = _appSettings.KeycloakEmailClaimName,
            FirstNameClaimName = _appSettings.KeycloakFirstNameClaimName,
            LastNameClaimName = _appSettings.KeycloakLastNameClaimName,
        };
    }

    public bool HasValidAasSuiteRoles(List<string> roles)
    {
        var validRoles = AuthRoles.GetRoles();
        return roles.Any(validRoles.Contains) || roles.Contains("USER");
    }

    public List<string> GetValidAasSuiteRoles(List<string> roles)
    {
        var validRoles = AuthRoles.GetRoles();
        var foundRoles = roles.Intersect(validRoles).ToList();
        if (roles.Contains("USER"))
        {
            foundRoles.Add(AuthRoles.BENUTZER);
        }
        return foundRoles;
    }

    public void RegisterOrgaSwitch(AppUser user, long newOrgaId)
    {
        var benutzerOrga = _context
            .BenutzerOrganisations.Include(bo => bo.Organisation)
            .FirstOrDefault(bo =>
                bo.BenutzerId == user.BenutzerId && bo.OrganisationId == newOrgaId
            );

        if (benutzerOrga == null)
        {
            throw new InvalidDataException(
                $"No BenutzerOrga found for id {user.BenutzerId} and orgaId {newOrgaId}"
            );
        }
        benutzerOrga.LastLogin = DateTime.Now;
        _context.SaveChanges();
    }

    public void AcceptPrivacy(AppUser user)
    {
        var dbUser = _context.Benutzers.FirstOrDefault(u => u.Id == user.BenutzerId);
        if (dbUser == null)
        {
            throw new InvalidDataException($"No Benutzer found for id {user.BenutzerId}");
        }
        dbUser.DatenschutzAccepted = true;
        dbUser.DatenschutzAcceptedDate = DateTime.Now;
        _context.SaveChanges();
    }

    private Dictionary<long, List<string>>? GetKeycloakRolesByOrganisation(
        System.IdentityModel.Tokens.Jwt.JwtSecurityToken? token
    )
    {
        if (token == null)
        {
            return null;
        }

        var roleMap = new Dictionary<long, HashSet<string>>();
        var validRoles = AuthRoles.GetRoles().ToHashSet(StringComparer.OrdinalIgnoreCase);

        foreach (var groupPath in ExtractGroupPaths(token))
        {
            var trimmed = groupPath.Trim('/');
            var segments = trimmed.Split('/', StringSplitOptions.RemoveEmptyEntries);
            if (segments.Length < 2)
            {
                continue;
            }

            var orgaSegment = segments[0];
            if (!orgaSegment.StartsWith("org-", StringComparison.OrdinalIgnoreCase))
            {
                continue;
            }

            if (!long.TryParse(orgaSegment[4..], out var organisationId))
            {
                continue;
            }

            var role = segments[^1].Trim();
            if (!validRoles.Contains(role))
            {
                continue;
            }

            if (!roleMap.TryGetValue(organisationId, out var roles))
            {
                roles = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
                roleMap[organisationId] = roles;
            }
            roles.Add(role);
        }

        return roleMap.Count == 0
            ? null
            : roleMap.ToDictionary(kvp => kvp.Key, kvp => kvp.Value.ToList());
    }

    private static List<string> ExtractGroupPaths(
        System.IdentityModel.Tokens.Jwt.JwtSecurityToken token
    )
    {
        var groups = new List<string>();
        var claims = token.Claims.Where(c => c.Type == "groups").Select(c => c.Value);

        foreach (var claim in claims)
        {
            if (string.IsNullOrWhiteSpace(claim))
            {
                continue;
            }

            if (claim.StartsWith("[", StringComparison.Ordinal))
            {
                try
                {
                    using var doc = JsonDocument.Parse(claim);
                    if (doc.RootElement.ValueKind == JsonValueKind.Array)
                    {
                        foreach (var item in doc.RootElement.EnumerateArray())
                        {
                            if (item.ValueKind == JsonValueKind.String)
                            {
                                var value = item.GetString();
                                if (!string.IsNullOrWhiteSpace(value))
                                {
                                    groups.Add(value);
                                }
                            }
                        }
                    }
                }
                catch
                {
                    // ignore malformed claim values
                }
            }
            else
            {
                groups.Add(claim);
            }
        }

        return groups;
    }
}
