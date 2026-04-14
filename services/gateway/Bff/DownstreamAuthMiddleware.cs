namespace gateway.Bff;

public sealed class DownstreamAuthMiddleware
{
    private static readonly string[] AnonymousDesignerPaths =
    [
        "/designer-api/api/Auth/authenticate",
        "/designer-api/api/Auth/refresh-token",
        "/designer-api/api/Auth/revoke-token",
        "/designer-api/api/Auth/check-user",
        "/designer-api/api/Auth/LoginPublicViewer",
        "/designer-api/api/News/GetAllPublic",
        "/designer-api/system-management-api/SystemManagement/GetConfiguration",
        "/designer-api/system-management-api/SystemManagement/GetHelpInfo",
    ];

    private readonly RequestDelegate _next;
    private readonly ILogger<DownstreamAuthMiddleware> _logger;

    public DownstreamAuthMiddleware(RequestDelegate next, ILogger<DownstreamAuthMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task Invoke(HttpContext context, GatewayBffSessionService sessionService)
    {
        if (IsAasProxyWriteRequest(context.Request))
        {
            _logger.LogInformation(
                "Processing proxy write request {Method} {Path}. HasIncomingAuthorization={HasIncomingAuthorization}, HasOrganisationId={HasOrganisationId}, HasInfrastructureId={HasInfrastructureId}",
                context.Request.Method,
                context.Request.Path.Value,
                context.Request.Headers.ContainsKey("Authorization"),
                context.Request.Headers.ContainsKey("X-Organisation-ID"),
                context.Request.Headers.ContainsKey("X-Infrastructure-ID")
            );
        }

        if (ShouldAttachDownstreamToken(context.Request.Path))
        {
            var sessionState = await sessionService.EnsureFreshSessionAsync(
                context.Session,
                forceRefresh: false,
                context.RequestAborted
            );

            if (!string.IsNullOrWhiteSpace(sessionState?.AuthResponse.JwtToken))
            {
                context.Request.Headers.Authorization =
                    $"Bearer {sessionState.AuthResponse.JwtToken}";

                if (IsAasProxyWriteRequest(context.Request))
                {
                    _logger.LogInformation(
                        "Attached downstream JWT for proxy write request {Method} {Path}.",
                        context.Request.Method,
                        context.Request.Path.Value
                    );
                }
            }
            else if (IsAasProxyWriteRequest(context.Request))
            {
                _logger.LogWarning(
                    "No downstream JWT available for proxy write request {Method} {Path}. Session present: {HasSessionState}",
                    context.Request.Method,
                    context.Request.Path.Value,
                    sessionState != null
                );
            }
        }

        await _next(context);
    }

    internal static bool ShouldAttachDownstreamToken(PathString path)
    {
        if (!path.HasValue)
        {
            return false;
        }

        if (path.StartsWithSegments("/designer-api", StringComparison.OrdinalIgnoreCase))
        {
            return !IsAnonymousDesignerPath(path);
        }

        return path.StartsWithSegments("/feed-mapping", StringComparison.OrdinalIgnoreCase)
            || path.StartsWithSegments("/aas-proxy", StringComparison.OrdinalIgnoreCase)
            || path.StartsWithSegments("/aas-viewer-proxy", StringComparison.OrdinalIgnoreCase);
    }

    internal static bool IsAnonymousDesignerPath(PathString path)
    {
        if (!path.HasValue)
        {
            return false;
        }

        return AnonymousDesignerPaths.Any(anonymousPath =>
            path.Equals(anonymousPath, StringComparison.OrdinalIgnoreCase)
        );
    }

    private static bool IsAasProxyRequest(PathString path)
    {
        return path.StartsWithSegments(
                "/designer-api/aas-proxy",
                StringComparison.OrdinalIgnoreCase
            ) || path.StartsWithSegments("/aas-proxy", StringComparison.OrdinalIgnoreCase);
    }

    private static bool IsAasProxyWriteRequest(HttpRequest request)
    {
        var isProxyRequest = IsAasProxyRequest(request.Path);

        return isProxyRequest
            && (
                HttpMethods.IsPatch(request.Method)
                || HttpMethods.IsPost(request.Method)
                || HttpMethods.IsPut(request.Method)
                || HttpMethods.IsDelete(request.Method)
            );
    }
}
