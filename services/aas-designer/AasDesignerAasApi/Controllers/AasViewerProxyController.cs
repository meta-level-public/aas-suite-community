using System.Text.Json;
using System.Web;
using AasDesignerApi.Model;
using AasDesignerAuthorization;
using AasDesignerCommon.Utils;
using AasDesignerModel;
using AasShared.Controllers;
using AasShared.Exceptions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Logging;

namespace AasDesignerAasApi.Controllers;

[ApiController]
[Route("aas-viewer-proxy")]
[ApiExplorerSettings(GroupName = "aas-viewer-proxy")]
public class AasViewerProxyController : InternalApiBaseController
{
    private readonly IApplicationDbContext _context;
    private readonly ApiKeyUserResolver _apiKeyUserResolver;
    private readonly ILogger<AasViewerProxyController> _logger;

    public AasViewerProxyController(
        IApplicationDbContext context,
        ApiKeyUserResolver apiKeyUserResolver,
        ILogger<AasViewerProxyController> logger
    )
    {
        _context = context;
        _apiKeyUserResolver = apiKeyUserResolver;
        _logger = logger;
    }

    [HttpGet]
    [Route("call")]
    [AasDesignerAuthorize(
        RequiredScopes = [ApiScopes.AASX_READ_API, ApiScopes.AASX_WRITE_API],
        RequiredRoles = [
            AuthRoles.VIEWER_NUTZER,
            AuthRoles.BENUTZER,
            AuthRoles.ORGA_ADMIN,
            AuthRoles.SYSTEM_ADMIN,
        ]
    )]
    public Task ProxyCatchAllAasRepository(string target)
    {
        return ProxyRoute(target);
    }

    private async Task ProxyRoute(string target)
    {
        var targetUrl = HttpUtility.UrlDecode(target);
        var appUser = ResolveAppUser();
        if (appUser == null)
        {
            throw new UserNotFoundException();
        }

        var additionalParams = HttpContext
            .Request.Query.Where(q =>
                !string.Equals(q.Key, "target", StringComparison.OrdinalIgnoreCase)
            )
            .SelectMany(
                q => q.Value,
                (q, value) => new KeyValuePair<string, string?>(q.Key, value)
            );

        var normalizedTargetUrl = NormalizeTargetUrl(targetUrl, appUser);
        var url = additionalParams.Any()
            ? QueryHelpers.AddQueryString(normalizedTargetUrl, additionalParams)
            : normalizedTargetUrl;
        if (TryExtractProxyPath(url, out _))
        {
            await WriteProxyLoopDetectedAsync(appUser.CurrentInfrastructureSettings.Id, url);
            return;
        }

        using var client = HttpClientCreator.CreateHttpClient(appUser);
        using var request = new HttpRequestMessage(HttpMethod.Get, url);
        var infrastructureId = appUser.CurrentInfrastructureSettings.Id;

        _logger.LogInformation(
            "AAS viewer proxy request {Method} infrastructureId={InfrastructureId} target={Target}",
            HttpContext.Request.Method,
            infrastructureId,
            url
        );

        foreach (var header in HttpContext.Request.Headers)
        {
            if (header.Key.Equals("Accept", StringComparison.OrdinalIgnoreCase))
            {
                request.Headers.TryAddWithoutValidation(header.Key, header.Value.ToArray());
            }
        }

        using var response = await client.SendAsync(
            request,
            HttpCompletionOption.ResponseHeadersRead,
            HttpContext.RequestAborted
        );

        _logger.LogInformation(
            "AAS viewer proxy response {Method} infrastructureId={InfrastructureId} statusCode={StatusCode} target={Target}",
            HttpContext.Request.Method,
            infrastructureId,
            (int)response.StatusCode,
            url
        );

        HttpContext.Response.StatusCode = (int)response.StatusCode;
        HttpContext.Response.Headers["X-Vws-Proxy-Upstream"] = "1";

        foreach (var header in response.Headers)
        {
            HttpContext.Response.Headers[header.Key] = header.Value.ToArray();
        }

        foreach (var header in response.Content.Headers)
        {
            HttpContext.Response.Headers[header.Key] = header.Value.ToArray();
        }

        HttpContext.Response.Headers.Remove("transfer-encoding");

        await response.Content.CopyToAsync(HttpContext.Response.Body, HttpContext.RequestAborted);
    }

    private AppUser? ResolveAppUser()
    {
        if (HttpContext.Items[AasDesignerConstants.API_KEY] is Apikey apikey)
        {
            var infrastructureId = GetInfrastructureIdFromTarget();
            if (apikey.BenutzerId == null)
            {
                return _apiKeyUserResolver.GetAppUserByApikey(apikey, infrastructureId);
            }

            return _apiKeyUserResolver.GetSystemAppUserByApikey(apikey);
        }

        return HttpContext.Items[AasDesignerConstants.APP_USER] as AppUser;
    }

    private long GetInfrastructureIdFromTarget()
    {
        var target = HttpUtility.UrlDecode(HttpContext.Request.Query["target"].ToString());
        if (string.IsNullOrWhiteSpace(target))
        {
            return 0;
        }

        if (!TryExtractProxyPath(target, out var proxyPath))
        {
            return 0;
        }

        var segments = proxyPath.Split('/', StringSplitOptions.RemoveEmptyEntries);
        if (segments.Length >= 2 && long.TryParse(segments[1], out var infrastructureId))
        {
            return infrastructureId;
        }

        return 0;
    }

    private string NormalizeTargetUrl(string targetUrl, AppUser appUser)
    {
        if (!TryExtractProxyPath(targetUrl, out var proxyPath))
        {
            return targetUrl;
        }

        var segments = proxyPath.Split('/', StringSplitOptions.RemoveEmptyEntries);
        if (
            segments.Length < 3
            || !string.Equals(segments[0], "aas-proxy", StringComparison.OrdinalIgnoreCase)
        )
        {
            return targetUrl;
        }

        var startIndex = long.TryParse(segments[1], out _) ? 3 : 2;
        if (segments.Length <= startIndex)
        {
            return targetUrl;
        }

        var proxyType = segments[startIndex - 1];
        var rest = string.Join('/', segments.Skip(startIndex));
        var baseUrl = appUser.CurrentInfrastructureSettings.GetResolvedServiceUrl(proxyType);

        if (string.IsNullOrWhiteSpace(baseUrl))
        {
            return targetUrl;
        }

        return string.IsNullOrWhiteSpace(rest) ? baseUrl : $"{baseUrl.AppendSlash()}{rest}";
    }

    private async Task WriteProxyLoopDetectedAsync(long infrastructureId, string url)
    {
        _logger.LogError(
            "AAS viewer proxy loop detected for infrastructureId={InfrastructureId}, target={Target}",
            infrastructureId,
            url
        );

        if (Response.HasStarted)
        {
            return;
        }

        Response.StatusCode = StatusCodes.Status508LoopDetected;
        Response.ContentType = "application/problem+json";

        var response = new
        {
            title = "AAS viewer proxy loop detected",
            status = StatusCodes.Status508LoopDetected,
            detail = "The resolved upstream points back to the public proxy endpoint.",
            infrastructureId,
            upstream = url,
        };

        await Response.WriteAsync(JsonSerializer.Serialize(response));
    }

    private static bool TryExtractProxyPath(string targetUrl, out string proxyPath)
    {
        proxyPath = string.Empty;
        if (string.IsNullOrWhiteSpace(targetUrl))
        {
            return false;
        }

        if (targetUrl.StartsWith("/aas-proxy/", StringComparison.OrdinalIgnoreCase))
        {
            proxyPath = targetUrl;
            return true;
        }

        if (!Uri.TryCreate(targetUrl, UriKind.Absolute, out var targetUri))
        {
            return false;
        }

        if (!targetUri.AbsolutePath.StartsWith("/aas-proxy/", StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        proxyPath = targetUri.AbsolutePath;
        return true;
    }
}
