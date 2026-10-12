using Microsoft.AspNetCore.Antiforgery;

namespace gateway.Bff;

public sealed class BffAntiforgeryMiddleware(RequestDelegate next)
{
    private static readonly string[] ProtectedPathPrefixes =
    [
        "/bff",
        "/designer-api",
        "/feed-mapping",
    ];
    private static readonly string[] IgnoredPaths =
    [
        "/bff/csrf",
        "/designer-api/api/Auth/LoginPublicViewer",
    ];

    // Header names are matched case-insensitively, so "Api-Key"/"api-key" and "Apikey"/"apikey" are covered.
    private static readonly string[] ApiKeyHeaderNames = ["Api-Key", "Apikey"];

    public async Task InvokeAsync(HttpContext context, IAntiforgery antiforgery)
    {
        if (!RequiresValidation(context.Request))
        {
            await next(context);
            return;
        }

        try
        {
            await antiforgery.ValidateRequestAsync(context);
            await next(context);
        }
        catch (AntiforgeryValidationException)
        {
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            await context.Response.WriteAsJsonAsync(new { message = "CSRF_VALIDATION_FAILED" });
        }
    }

    internal static bool RequiresValidation(HttpRequest request)
    {
        if (
            HttpMethods.IsGet(request.Method)
            || HttpMethods.IsHead(request.Method)
            || HttpMethods.IsOptions(request.Method)
            || HttpMethods.IsTrace(request.Method)
        )
        {
            return false;
        }

        // Pure API requests authenticate via API key header instead of the session cookie.
        // Browsers cannot attach custom headers cross-site without a CORS preflight, so CSRF does not apply.
        if (IsApiKeyRequest(request))
        {
            return false;
        }

        var path = request.Path.Value ?? string.Empty;
        if (
            IgnoredPaths.Any(ignoredPath =>
                string.Equals(path, ignoredPath, StringComparison.Ordinal)
            )
        )
        {
            return false;
        }

        return ProtectedPathPrefixes.Any(prefix =>
            path.StartsWith(prefix, StringComparison.Ordinal)
        );
    }

    internal static bool IsApiKeyRequest(HttpRequest request)
    {
        return ApiKeyHeaderNames.Any(headerName =>
            request.Headers.TryGetValue(headerName, out var values)
            && values.Any(value => !string.IsNullOrWhiteSpace(value))
        );
    }
}
