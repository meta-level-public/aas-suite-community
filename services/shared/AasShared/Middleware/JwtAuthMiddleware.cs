using System.Globalization;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AasShared.Configuration;
using AasShared.Model;
using AasShared.Utils;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;

namespace AasShared.Middleware;

public class JwtAuthMiddleware
{
    private readonly RequestDelegate _next;
    private readonly AppSettings _appSettings;

    public JwtAuthMiddleware(RequestDelegate next, AppSettings appSettings)
    {
        _next = next;
        _appSettings = appSettings;
    }

    public async Task Invoke(HttpContext context)
    {
        var token = ExtractToken(context);

        if (!string.IsNullOrEmpty(token))
        {
            var principal = ValidateJwtToken(token, out var claims);
            if (principal != null && claims != null)
            {
                context.User = principal;

                var userContext = await BuildUserContextAsync(context, claims, token);
                if (userContext != null)
                {
                    context.Items[AasDesignerConstants.APP_USER] = userContext.AppUser;
                    context.Items[AasDesignerConstants.CURRENT_ROLES] = userContext
                        .AppUser
                        .BenutzerRollen;
                    if (userContext.CurrentOrganisation != null)
                    {
                        context.Items[AasDesignerConstants.CURRENT_ORGA] =
                            userContext.CurrentOrganisation;
                    }
                }
            }
        }

        await _next(context);
    }

    private static string? ExtractToken(HttpContext context)
    {
        var authHeader = context.Request.Headers["Authorization"].FirstOrDefault();
        if (authHeader != null && authHeader.StartsWith("Bearer "))
        {
            return authHeader["Bearer ".Length..];
        }

        if (context.Request.Query.TryGetValue("access_token", out var queryToken))
        {
            return queryToken.FirstOrDefault();
        }

        return null;
    }

    private ClaimsPrincipal? ValidateJwtToken(string token, out Dictionary<string, string>? claims)
    {
        claims = null;

        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_appSettings.Secret);

            var principal = tokenHandler.ValidateToken(
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
            claims = jwtToken
                .Claims.GroupBy(c => c.Type)
                .ToDictionary(g => g.Key, g => g.First().Value);

            return principal;
        }
        catch
        {
            // Invalid token -> continue without auth context.
        }

        return null;
    }

    private async Task<ResolvedJwtUserContext?> BuildUserContextAsync(
        HttpContext context,
        Dictionary<string, string> claims,
        string token
    )
    {
        if (
            !claims.TryGetValue("id", out var userIdRaw)
            || !long.TryParse(userIdRaw, out var userId)
        )
        {
            return null;
        }

        long? organisationId = null;
        var orgHeader = context.Request.Headers["X-Organisation-ID"].FirstOrDefault();
        if (
            !string.IsNullOrWhiteSpace(orgHeader) && long.TryParse(orgHeader, out var orgFromHeader)
        )
        {
            organisationId = orgFromHeader;
        }
        else if (claims.TryGetValue("organisationIds", out var organisationIdsRaw))
        {
            var firstOrg = organisationIdsRaw.Split(',').FirstOrDefault();
            if (long.TryParse(firstOrg, out var orgFromClaim))
            {
                organisationId = orgFromClaim;
            }
        }

        if (organisationId == null)
        {
            return null;
        }

        var resolver = context.RequestServices.GetService<IJwtUserContextResolver>();
        if (resolver != null)
        {
            var resolved = await resolver.ResolveAsync(
                context,
                claims,
                token,
                userId,
                organisationId.Value
            );
            if (resolved != null)
            {
                return resolved;
            }
        }

        var fallbackRoles = ExtractRoleClaims(context.User).ToList();
        var infrastructureIdHeader = context
            .Request.Headers["X-Infrastructure-ID"]
            .FirstOrDefault();

        var appUser = new AppUser
        {
            BenutzerId = userId,
            OrganisationId = organisationId.Value,
            BenutzerRollen = fallbackRoles,
            JwtToken = token,
            CurrrentLanguage = context.Request.Headers["X-Gui-Language"].FirstOrDefault() ?? "en",
            InfrastructureSettingsId = long.TryParse(
                infrastructureIdHeader,
                NumberStyles.Integer,
                CultureInfo.InvariantCulture,
                out var infrastructureId
            )
                ? infrastructureId
                : null,
        };

        return new ResolvedJwtUserContext { AppUser = appUser };
    }

    private static IEnumerable<string> ExtractRoleClaims(ClaimsPrincipal principal)
    {
        return principal
            .Claims.Where(c =>
                c.Type == ClaimTypes.Role
                || c.Type == "role"
                || c.Type == "roles"
                || c.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
            )
            .SelectMany(c =>
                c.Value.Split(
                    ',',
                    StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries
                )
            )
            .Distinct(StringComparer.OrdinalIgnoreCase);
    }
}
