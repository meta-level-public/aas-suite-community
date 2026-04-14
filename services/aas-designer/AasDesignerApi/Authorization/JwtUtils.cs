namespace AasDesignerApi.Authorization;

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using System.Threading.Tasks;
using AasDesignerApi.Authorization.Model;
using AasDesignerApi.Model;
using AasDesignerApi.Model.Client;
using AasDesignerModel;
using AasShared.Configuration;
using Certes.Acme.Resource;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using NLog.LayoutRenderers;

public class JwtUtils : IJwtUtils
{
    private readonly IApplicationDbContext _context;
    private readonly AppSettings _appSettings;

    public JwtUtils(IApplicationDbContext context, AppSettings appSettings)
    {
        _context = context;
        _appSettings = appSettings;
    }

    public string GenerateJwtToken(Benutzer benutzer)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_appSettings.Secret);

        var orgaIds =
            benutzer
                .BenutzerOrganisationen.Select(o => o.Organisation.Id.ToString())
                .Aggregate((a, b) => a + "," + b)
            ?? string.Empty;
        var orgas =
            benutzer
                .BenutzerOrganisationen.Select(o =>
                    JsonConvert.SerializeObject(new { o.Organisation.Id, o.Organisation.Name })
                )
                .Aggregate((a, b) => a + "," + b)
            ?? string.Empty;
        // gültigkeit 15 Minuten
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity([
                new Claim("id", benutzer.Id.ToString()),
                new Claim("organisationIds", orgaIds),
                new Claim("organisations", orgas),
            ]),
            // Expires = DateTime.UtcNow.AddSeconds(15),
            Expires = DateTime.UtcNow.AddMinutes(15),
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature
            ),
        };
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    public long? ValidateJwtToken(string token)
    {
        if (token == null)
            return null;

        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_appSettings.Secret);
        try
        {
            tokenHandler.ValidateToken(
                token,
                new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ClockSkew = TimeSpan.Zero,
                },
                out SecurityToken validatedToken
            );

            var jwtToken = (JwtSecurityToken)validatedToken;
            var userId = long.Parse(jwtToken.Claims.First(x => x.Type == "id").Value);

            return userId;
        }
        catch
        {
            return null;
        }
    }

    public static async Task<ExternalLoginResult> ValidateExternalJwtTokenAsync(
        string token,
        ExternalIdentityProviderConfiguration ssoSourceConfiguration
    )
    {
        var result = new ExternalLoginResult();
        if (string.IsNullOrEmpty(token))
        {
            result.ResultCode = ResultCode.NO_TOKEN_FOUND;
            return result;
        }

        var tokenHandler = new JwtSecurityTokenHandler();

        ConfigurationManager<OpenIdConnectConfiguration> configurationManager;
        if (ssoSourceConfiguration.Certificate != null)
        {
            var certificate = X509CertificateLoader.LoadPkcs12(
                ssoSourceConfiguration.Certificate,
                ssoSourceConfiguration.CertificatePassword
            );

            // Create an HttpClientHandler and set the client certificate
            var handler = new HttpClientHandler();
            handler.ClientCertificates.Add(certificate);

            // Create an HttpClient using the handler
            var validationHttpClient = new HttpClient(handler);

            configurationManager = new ConfigurationManager<OpenIdConnectConfiguration>(
                ssoSourceConfiguration.WellKnownUrl,
                new OpenIdConnectConfigurationRetriever(),
                new HttpDocumentRetriever(validationHttpClient) { RequireHttps = false }
            );
        }
        else
        {
            configurationManager = new ConfigurationManager<OpenIdConnectConfiguration>(
                ssoSourceConfiguration.WellKnownUrl,
                new OpenIdConnectConfigurationRetriever(),
                new HttpDocumentRetriever() { RequireHttps = false }
            );
        }
        try
        {
            var discoveryDocument = await configurationManager.GetConfigurationAsync();
            var signingKeys = discoveryDocument.SigningKeys;
            var validIssuers = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            if (!string.IsNullOrWhiteSpace(ssoSourceConfiguration.Issuer))
            {
                validIssuers.Add(ssoSourceConfiguration.Issuer.Trim());
            }
            if (!string.IsNullOrWhiteSpace(ssoSourceConfiguration.AuthorizationUrl))
            {
                validIssuers.Add(ssoSourceConfiguration.AuthorizationUrl.Trim());
            }
            if (!string.IsNullOrWhiteSpace(discoveryDocument.Issuer))
            {
                validIssuers.Add(discoveryDocument.Issuer.Trim());
            }

            tokenHandler.ValidateToken(
                token,
                new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuers = validIssuers,
                    ValidateAudience = true,
                    ValidAudience = ssoSourceConfiguration.Audience.Trim(),
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKeys = signingKeys,
                    ValidateLifetime = true,
                },
                out SecurityToken validatedToken
            );

            var jwtToken = (JwtSecurityToken)validatedToken;
            var subject =
                jwtToken.Claims.FirstOrDefault(x => x.Type == "sub")?.Value ?? string.Empty;
            var preferredUsername =
                jwtToken.Claims.FirstOrDefault(x => x.Type == "preferred_username")?.Value
                ?? string.Empty;
            var email =
                jwtToken
                    .Claims.FirstOrDefault(x => x.Type == ssoSourceConfiguration.EMailClaimName)
                    ?.Value
                ?? string.Empty;
            var firstname =
                jwtToken
                    .Claims.FirstOrDefault(x => x.Type == ssoSourceConfiguration.FirstNameClaimName)
                    ?.Value
                ?? string.Empty;
            var lastname =
                jwtToken
                    .Claims.FirstOrDefault(x => x.Type == ssoSourceConfiguration.LastNameClaimName)
                    ?.Value
                ?? string.Empty;
            SetRoles(jwtToken, result, ssoSourceConfiguration);
            result.ResultCode = ResultCode.OK;
            result.Subject = subject;
            result.PreferredUsername = preferredUsername;
            result.Email = email;
            result.Firstname = firstname;
            result.Lastname = lastname;
            result.ValidatedToken = jwtToken;
        }
        catch (SecurityTokenExpiredException ex)
        {
            result.ResultCode = ResultCode.EXPIRED_TOKEN;
            result.Message = ex.Message;
        }
        catch (SecurityTokenValidationException ex)
        {
            result.ResultCode = ResultCode.INVALID_TOKEN;
            result.Message = ex.Message;
        }
        catch (Exception ex)
        {
            result.ResultCode = ResultCode.ERROR;
            result.Message = ex.Message;
        }

        return result;
    }

    private static void SetRoles(
        JwtSecurityToken jwtToken,
        ExternalLoginResult result,
        ExternalIdentityProviderConfiguration ssoSourceConfiguration
    )
    {
        if (ssoSourceConfiguration.Type == "Azure")
        {
            SetAzureRoles(jwtToken, result);
        }
        else if (ssoSourceConfiguration.Type == "Keycloak")
        {
            SetKeycloakRoles(jwtToken, result, ssoSourceConfiguration.ResouceAccessName);
        }
        else
        {
            // nicht definiert - vielleicht per JSON-Path später
        }
    }

    private static void SetAzureRoles(JwtSecurityToken jwtToken, ExternalLoginResult result)
    {
        jwtToken
            .Claims.Where(c => c.Type == "roles")
            .ToList()
            .ForEach(c => result.Roles.Add(c.Value));
    }

    private static void SetKeycloakRoles(
        JwtSecurityToken jwtToken,
        ExternalLoginResult result,
        string resourceName
    )
    {
        var resourceAccessClaim = jwtToken
            .Claims.FirstOrDefault(x => x.Type == "resource_access")
            ?.Value;
        if (!string.IsNullOrWhiteSpace(resourceAccessClaim))
        {
            var resourceAccessObj = JObject.Parse(resourceAccessClaim);
            var resourceRoles = resourceAccessObj
                .GetValue(resourceName ?? "account")
                ?.ToObject<JObject>()
                ?.GetValue("roles");
            foreach (JToken role in resourceRoles ?? new JArray())
            {
                result.Roles.Add(role.ToString());
            }
        }

        var realmAccessClaim = jwtToken.Claims.FirstOrDefault(x => x.Type == "realm_access")?.Value;
        if (!string.IsNullOrWhiteSpace(realmAccessClaim))
        {
            var realmAccessObj = JObject.Parse(realmAccessClaim);
            var realmRoles = realmAccessObj.GetValue("roles");
            foreach (JToken role in realmRoles ?? new JArray())
            {
                result.Roles.Add(role.ToString());
            }
        }
    }

    public RefreshToken GenerateRefreshToken(string ipAddress)
    {
        var refreshToken = new RefreshToken
        {
            Token = GetUniqueToken(),
            // gütigkeit 7 Tage
            Expires = DateTime.UtcNow.AddDays(7),
            Created = DateTime.UtcNow,
            CreatedByIp = ipAddress,
        };

        return refreshToken;

        string GetUniqueToken()
        {
            var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
            // Sicherstellen, dass eindeutig!
            var tokenIsUnique = !_context.Benutzers.Any(u =>
                u.RefreshTokens.Any(t => t.Token == token)
            );

            if (!tokenIsUnique)
                return GetUniqueToken();

            return token;
        }
    }

    public async Task<long?> ValidateExternalJwtToken(string token, string orgaId)
    {
        var ssoSourceConfiguration = BuildKeycloakConfiguration();
        if (ssoSourceConfiguration == null)
            return null;
        var res = await ValidateExternalJwtTokenAsync(token, ssoSourceConfiguration);

        if (res.ResultCode == ResultCode.OK)
        {
            var subject = res.Subject.Trim();
            if (!string.IsNullOrWhiteSpace(subject))
            {
                var userByExternalIdentity = _context.Benutzers.FirstOrDefault(u =>
                    !u.Geloescht
                    && u.ExternalIdentityProvider == "Keycloak"
                    && u.ExternalIdentitySubject == subject
                );
                if (userByExternalIdentity != null)
                {
                    return userByExternalIdentity.Id;
                }
            }

            var email = res.Email;
            return _context.Benutzers.FirstOrDefault(u => !u.Geloescht && u.Email == email)?.Id;
        }

        return null;
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
}
