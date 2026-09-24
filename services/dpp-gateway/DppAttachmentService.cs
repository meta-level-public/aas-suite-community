using System.Net;
using System.Text;
using System.Text.Json.Nodes;
using Microsoft.Extensions.Options;
using Microsoft.Net.Http.Headers;

namespace DppGateway;

public sealed class DppAttachmentService
{
    private const string AttachmentMarker = "/submodels/";
    private readonly HttpClient _httpClient;
    private readonly long _maximumResponseBytes;
    private readonly ILogger<DppAttachmentService> _logger;

    public DppAttachmentService(
        HttpClient httpClient,
        IOptions<DppGatewayOptions> options,
        ILogger<DppAttachmentService> logger
    )
    {
        _httpClient = httpClient;
        _maximumResponseBytes = options.Value.MaximumResponseBytes;
        _logger = logger;
    }

    public byte[] RewriteUrls(byte[] payload, string dppId, HttpRequest request)
    {
        var root = JsonNode.Parse(payload);
        if (root == null)
            return payload;

        RewriteNode(root, dppId, request);
        return Encoding.UTF8.GetBytes(root.ToJsonString());
    }

    public async Task<IResult> GetAsync(
        DppRoute route,
        byte[] authorizedDpp,
        string attachmentToken,
        CancellationToken cancellationToken
    )
    {
        var relativePath = DecodeToken(attachmentToken);
        if (relativePath == null || !IsAllowedAttachmentPath(relativePath))
            return Results.BadRequest(new { error = "INVALID_ATTACHMENT" });
        if (!ContainsAttachment(JsonNode.Parse(authorizedDpp), relativePath))
            return Results.NotFound(new { error = "ATTACHMENT_NOT_VISIBLE" });

        try
        {
            var target = new Uri(route.AttachmentBaseUri, relativePath);
            using var response = await _httpClient.GetAsync(
                target,
                HttpCompletionOption.ResponseHeadersRead,
                cancellationToken
            );
            if (response.StatusCode == HttpStatusCode.NotFound)
                return Results.NotFound();
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning(
                    "Attachment upstream returned {StatusCode}",
                    (int)response.StatusCode
                );
                return Results.Problem(
                    statusCode: StatusCodes.Status502BadGateway,
                    title: "Attachment upstream request failed"
                );
            }
            if (response.Content.Headers.ContentLength > _maximumResponseBytes)
                return Results.Problem(
                    statusCode: StatusCodes.Status502BadGateway,
                    title: "Attachment exceeded the configured size limit"
                );

            await response.Content.LoadIntoBufferAsync(_maximumResponseBytes, cancellationToken);
            var content = await response.Content.ReadAsByteArrayAsync(cancellationToken);
            return new DppAttachmentResult(
                content,
                response.Content.Headers.ContentType?.ToString() ?? "application/octet-stream",
                response.Headers.ETag?.ToString(),
                response.Content.Headers.LastModified
            );
        }
        catch (Exception exception)
            when (exception
                    is HttpRequestException
                        or TaskCanceledException
                        or InvalidOperationException
            )
        {
            _logger.LogWarning(exception, "Attachment upstream request failed");
            return Results.Problem(
                statusCode: StatusCodes.Status502BadGateway,
                title: "Attachment upstream is unavailable"
            );
        }
    }

    private static void RewriteNode(JsonNode node, string dppId, HttpRequest request)
    {
        if (node is JsonObject obj)
        {
            if (obj["url"] is JsonValue value && value.TryGetValue<string>(out var url))
            {
                var relativePath = ExtractAttachmentPath(url);
                if (relativePath != null)
                {
                    var dppToken = EncodeToken(dppId);
                    var attachmentToken = EncodeToken(relativePath);
                    obj["url"] =
                        $"{request.Scheme}://{request.Host}{request.PathBase}/dpp/v1/attachments/{dppToken}/{attachmentToken}";
                }
            }
            foreach (var child in obj.ToList())
                if (child.Value != null)
                    RewriteNode(child.Value, dppId, request);
        }
        else if (node is JsonArray array)
        {
            foreach (var child in array)
                if (child != null)
                    RewriteNode(child, dppId, request);
        }
    }

    private static bool ContainsAttachment(JsonNode? node, string relativePath)
    {
        if (node is JsonObject obj)
        {
            if (
                obj["url"] is JsonValue value
                && value.TryGetValue<string>(out var url)
                && string.Equals(ExtractAttachmentPath(url), relativePath, StringComparison.Ordinal)
            )
                return true;
            return obj.Any(child => ContainsAttachment(child.Value, relativePath));
        }
        return node is JsonArray array
            && array.Any(child => ContainsAttachment(child, relativePath));
    }

    private static string? ExtractAttachmentPath(string? url)
    {
        if (!Uri.TryCreate(url, UriKind.Absolute, out var uri))
            return null;
        var markerIndex = uri.AbsolutePath.IndexOf(AttachmentMarker, StringComparison.Ordinal);
        if (markerIndex < 0 || !uri.AbsolutePath.EndsWith("/attachment", StringComparison.Ordinal))
            return null;
        var relativePath = uri.AbsolutePath[(markerIndex + 1)..];
        return IsAllowedAttachmentPath(relativePath) ? relativePath : null;
    }

    private static bool IsAllowedAttachmentPath(string path) =>
        path.StartsWith("submodels/", StringComparison.Ordinal)
        && path.Contains("/submodel-elements/", StringComparison.Ordinal)
        && path.EndsWith("/attachment", StringComparison.Ordinal)
        && !path.Contains("..", StringComparison.Ordinal)
        && !path.Contains('\\')
        && !path.Contains('?')
        && !path.Contains('#');

    private static string EncodeToken(string value) =>
        Convert
            .ToBase64String(Encoding.UTF8.GetBytes(value))
            .TrimEnd('=')
            .Replace('+', '-')
            .Replace('/', '_');

    public static string? DecodeToken(string token)
    {
        try
        {
            var value = token.Replace('-', '+').Replace('_', '/');
            value = value.PadRight(value.Length + ((4 - value.Length % 4) % 4), '=');
            return Encoding.UTF8.GetString(Convert.FromBase64String(value));
        }
        catch (FormatException)
        {
            return null;
        }
    }
}

internal sealed class DppAttachmentResult(
    byte[] payload,
    string contentType,
    string? etag,
    DateTimeOffset? lastModified
) : IResult
{
    public async Task ExecuteAsync(HttpContext context)
    {
        context.Response.StatusCode = StatusCodes.Status200OK;
        context.Response.ContentType = contentType;
        context.Response.ContentLength = payload.Length;
        context.Response.Headers[HeaderNames.XContentTypeOptions] = "nosniff";
        context.Response.Headers.CacheControl = "private, no-store";
        context.Response.Headers.Vary = HeaderNames.Authorization;
        if (!string.IsNullOrWhiteSpace(etag))
            context.Response.Headers.ETag = etag;
        if (lastModified.HasValue)
            context.Response.GetTypedHeaders().LastModified = lastModified;
        await context.Response.Body.WriteAsync(payload, context.RequestAborted);
    }
}
