using System.Collections.Concurrent;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using AasShared.Configuration;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Primitives;

namespace gateway.Bff;

public sealed class GatewayBffSessionService
{
    private const string SessionStateKey = "gateway:bff:session";
    private const string PendingStateKey = "gateway:bff:pending-oidc";
    private static readonly TimeSpan RefreshWindow = TimeSpan.FromMinutes(3);
    private static readonly TimeSpan RefreshReuseWindow = TimeSpan.FromSeconds(30);
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    private readonly ConcurrentDictionary<string, SessionRefreshContext> _sessionRefreshContexts =
        new(StringComparer.Ordinal);
    private readonly HttpClient _httpClient;
    private readonly AppSettings _appSettings;
    private readonly string _designerBaseUrl;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ILogger<GatewayBffSessionService> _logger;
    private readonly string _frontendBasePath;

    public GatewayBffSessionService(
        HttpClient httpClient,
        IOptions<GatewayBackendOptions> options,
        AppSettings appSettings,
        IHttpContextAccessor httpContextAccessor,
        ILogger<GatewayBffSessionService> logger
    )
    {
        _httpClient = httpClient;
        _appSettings = appSettings;
        _designerBaseUrl = options.Value.DesignerBaseUrl.TrimEnd('/');
        _frontendBasePath = options.Value.FrontendBasePath;
        _httpContextAccessor = httpContextAccessor;
        _logger = logger;
    }

    public Task<GatewaySessionState?> GetSessionAsync(
        ISession session,
        CancellationToken cancellationToken
    )
    {
        _ = cancellationToken;
        return Task.FromResult(Deserialize<GatewaySessionState>(session, SessionStateKey));
    }

    public async Task<GatewayAuthResponse?> GetSanitizedSessionAsync(
        ISession session,
        CancellationToken cancellationToken
    )
    {
        var state = await GetSessionAsync(session, cancellationToken);
        return state?.AuthResponse.Sanitize();
    }

    public async Task<GatewayAuthResponse?> RefreshSessionAsync(
        ISession session,
        CancellationToken cancellationToken
    )
    {
        var state = await EnsureFreshSessionAsync(session, forceRefresh: true, cancellationToken);
        return state?.AuthResponse.Sanitize();
    }

    public async Task<GatewaySessionState?> EnsureFreshSessionAsync(
        ISession session,
        bool forceRefresh,
        CancellationToken cancellationToken
    )
    {
        var (requestPath, traceIdentifier) = GetCurrentRequestContext();
        var state = await GetSessionAsync(session, cancellationToken);
        var sessionId = session.Id;
        var refreshContext = _sessionRefreshContexts.GetOrAdd(
            sessionId,
            _ => new SessionRefreshContext()
        );
        if (state == null)
        {
            _logger.LogInformation(
                "BFF session refresh skipped: no session state found for session id {SessionId}, trace id {TraceIdentifier}, request path {RequestPath}.",
                session.Id,
                traceIdentifier,
                requestPath
            );
            return null;
        }

        if (!forceRefresh && !ShouldRefresh(state.AuthResponse.JwtToken))
        {
            return state;
        }

        await refreshContext.SyncRoot.WaitAsync(cancellationToken);
        try
        {
            // Re-read after acquiring lock because another request may already have refreshed.
            state = await GetSessionAsync(session, cancellationToken);
            if (state == null)
            {
                _logger.LogInformation(
                    "BFF session refresh aborted: session state disappeared while waiting for lock. Session id {SessionId}, trace id {TraceIdentifier}, request path {RequestPath}.",
                    session.Id,
                    traceIdentifier,
                    requestPath
                );
                return null;
            }

            if (TryReuseFreshSessionState(refreshContext, state, forceRefresh, out var reusedState))
            {
                _logger.LogInformation(
                    "BFF session refresh reused a recently refreshed session state for session id {SessionId}, trace id {TraceIdentifier}, request path {RequestPath}.",
                    sessionId,
                    traceIdentifier,
                    requestPath
                );
                Save(session, SessionStateKey, reusedState);
                return reusedState;
            }

            if (!forceRefresh && !ShouldRefresh(state.AuthResponse.JwtToken))
            {
                return state;
            }

            if (string.IsNullOrWhiteSpace(state.AuthResponse.RefreshToken))
            {
                _logger.LogWarning(
                    "BFF session refresh failed: missing refresh token for session id {SessionId}, trace id {TraceIdentifier}, request path {RequestPath}. Clearing session.",
                    session.Id,
                    traceIdentifier,
                    requestPath
                );
                session.Remove(SessionStateKey);
                refreshContext.ClearLastSuccessfulState();
                return null;
            }

            _logger.LogInformation(
                "BFF session refresh started for session id {SessionId}, trace id {TraceIdentifier}, request path {RequestPath}.",
                sessionId,
                traceIdentifier,
                requestPath
            );

            var refreshed = await RefreshWithBackendAsync(
                state.AuthResponse.RefreshToken,
                cancellationToken
            );
            if (refreshed?.JwtToken is not { Length: > 0 })
            {
                _logger.LogWarning(
                    "BFF session refresh failed: backend did not return a valid JWT for session id {SessionId}, trace id {TraceIdentifier}, request path {RequestPath}. Clearing session.",
                    session.Id,
                    traceIdentifier,
                    requestPath
                );
                session.Remove(SessionStateKey);
                refreshContext.ClearLastSuccessfulState();
                return null;
            }

            var refreshedState = new GatewaySessionState
            {
                AuthResponse = refreshed,
                OidcSession = state.OidcSession?.Clone(),
            };
            Save(session, SessionStateKey, refreshedState);
            refreshContext.SetLastSuccessfulState(refreshedState);
            return refreshedState.Clone();
        }
        finally
        {
            refreshContext.SyncRoot.Release();
        }
    }

    public Task SaveAuthenticatedSessionAsync(
        ISession session,
        GatewayAuthResponse authResponse,
        CancellationToken cancellationToken
    )
    {
        _ = cancellationToken;
        var state = new GatewaySessionState { AuthResponse = authResponse };
        Save(session, SessionStateKey, state);
        _sessionRefreshContexts
            .GetOrAdd(session.Id, _ => new SessionRefreshContext())
            .SetLastSuccessfulState(state);
        return Task.CompletedTask;
    }

    public async Task<GatewayLogoutResponse> RevokeAndClearSessionAsync(
        ISession session,
        string postLogoutRedirectUri,
        CancellationToken cancellationToken
    )
    {
        var state = await GetSessionAsync(session, cancellationToken);
        session.Remove(SessionStateKey);
        session.Remove(PendingStateKey);
        _sessionRefreshContexts
            .GetOrAdd(session.Id, _ => new SessionRefreshContext())
            .ClearLastSuccessfulState();

        if (string.IsNullOrWhiteSpace(state?.AuthResponse.RefreshToken))
        {
            return new GatewayLogoutResponse
            {
                LogoutUrl =
                    await BuildOidcLogoutUrlAsync(state, postLogoutRedirectUri, cancellationToken)
                    ?? string.Empty,
            };
        }

        using var request = new HttpRequestMessage(
            HttpMethod.Post,
            BuildDesignerUrl("/api/Auth/revoke-token")
        )
        {
            Content = JsonContent.Create(new { token = state.AuthResponse.RefreshToken }),
        };
        ApplyForwardedHeaders(request);
        await _httpClient.SendAsync(request, cancellationToken);

        return new GatewayLogoutResponse
        {
            LogoutUrl =
                await BuildOidcLogoutUrlAsync(state, postLogoutRedirectUri, cancellationToken)
                ?? string.Empty,
        };
    }

    public async Task<string> BuildSsoAuthorizationUrlAsync(
        string ssoSource,
        string redirectUri,
        string returnUrl,
        ISession session,
        CancellationToken cancellationToken
    )
    {
        var config =
            await GetSsoConfigurationAsync(ssoSource, cancellationToken)
            ?? throw new InvalidOperationException($"SSO config '{ssoSource}' not found.");
        var discovery = await GetDiscoveryAsync(config, cancellationToken);

        var state = CreateRandomUrlValue();
        var codeVerifier = CreateRandomUrlValue();
        var challenge = CreateCodeChallenge(codeVerifier);

        Save(
            session,
            PendingStateKey,
            new PendingOidcState
            {
                State = state,
                CodeVerifier = codeVerifier,
                SsoSource = ssoSource,
                ReturnUrl = NormalizeReturnUrl(returnUrl),
            }
        );

        var scopes = NormalizeScopes(config.Scopes);
        var query = new Dictionary<string, string?>
        {
            ["client_id"] = config.ClientId,
            ["redirect_uri"] = redirectUri,
            ["response_type"] = "code",
            ["scope"] = scopes,
            ["state"] = state,
            ["code_challenge"] = challenge,
            ["code_challenge_method"] = "S256",
        };

        return QueryHelpers.AddQueryString(ResolveAuthorizationEndpoint(config, discovery), query);
    }

    public async Task<GatewayAuthResponse?> CompleteSsoLoginAsync(
        string state,
        string code,
        string redirectUri,
        ISession session,
        CancellationToken cancellationToken
    )
    {
        var pending = Deserialize<PendingOidcState>(session, PendingStateKey);
        session.Remove(PendingStateKey);

        if (
            pending == null
            || !CryptographicOperations.FixedTimeEquals(
                Encoding.UTF8.GetBytes(state),
                Encoding.UTF8.GetBytes(pending.State)
            )
        )
        {
            return null;
        }

        var config = await GetSsoConfigurationAsync(pending.SsoSource, cancellationToken);
        if (config == null)
        {
            return null;
        }

        var discovery = await GetDiscoveryAsync(config, cancellationToken);
        using var tokenRequest = new HttpRequestMessage(HttpMethod.Post, discovery.TokenEndpoint)
        {
            Content = new FormUrlEncodedContent(
                new Dictionary<string, string>
                {
                    ["grant_type"] = "authorization_code",
                    ["client_id"] = config.ClientId,
                    ["code"] = code,
                    ["redirect_uri"] = redirectUri,
                    ["code_verifier"] = pending.CodeVerifier,
                }
            ),
        };

        if (!string.IsNullOrWhiteSpace(config.ClientSecret))
        {
            tokenRequest.Content = new FormUrlEncodedContent(
                new Dictionary<string, string>
                {
                    ["grant_type"] = "authorization_code",
                    ["client_id"] = config.ClientId,
                    ["client_secret"] = config.ClientSecret,
                    ["code"] = code,
                    ["redirect_uri"] = redirectUri,
                    ["code_verifier"] = pending.CodeVerifier,
                }
            );
        }

        var tokenResponse = await _httpClient.SendAsync(tokenRequest, cancellationToken);
        if (!tokenResponse.IsSuccessStatusCode)
        {
            return null;
        }

        var oidcTokens = await tokenResponse.Content.ReadFromJsonAsync<OidcTokenResponse>(
            JsonOptions,
            cancellationToken
        );
        if (string.IsNullOrWhiteSpace(oidcTokens?.AccessToken))
        {
            return null;
        }

        var authResponse = await AuthenticateByExternalTokenAsync(
            oidcTokens.AccessToken,
            cancellationToken
        );
        if (authResponse?.JwtToken is not { Length: > 0 })
        {
            return authResponse;
        }

        Save(
            session,
            SessionStateKey,
            new GatewaySessionState
            {
                AuthResponse = authResponse,
                OidcSession = new GatewayOidcSessionState
                {
                    SsoSource = pending.SsoSource,
                    IdToken = oidcTokens.IdToken,
                },
            }
        );
        return authResponse;
    }

    public string GetPendingReturnUrl(ISession session)
    {
        var pending = Deserialize<PendingOidcState>(session, PendingStateKey);
        return NormalizeReturnUrl(pending?.ReturnUrl);
    }

    public async Task<GatewayAuthResponse?> AuthenticateByExternalTokenAsync(
        string accessToken,
        CancellationToken cancellationToken
    )
    {
        using var request = new HttpRequestMessage(
            HttpMethod.Post,
            BuildDesignerUrl("/bff-internal/auth/external-session")
        )
        {
            Content = JsonContent.Create(new { accessToken }),
        };
        ApplyForwardedHeaders(request);
        return await SendForAuthResponseAsync(request, cancellationToken);
    }

    public async Task<GatewayAuthResponse?> LoginPublicViewerAsync(
        object payload,
        CancellationToken cancellationToken
    )
    {
        using var request = new HttpRequestMessage(
            HttpMethod.Post,
            BuildDesignerUrl("/api/Auth/LoginPublicViewer")
        )
        {
            Content = JsonContent.Create(payload),
        };
        ApplyForwardedHeaders(request);
        return await SendForAuthResponseAsync(request, cancellationToken);
    }

    public async Task<GatewayAuthResponse?> LoginAsync(
        object payload,
        CancellationToken cancellationToken
    )
    {
        using var request = new HttpRequestMessage(
            HttpMethod.Post,
            BuildDesignerUrl("/api/Auth/authenticate")
        )
        {
            Content = JsonContent.Create(payload),
        };
        ApplyForwardedHeaders(request);
        return await SendForAuthResponseAsync(request, cancellationToken);
    }

    public async Task<string?> GetDefaultSsoSourceAsync(CancellationToken cancellationToken)
    {
        using var request = new HttpRequestMessage(
            HttpMethod.Get,
            BuildDesignerUrl("/system-management-api/SystemManagement/GetConfiguration")
        );
        var response = await _httpClient.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            return null;
        }

        var systemConfiguration =
            await response.Content.ReadFromJsonAsync<GatewaySystemConfiguration>(
                JsonOptions,
                cancellationToken
            );
        return string.IsNullOrWhiteSpace(systemConfiguration?.SsoConfigName)
            ? null
            : systemConfiguration.SsoConfigName;
    }

    private async Task<GatewayAuthResponse?> RefreshWithBackendAsync(
        string refreshToken,
        CancellationToken cancellationToken
    )
    {
        using var request = new HttpRequestMessage(
            HttpMethod.Post,
            BuildDesignerUrl("/api/Auth/refresh-token")
        )
        {
            Content = JsonContent.Create(new { refreshToken }),
        };
        ApplyForwardedHeaders(request);
        return await SendForAuthResponseAsync(request, cancellationToken);
    }

    private async Task<GatewaySsoSourceConfiguration?> GetSsoConfigurationAsync(
        string ssoSource,
        CancellationToken cancellationToken
    )
    {
        var localKeycloakConfiguration = TryBuildLocalKeycloakSsoConfiguration(ssoSource);
        if (localKeycloakConfiguration != null)
        {
            return localKeycloakConfiguration;
        }

        using var request = new HttpRequestMessage(
            HttpMethod.Get,
            QueryHelpers.AddQueryString(
                BuildDesignerUrl("/api/Organisation/GetSsoConfig"),
                "ssoSource",
                ssoSource
            )
        );
        var response = await _httpClient.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            return null;
        }

        return await response.Content.ReadFromJsonAsync<GatewaySsoSourceConfiguration>(
            JsonOptions,
            cancellationToken
        );
    }

    private GatewaySsoSourceConfiguration? TryBuildLocalKeycloakSsoConfiguration(string ssoSource)
    {
        if (!_appSettings.KeycloakEnabled)
        {
            return null;
        }

        if (
            string.IsNullOrWhiteSpace(ssoSource)
            || !string.Equals(
                ssoSource.Trim(),
                _appSettings.KeycloakSsoSourceName,
                StringComparison.OrdinalIgnoreCase
            )
        )
        {
            return null;
        }

        if (
            string.IsNullOrWhiteSpace(_appSettings.KeycloakIssuer)
            || string.IsNullOrWhiteSpace(_appSettings.KeycloakClientId)
        )
        {
            _logger.LogWarning(
                "Keycloak is enabled for the gateway, but issuer or client id is missing in AppSettings."
            );
            return null;
        }

        var publicIssuer = string.IsNullOrWhiteSpace(_appSettings.KeycloakPublicIssuer)
            ? _appSettings.KeycloakIssuer
            : _appSettings.KeycloakPublicIssuer;
        var publicWellKnownUrl = string.IsNullOrWhiteSpace(_appSettings.KeycloakPublicWellKnownUrl)
            ? BuildWellKnownUrl(publicIssuer)
            : _appSettings.KeycloakPublicWellKnownUrl;
        var internalWellKnownUrl = string.IsNullOrWhiteSpace(_appSettings.KeycloakWellKnownUrl)
            ? BuildWellKnownUrl(_appSettings.KeycloakIssuer)
            : _appSettings.KeycloakWellKnownUrl;

        return new GatewaySsoSourceConfiguration
        {
            AuthorizationUrl = publicIssuer,
            InternalAuthorizationUrl = _appSettings.KeycloakIssuer,
            ClientId = _appSettings.KeycloakClientId,
            Scopes = NormalizeScopes(_appSettings.KeycloakScopes),
            WellKnownUrl = publicWellKnownUrl,
            InternalWellKnownUrl = internalWellKnownUrl,
        };
    }

    private static string BuildWellKnownUrl(string issuer)
    {
        return $"{issuer.TrimEnd('/')}/.well-known/openid-configuration";
    }

    private async Task<OidcDiscoveryDocument> GetDiscoveryAsync(
        GatewaySsoSourceConfiguration config,
        CancellationToken cancellationToken
    )
    {
        var internalAuthorizationUrl = GetInternalAuthorizationUrl(config);
        var wellKnownUrl =
            !string.IsNullOrWhiteSpace(config.InternalWellKnownUrl) ? config.InternalWellKnownUrl
            : !string.IsNullOrWhiteSpace(config.WellKnownUrl)
            && string.IsNullOrWhiteSpace(internalAuthorizationUrl)
                ? config.WellKnownUrl
            : $"{internalAuthorizationUrl.TrimEnd('/')}/.well-known/openid-configuration";

        using var request = new HttpRequestMessage(HttpMethod.Get, wellKnownUrl);
        var response = await _httpClient.SendAsync(request, cancellationToken);
        response.EnsureSuccessStatusCode();

        return (
                await response.Content.ReadFromJsonAsync<OidcDiscoveryDocument>(
                    JsonOptions,
                    cancellationToken
                )
            ) ?? throw new InvalidOperationException("OIDC discovery document is missing.");
    }

    private string ResolveAuthorizationEndpoint(
        GatewaySsoSourceConfiguration config,
        OidcDiscoveryDocument discovery
    )
    {
        return ResolvePublicOidcEndpoint(config, discovery.AuthorizationEndpoint, "authorization");
    }

    private string ResolvePublicOidcEndpoint(
        GatewaySsoSourceConfiguration config,
        string endpoint,
        string endpointType
    )
    {
        var publicAuthorizationUrl = config.AuthorizationUrl.TrimEnd('/');
        var internalAuthorizationUrl = GetInternalAuthorizationUrl(config);

        if (
            string.IsNullOrWhiteSpace(publicAuthorizationUrl)
            || string.IsNullOrWhiteSpace(internalAuthorizationUrl)
            || string.Equals(
                publicAuthorizationUrl,
                internalAuthorizationUrl,
                StringComparison.OrdinalIgnoreCase
            )
        )
        {
            return endpoint;
        }

        if (endpoint.StartsWith(internalAuthorizationUrl, StringComparison.OrdinalIgnoreCase))
        {
            return publicAuthorizationUrl + endpoint[internalAuthorizationUrl.Length..];
        }

        _logger.LogWarning(
            "OIDC {EndpointType} endpoint '{Endpoint}' does not match internal authorization base '{InternalAuthorizationUrl}'. Public authorization base '{PublicAuthorizationUrl}' cannot be applied.",
            endpointType,
            endpoint,
            internalAuthorizationUrl,
            publicAuthorizationUrl
        );

        return endpoint;
    }

    private static string GetInternalAuthorizationUrl(GatewaySsoSourceConfiguration config)
    {
        if (!string.IsNullOrWhiteSpace(config.InternalAuthorizationUrl))
        {
            return config.InternalAuthorizationUrl;
        }

        return config.AuthorizationUrl;
    }

    private async Task<GatewayAuthResponse?> SendForAuthResponseAsync(
        HttpRequestMessage request,
        CancellationToken cancellationToken
    )
    {
        var response = await _httpClient.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            var endpointPath = request.RequestUri?.AbsolutePath ?? "(unknown)";
            var responseSnippet = await ReadResponseSnippetAsync(response, cancellationToken);
            var (requestPath, traceIdentifier) = GetCurrentRequestContext();
            _logger.LogWarning(
                "BFF auth request to {EndpointPath} failed with status code {StatusCode}, trace id {TraceIdentifier}, request path {RequestPath}. Response snippet: {ResponseSnippet}",
                endpointPath,
                (int)response.StatusCode,
                traceIdentifier,
                requestPath,
                responseSnippet
            );
            return null;
        }

        return await response.Content.ReadFromJsonAsync<GatewayAuthResponse>(
            JsonOptions,
            cancellationToken
        );
    }

    private static async Task<string> ReadResponseSnippetAsync(
        HttpResponseMessage response,
        CancellationToken cancellationToken
    )
    {
        try
        {
            var content = await response.Content.ReadAsStringAsync(cancellationToken);
            if (string.IsNullOrWhiteSpace(content))
            {
                return "(empty)";
            }

            const int maxLength = 256;
            return content.Length <= maxLength ? content : content[..maxLength] + "...";
        }
        catch
        {
            return "(unavailable)";
        }
    }

    private (string RequestPath, string TraceIdentifier) GetCurrentRequestContext()
    {
        var request = _httpContextAccessor.HttpContext?.Request;
        var requestPath = request?.Path.Value ?? "(unknown)";
        var traceIdentifier = _httpContextAccessor.HttpContext?.TraceIdentifier ?? "(unknown)";
        return (requestPath, traceIdentifier);
    }

    private static bool TryReuseFreshSessionState(
        SessionRefreshContext refreshContext,
        GatewaySessionState state,
        bool forceRefresh,
        out GatewaySessionState reusedState
    )
    {
        reusedState = default!;

        var lastSuccessfulState = refreshContext.LastSuccessfulState;
        var lastUpdatedUtc = refreshContext.LastUpdatedUtc;
        if (lastSuccessfulState == null || lastUpdatedUtc == null)
        {
            return false;
        }

        if (DateTimeOffset.UtcNow - lastUpdatedUtc.Value > RefreshReuseWindow)
        {
            return false;
        }

        if (HaveSameRefreshToken(state, lastSuccessfulState))
        {
            return false;
        }

        if (!forceRefresh && ShouldRefresh(lastSuccessfulState.AuthResponse.JwtToken))
        {
            return false;
        }

        reusedState = lastSuccessfulState.Clone();
        return true;
    }

    private static bool HaveSameRefreshToken(GatewaySessionState left, GatewaySessionState right)
    {
        return string.Equals(
            left.AuthResponse.RefreshToken,
            right.AuthResponse.RefreshToken,
            StringComparison.Ordinal
        );
    }

    private async Task<string?> BuildOidcLogoutUrlAsync(
        GatewaySessionState? state,
        string postLogoutRedirectUri,
        CancellationToken cancellationToken
    )
    {
        if (state?.OidcSession == null || string.IsNullOrWhiteSpace(state.OidcSession.SsoSource))
        {
            return null;
        }

        var config = await GetSsoConfigurationAsync(state.OidcSession.SsoSource, cancellationToken);
        if (config == null)
        {
            return null;
        }

        var discovery = await GetDiscoveryAsync(config, cancellationToken);
        if (string.IsNullOrWhiteSpace(discovery.EndSessionEndpoint))
        {
            return null;
        }

        var query = new Dictionary<string, string?>
        {
            ["post_logout_redirect_uri"] = postLogoutRedirectUri,
        };

        if (!string.IsNullOrWhiteSpace(state.OidcSession.IdToken))
        {
            query["id_token_hint"] = state.OidcSession.IdToken;
        }
        else if (!string.IsNullOrWhiteSpace(config.ClientId))
        {
            query["client_id"] = config.ClientId;
        }

        return QueryHelpers.AddQueryString(
            ResolvePublicOidcEndpoint(config, discovery.EndSessionEndpoint, "logout"),
            query
        );
    }

    private static bool ShouldRefresh(string jwtToken)
    {
        var expiresAt = ReadExpirationUtc(jwtToken);
        return expiresAt == null || expiresAt <= DateTimeOffset.UtcNow.Add(RefreshWindow);
    }

    private static DateTimeOffset? ReadExpirationUtc(string jwtToken)
    {
        if (string.IsNullOrWhiteSpace(jwtToken))
        {
            return null;
        }

        var parts = jwtToken.Split('.');
        if (parts.Length < 2)
        {
            return null;
        }

        try
        {
            var payload = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(parts[1]));
            using var document = JsonDocument.Parse(payload);
            if (
                !document.RootElement.TryGetProperty("exp", out var expElement)
                || !expElement.TryGetInt64(out var exp)
            )
            {
                return null;
            }

            return DateTimeOffset.FromUnixTimeSeconds(exp);
        }
        catch
        {
            return null;
        }
    }

    private string BuildDesignerUrl(string relativePath)
    {
        return $"{_designerBaseUrl}{relativePath}";
    }

    private static string NormalizeScopes(string scopes)
    {
        var configuredScopes = scopes
            .Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .ToList();

        if (!configuredScopes.Contains("openid", StringComparer.Ordinal))
        {
            configuredScopes.Insert(0, "openid");
        }

        return string.Join(' ', configuredScopes.Distinct(StringComparer.Ordinal));
    }

    private string NormalizeReturnUrl(string? returnUrl)
    {
        var fallback = string.IsNullOrEmpty(_frontendBasePath)
            ? "/dashboard"
            : $"{_frontendBasePath}/dashboard";

        if (string.IsNullOrWhiteSpace(returnUrl))
        {
            return fallback;
        }

        var trimmed = returnUrl.Trim();
        if (!trimmed.StartsWith('/'))
        {
            return fallback;
        }

        // Reject bare login/callback/error paths (with or without frontend base path prefix)
        var forbiddenSegments = new[]
        {
            "/login",
            "/sso-login-success",
            "/sso-login-status",
            "/bff/auth/sso/callback",
            "/error",
            "/forbidden",
        };
        var pathToCheck =
            !string.IsNullOrEmpty(_frontendBasePath)
            && trimmed.StartsWith(_frontendBasePath, StringComparison.OrdinalIgnoreCase)
                ? trimmed[_frontendBasePath.Length..]
                : trimmed;
        if (
            forbiddenSegments.Any(segment =>
                pathToCheck.Equals(segment, StringComparison.OrdinalIgnoreCase)
                || pathToCheck.StartsWith(segment + '/', StringComparison.OrdinalIgnoreCase)
            )
        )
        {
            return fallback;
        }

        return trimmed;
    }

    private static string CreateRandomUrlValue()
    {
        var bytes = RandomNumberGenerator.GetBytes(32);
        return WebEncoders.Base64UrlEncode(bytes);
    }

    private static string CreateCodeChallenge(string codeVerifier)
    {
        var bytes = SHA256.HashData(Encoding.ASCII.GetBytes(codeVerifier));
        return WebEncoders.Base64UrlEncode(bytes);
    }

    private void ApplyForwardedHeaders(HttpRequestMessage request)
    {
        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext == null)
        {
            return;
        }

        if (
            httpContext.Request.Headers.TryGetValue(
                "X-Forwarded-For",
                out StringValues existingForwardedFor
            ) && !StringValues.IsNullOrEmpty(existingForwardedFor)
        )
        {
            request.Headers.TryAddWithoutValidation(
                "X-Forwarded-For",
                existingForwardedFor.ToString()
            );
            return;
        }

        var remoteIpAddress = httpContext.Connection.RemoteIpAddress?.MapToIPv4().ToString();
        if (!string.IsNullOrWhiteSpace(remoteIpAddress))
        {
            request.Headers.TryAddWithoutValidation("X-Forwarded-For", remoteIpAddress);
        }
    }

    private static T? Deserialize<T>(ISession session, string key)
    {
        if (!session.TryGetValue(key, out var raw))
        {
            return default;
        }

        return JsonSerializer.Deserialize<T>(raw, JsonOptions);
    }

    private static void Save<T>(ISession session, string key, T value)
    {
        session.Set(key, JsonSerializer.SerializeToUtf8Bytes(value, JsonOptions));
    }

    private sealed class SessionRefreshContext
    {
        public SemaphoreSlim SyncRoot { get; } = new(1, 1);
        public GatewaySessionState? LastSuccessfulState { get; private set; }
        public DateTimeOffset? LastUpdatedUtc { get; private set; }

        public void SetLastSuccessfulState(GatewaySessionState state)
        {
            LastSuccessfulState = state.Clone();
            LastUpdatedUtc = DateTimeOffset.UtcNow;
        }

        public void ClearLastSuccessfulState()
        {
            LastSuccessfulState = null;
            LastUpdatedUtc = null;
        }
    }
}
