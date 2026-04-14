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
    private static readonly string[] IgnoredPaths = ["/bff/csrf"];

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

    private static bool RequiresValidation(HttpRequest request)
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
}
