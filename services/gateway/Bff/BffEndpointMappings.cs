using System.Text.Json;
using Microsoft.AspNetCore.Antiforgery;

namespace gateway.Bff;

public static class BffEndpointMappings
{
    public static IEndpointRouteBuilder MapBffAuthEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet(
            "/bff/csrf",
            (HttpContext context, IAntiforgery antiforgery) =>
            {
                var tokens = antiforgery.GetAndStoreTokens(context);
                context.Response.Cookies.Append(
                    "vws-csrf-request",
                    tokens.RequestToken ?? string.Empty,
                    new CookieOptions
                    {
                        HttpOnly = false,
                        IsEssential = true,
                        SameSite = SameSiteMode.Lax,
                        Secure = context.Request.IsHttps,
                        Path = "/",
                    }
                );
                return Results.NoContent();
            }
        );

        endpoints.MapGet(
            "/bff/session",
            async (HttpContext context, GatewayBffSessionService sessionService) =>
            {
                var session = await sessionService.GetSanitizedSessionAsync(
                    context.Session,
                    context.RequestAborted
                );
                return session == null ? Results.Unauthorized() : Results.Json(session);
            }
        );

        endpoints.MapPost(
            "/bff/session/refresh",
            async (HttpContext context, GatewayBffSessionService sessionService) =>
            {
                var session = await sessionService.RefreshSessionAsync(
                    context.Session,
                    context.RequestAborted
                );
                return session == null ? Results.Unauthorized() : Results.Json(session);
            }
        );

        endpoints.MapPost(
            "/bff/logout",
            async (HttpContext context, GatewayBffSessionService sessionService) =>
            {
                var response = await sessionService.RevokeAndClearSessionAsync(
                    context.Session,
                    $"{context.Request.Scheme}://{context.Request.Host}/login",
                    context.RequestAborted
                );
                return Results.Json(response);
            }
        );

        endpoints.MapGet(
            "/bff/auth/sso/start",
            async (HttpContext context, GatewayBffSessionService sessionService) =>
            {
                var requestedSource = context.Request.Query["ssoSource"].ToString();
                var returnUrl = context.Request.Query["returnUrl"].ToString();
                var ssoSource = !string.IsNullOrWhiteSpace(requestedSource)
                    ? requestedSource
                    : await sessionService.GetDefaultSsoSourceAsync(context.RequestAborted);

                if (string.IsNullOrWhiteSpace(ssoSource))
                {
                    return Results.Redirect(
                        "/sso-login-status?resultCode=ERROR&message=SSO_CONFIG_NOT_FOUND"
                    );
                }

                var redirectUri =
                    $"{context.Request.Scheme}://{context.Request.Host}/sso-login-success";
                var authorizationUrl = await sessionService.BuildSsoAuthorizationUrlAsync(
                    ssoSource,
                    redirectUri,
                    returnUrl,
                    context.Session,
                    context.RequestAborted
                );

                return Results.Redirect(authorizationUrl);
            }
        );

        endpoints.MapGet(
            "/sso-login-success",
            async (HttpContext context, GatewayBffSessionService sessionService) =>
            {
                var error = context.Request.Query["error"].ToString();
                if (!string.IsNullOrWhiteSpace(error))
                {
                    var description = Uri.EscapeDataString(
                        context.Request.Query["error_description"].ToString()
                    );
                    return Results.Redirect(
                        $"/sso-login-status?resultCode=ERROR&message={description}"
                    );
                }

                var state = context.Request.Query["state"].ToString();
                var code = context.Request.Query["code"].ToString();
                if (string.IsNullOrWhiteSpace(state) || string.IsNullOrWhiteSpace(code))
                {
                    return Results.Redirect(
                        "/sso-login-status?resultCode=ERROR&message=MISSING_OIDC_CALLBACK_DATA"
                    );
                }

                var returnUrl = sessionService.GetPendingReturnUrl(context.Session);
                var redirectUri =
                    $"{context.Request.Scheme}://{context.Request.Host}/sso-login-success";
                var authResponse = await sessionService.CompleteSsoLoginAsync(
                    state,
                    code,
                    redirectUri,
                    context.Session,
                    context.RequestAborted
                );

                if (authResponse == null)
                {
                    return Results.Redirect(
                        "/sso-login-status?resultCode=INVALID_TOKEN&message=OIDC_LOGIN_FAILED"
                    );
                }

                if (
                    string.IsNullOrWhiteSpace(authResponse.JwtToken)
                    || !string.Equals(
                        authResponse.ResultCode,
                        "OK",
                        StringComparison.OrdinalIgnoreCase
                    )
                )
                {
                    var message = Uri.EscapeDataString(authResponse.AdditionalMessage);
                    var resultCode = Uri.EscapeDataString(
                        string.IsNullOrWhiteSpace(authResponse.ResultCode)
                            ? "ERROR"
                            : authResponse.ResultCode
                    );
                    return Results.Redirect(
                        $"/sso-login-status?resultCode={resultCode}&message={message}"
                    );
                }

                return Results.Redirect(returnUrl);
            }
        );

        endpoints.MapPost(
            "/designer-api/api/Auth/LoginPublicViewer",
            async (HttpContext context, GatewayBffSessionService sessionService) =>
            {
                var payload = await JsonSerializer.DeserializeAsync<JsonElement>(
                    context.Request.Body,
                    cancellationToken: context.RequestAborted
                );
                var authResponse = await sessionService.LoginPublicViewerAsync(
                    payload,
                    context.RequestAborted
                );
                if (authResponse == null)
                {
                    return Results.Unauthorized();
                }

                if (!string.IsNullOrWhiteSpace(authResponse.JwtToken))
                {
                    await sessionService.SaveAuthenticatedSessionAsync(
                        context.Session,
                        authResponse,
                        context.RequestAborted
                    );
                }

                return Results.Json(authResponse.Sanitize());
            }
        );

        endpoints.MapPost(
            "/designer-api/api/Auth/authenticate",
            async (HttpContext context, GatewayBffSessionService sessionService) =>
            {
                var payload = await JsonSerializer.DeserializeAsync<JsonElement>(
                    context.Request.Body,
                    cancellationToken: context.RequestAborted
                );
                var authResponse = await sessionService.LoginAsync(payload, context.RequestAborted);
                if (authResponse == null)
                {
                    return Results.Unauthorized();
                }

                if (!string.IsNullOrWhiteSpace(authResponse.JwtToken))
                {
                    await sessionService.SaveAuthenticatedSessionAsync(
                        context.Session,
                        authResponse,
                        context.RequestAborted
                    );
                }

                return Results.Json(authResponse.Sanitize());
            }
        );

        return endpoints;
    }
}
