using AasDesignerApi.Authorization;
using AasDesignerCommon.Utils;

namespace AasDesignerApi.Auth;

public class VwsGeneratorJwtMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<VwsGeneratorJwtMiddleware> _logger;

    public VwsGeneratorJwtMiddleware(
        RequestDelegate next,
        ILogger<VwsGeneratorJwtMiddleware> logger
    )
    {
        _next = next;
        _logger = logger;
    }

    public async Task Invoke(HttpContext context, IUserService userService, IJwtUtils jwtUtils)
    {
        var splittedAuthHeader = context
            .Request.Headers["Authorization"]
            .FirstOrDefault()
            ?.Split(" ");
        var token =
            splittedAuthHeader != null
                ? splittedAuthHeader[splittedAuthHeader.Length - 1]
                : string.Empty;
        var orgaId = context.Request.Headers["X-Organisation-ID"].FirstOrDefault();
        var currentLanguage = context.Request.Headers["X-Gui-Language"].FirstOrDefault();
        var aasInfrastructureId = context.Request.Headers["X-Infrastructure-ID"].FirstOrDefault();
        if (IsAasProxyWriteRequest(context.Request))
        {
            _logger.LogInformation(
                "Evaluating proxy write auth context for {Method} {Path}. HasAuthorization={HasAuthorization}, HasOrganisationId={HasOrganisationId}, HasInfrastructureId={HasInfrastructureId}",
                context.Request.Method,
                context.Request.Path.Value,
                !string.IsNullOrEmpty(token),
                !string.IsNullOrEmpty(orgaId),
                !string.IsNullOrEmpty(aasInfrastructureId)
            );
        }

        if (
            IsAasProxyWriteRequest(context.Request)
            && (
                string.IsNullOrEmpty(token)
                || string.IsNullOrEmpty(orgaId)
                || string.IsNullOrEmpty(aasInfrastructureId)
            )
        )
        {
            _logger.LogWarning(
                "Skipping AppUser resolution for proxy write {Method} {Path} because auth context is incomplete. HasAuthorization={HasAuthorization}, HasOrganisationId={HasOrganisationId}, HasInfrastructureId={HasInfrastructureId}",
                context.Request.Method,
                context.Request.Path.Value,
                !string.IsNullOrEmpty(token),
                !string.IsNullOrEmpty(orgaId),
                !string.IsNullOrEmpty(aasInfrastructureId)
            );
        }

        if (
            !string.IsNullOrEmpty(token)
            && !string.IsNullOrEmpty(orgaId)
            && !string.IsNullOrEmpty(aasInfrastructureId)
        )
        {
            var userId = jwtUtils.ValidateJwtToken(token);
            if (userId != null)
            {
                AttachUserToContext(
                    userId.Value,
                    userService,
                    aasInfrastructureId,
                    orgaId,
                    currentLanguage,
                    context,
                    token
                );
            }
            else
            {
                userId = await jwtUtils.ValidateExternalJwtToken(token, orgaId);
                if (userId != null)
                {
                    AttachUserToContext(
                        userId.Value,
                        userService,
                        aasInfrastructureId,
                        orgaId,
                        currentLanguage,
                        context,
                        token
                    );
                }
                else if (IsAasProxyWriteRequest(context.Request))
                {
                    _logger.LogWarning(
                        "JWT validation failed for proxy write {Method} {Path}.",
                        context.Request.Method,
                        context.Request.Path.Value
                    );
                }
            }
        }
        else if (!string.IsNullOrEmpty(token) && IsAcceptPrivacyRequest(context.Request.Path))
        {
            // Privacy acceptance can run before organisation/infrastructure headers are initialized on the client.
            var userId =
                jwtUtils.ValidateJwtToken(token)
                ?? await jwtUtils.ValidateExternalJwtToken(token, string.Empty);
            if (userId != null)
            {
                var appUser = userService.GetDefaultAppUser(userId.Value);
                if (appUser != null)
                {
                    appUser.JwtToken = token;
                    appUser.CurrrentLanguage = currentLanguage ?? "en";
                    context.Items[AasDesignerConstants.CURRENT_USER] = appUser.Benutzer;
                    context.Items[AasDesignerConstants.APP_USER] = appUser;
                    context.Items[AasDesignerConstants.CURRENT_ORGA] = appUser.Organisation;
                    context.Items[AasDesignerConstants.CURRENT_ROLES] = appUser.BenutzerRollen;
                    context.Items[AasDesignerConstants.CURRENT_LANGUAGE] = appUser.BenutzerRollen;
                }
            }
        }
        await _next(context);
    }

    private static bool IsAcceptPrivacyRequest(PathString path)
    {
        return path.HasValue
            && path.Value != null
            && path.Value.EndsWith("/api/Auth/AcceptPrivacy", StringComparison.OrdinalIgnoreCase);
    }

    private static bool IsAasProxyWriteRequest(HttpRequest request)
    {
        var path = request.Path;
        var isProxyPath = path.StartsWithSegments("/aas-proxy", StringComparison.OrdinalIgnoreCase);

        return isProxyPath
            && (
                HttpMethods.IsPatch(request.Method)
                || HttpMethods.IsPost(request.Method)
                || HttpMethods.IsPut(request.Method)
                || HttpMethods.IsDelete(request.Method)
            );
    }

    private void AttachUserToContext(
        long userId,
        IUserService userService,
        string aasInfrastructureId,
        string orgaId,
        string? currentLanguage,
        HttpContext context,
        string token
    )
    {
        var appUser = userService.GetAppUser(
            userId,
            long.Parse(orgaId),
            long.Parse(aasInfrastructureId)
        );

        appUser.JwtToken = token;

        // attach user to context on successful jwt validation
        try
        {
            appUser.CurrrentLanguage = currentLanguage ?? "en";
            // prüfen ob Wartung, und Token damit invalide erklären -> nutzer nicht in context setzen
            if (!appUser.Organisation.MaintenanceActive)
            {
                context.Items[AasDesignerConstants.CURRENT_USER] = appUser.Benutzer;
                context.Items[AasDesignerConstants.APP_USER] = appUser;
                context.Items[AasDesignerConstants.CURRENT_ORGA] = appUser.Organisation;
                context.Items[AasDesignerConstants.CURRENT_ROLES] = appUser.BenutzerRollen;
                context.Items[AasDesignerConstants.CURRENT_LANGUAGE] = appUser.BenutzerRollen;

                if (IsAasProxyWriteRequest(context.Request))
                {
                    _logger.LogInformation(
                        "Attached AppUser {UserId} for proxy write {Method} {Path} with organisation {OrganisationId} and infrastructure {InfrastructureId}.",
                        userId,
                        context.Request.Method,
                        context.Request.Path.Value,
                        orgaId,
                        aasInfrastructureId
                    );
                }
            }
            else if (IsAasProxyWriteRequest(context.Request))
            {
                _logger.LogWarning(
                    "Resolved AppUser {UserId} for proxy write {Method} {Path}, but the organisation is in maintenance mode.",
                    userId,
                    context.Request.Method,
                    context.Request.Path.Value
                );
            }
        }
        catch (Exception ex)
        {
            if (IsAasProxyWriteRequest(context.Request))
            {
                _logger.LogWarning(
                    ex,
                    "Failed to attach AppUser {UserId} for proxy write {Method} {Path}.",
                    userId,
                    context.Request.Method,
                    context.Request.Path.Value
                );
            }
        }
    }
}
