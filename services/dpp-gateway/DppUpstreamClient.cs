using System.Net;
using System.Net.Http.Headers;
using System.Text.Json;
using Microsoft.Extensions.Options;
using Microsoft.Net.Http.Headers;

namespace DppGateway;

public sealed class DppUpstreamClient
{
    private readonly HttpClient _httpClient;
    private readonly long _maximumResponseBytes;
    private readonly ILogger<DppUpstreamClient> _logger;
    private readonly DppAccessTokenProvider _tokenProvider;

    public DppUpstreamClient(
        HttpClient httpClient,
        IOptions<DppGatewayOptions> options,
        ILogger<DppUpstreamClient> logger,
        DppAccessTokenProvider tokenProvider
    )
    {
        _httpClient = httpClient;
        _maximumResponseBytes = options.Value.MaximumResponseBytes;
        _logger = logger;
        _tokenProvider = tokenProvider;
    }

    public async Task<IResult> GetDppAsync(
        DppRoute route,
        string dppId,
        string? subjectToken,
        CancellationToken cancellationToken
    )
    {
        var representation = await GetDppRepresentationAsync(
            route,
            dppId,
            subjectToken,
            cancellationToken
        );
        return representation.Error
            ?? new DppJsonResult(
                representation.Payload!,
                representation.ContentType!,
                representation.ETag,
                representation.LastModified
            );
    }

    public async Task<DppRepresentation> GetDppRepresentationAsync(
        DppRoute route,
        string dppId,
        string? subjectToken,
        CancellationToken cancellationToken
    )
    {
        var target = new Uri(route.UpstreamBaseUri, $"v1/dpps/{Uri.EscapeDataString(dppId)}");

        try
        {
            using var request = new HttpRequestMessage(HttpMethod.Get, target);
            var accessToken = string.IsNullOrWhiteSpace(subjectToken)
                ? null
                : await _tokenProvider.GetAccessTokenAsync(
                    route.OAuth,
                    subjectToken,
                    cancellationToken
                );
            if (accessToken != null)
                request.Headers.Authorization = new AuthenticationHeaderValue(
                    "Bearer",
                    accessToken
                );
            using var response = await _httpClient.SendAsync(
                request,
                HttpCompletionOption.ResponseHeadersRead,
                cancellationToken
            );
            if (response.StatusCode == HttpStatusCode.Unauthorized)
                return DppRepresentation.Failed(Results.Unauthorized());
            if (response.StatusCode == HttpStatusCode.Forbidden)
                return DppRepresentation.Failed(Results.StatusCode(StatusCodes.Status403Forbidden));
            if (response.StatusCode == HttpStatusCode.NotFound)
                return DppRepresentation.Failed(Results.NotFound(new { error = "DPP_NOT_FOUND" }));
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning(
                    "DPP upstream returned {StatusCode} for a published route",
                    (int)response.StatusCode
                );
                return DppRepresentation.Failed(
                    Results.Problem(
                        statusCode: StatusCodes.Status502BadGateway,
                        title: "DPP upstream request failed"
                    )
                );
            }

            var contentType = response.Content.Headers.ContentType?.MediaType;
            if (!IsJson(contentType))
            {
                _logger.LogWarning(
                    "DPP upstream returned unsupported content type {ContentType}",
                    contentType
                );
                return DppRepresentation.Failed(
                    Results.Problem(
                        statusCode: StatusCodes.Status502BadGateway,
                        title: "DPP upstream returned an unsupported representation"
                    )
                );
            }
            if (response.Content.Headers.ContentLength > _maximumResponseBytes)
                return DppRepresentation.Failed(
                    Results.Problem(
                        statusCode: StatusCodes.Status502BadGateway,
                        title: "DPP upstream response exceeded the configured size limit"
                    )
                );

            await response.Content.LoadIntoBufferAsync(_maximumResponseBytes, cancellationToken);
            var payload = await response.Content.ReadAsByteArrayAsync(cancellationToken);
            if (!IsPublished(payload))
            {
                _logger.LogInformation("DPP was not exposed because its status is not Active");
                return DppRepresentation.Failed(
                    Results.NotFound(new { error = "DPP_NOT_PUBLISHED" })
                );
            }

            return new DppRepresentation(
                payload,
                response.Content.Headers.ContentType?.ToString() ?? "application/json",
                response.Headers.ETag?.ToString(),
                response.Content.Headers.LastModified,
                null
            );
        }
        catch (Exception exception)
            when (exception
                    is HttpRequestException
                        or TaskCanceledException
                        or InvalidOperationException
                        or System.Text.Json.JsonException
            )
        {
            _logger.LogWarning(exception, "DPP upstream request failed");
            return DppRepresentation.Failed(
                Results.Problem(
                    statusCode: StatusCodes.Status502BadGateway,
                    title: "DPP upstream is unavailable"
                )
            );
        }
    }

    public async Task<bool> IsActiveAsync(
        DppRoute route,
        string dppId,
        CancellationToken cancellationToken
    )
    {
        var target = new Uri(route.UpstreamBaseUri, $"v1/dpps/{Uri.EscapeDataString(dppId)}");
        try
        {
            using var request = new HttpRequestMessage(HttpMethod.Get, target);
            using var response = await _httpClient.SendAsync(request, cancellationToken);
            if (
                !response.IsSuccessStatusCode
                || !IsJson(response.Content.Headers.ContentType?.MediaType)
            )
                return false;
            if (response.Content.Headers.ContentLength > _maximumResponseBytes)
                return false;
            await response.Content.LoadIntoBufferAsync(_maximumResponseBytes, cancellationToken);
            return IsPublished(await response.Content.ReadAsByteArrayAsync(cancellationToken));
        }
        catch (Exception exception)
            when (exception
                    is HttpRequestException
                        or TaskCanceledException
                        or InvalidOperationException
                        or JsonException
            )
        {
            _logger.LogWarning(exception, "DPP publication validation failed");
            return false;
        }
    }

    private static bool IsJson(string? contentType) =>
        contentType != null
        && (
            contentType.Equals("application/json", StringComparison.OrdinalIgnoreCase)
            || contentType.EndsWith("+json", StringComparison.OrdinalIgnoreCase)
        );

    private static bool IsPublished(byte[] payload)
    {
        using var document = JsonDocument.Parse(payload);
        if (document.RootElement.ValueKind != JsonValueKind.Object)
            return false;

        foreach (var property in document.RootElement.EnumerateObject())
        {
            if (!property.Name.Equals("dppStatus", StringComparison.OrdinalIgnoreCase))
                continue;

            return property.Value.ValueKind == JsonValueKind.String
                && string.Equals(
                    property.Value.GetString()?.Trim(),
                    "Active",
                    StringComparison.OrdinalIgnoreCase
                );
        }

        return false;
    }
}

public sealed record DppRepresentation(
    byte[]? Payload,
    string? ContentType,
    string? ETag,
    DateTimeOffset? LastModified,
    IResult? Error
)
{
    public static DppRepresentation Failed(IResult error) => new(null, null, null, null, error);
}

internal sealed class DppJsonResult(
    byte[] payload,
    string contentType,
    string? etag,
    DateTimeOffset? lastModified
) : IResult
{
    public async Task ExecuteAsync(HttpContext httpContext)
    {
        httpContext.Response.StatusCode = StatusCodes.Status200OK;
        httpContext.Response.ContentType = contentType;
        httpContext.Response.ContentLength = payload.Length;
        if (!string.IsNullOrWhiteSpace(etag))
            httpContext.Response.Headers.ETag = etag;
        if (lastModified.HasValue)
            httpContext.Response.GetTypedHeaders().LastModified = lastModified;
        httpContext.Response.Headers[HeaderNames.XContentTypeOptions] = "nosniff";
        httpContext.Response.Headers.CacheControl = "private, no-store";
        httpContext.Response.Headers.Vary = HeaderNames.Authorization;
        await httpContext.Response.Body.WriteAsync(payload, httpContext.RequestAborted);
    }
}
