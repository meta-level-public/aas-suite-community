using System.Net;
using System.Text.Json;
using AasSuitePluginAbstractions;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;

namespace DppExplorerBackendPlugin;

public sealed class DppExplorerBackendPlugin : IAasSuiteBackendPlugin
{
    private const string SuiteDppGatewayHost = "dpp.aas-suite.de";
    private const string SuiteDppGatewayPathPrefix = "/dpp/v1/dpps/";

    public void ConfigureServices(IServiceCollection services)
    {
        services.AddSingleton<DppSourceStore>();
        services
            .AddHttpClient("dpp-explorer", client => client.Timeout = TimeSpan.FromSeconds(15))
            .ConfigurePrimaryHttpMessageHandler(() =>
                new HttpClientHandler { AllowAutoRedirect = false, UseCookies = false }
            );
    }

    public void MapEndpoints(IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/plugin-api/dpp-explorer");
        group.MapGet(
            "/api/config",
            async (
                HttpContext context,
                DppSourceStore store,
                CancellationToken cancellationToken
            ) =>
                !context.Items.ContainsKey("AppUser")
                    ? Results.Unauthorized()
                    : Results.Ok(
                        new
                        {
                            sources = await store.ReadAsync(cancellationToken),
                            canManage = CanManage(context),
                        }
                    )
        );
        group.MapPut(
            "/api/config",
            async (
                HttpContext context,
                DppSource[] sources,
                DppSourceStore store,
                CancellationToken cancellationToken
            ) =>
            {
                if (!context.Items.ContainsKey("AppUser"))
                    return Results.Unauthorized();
                if (!CanManage(context))
                    return Results.StatusCode(StatusCodes.Status403Forbidden);
                var error = DppSourceStore.Validate(sources);
                if (error != null)
                    return Results.BadRequest(new { error });
                await store.WriteAsync(sources, cancellationToken);
                return Results.Ok(new { sources, canManage = true });
            }
        );
        group.MapGet("/api/pass", FetchPassAsync);
    }

    private static async Task<IResult> FetchPassAsync(
        string url,
        HttpContext context,
        DppSourceStore store,
        IHttpClientFactory clients,
        CancellationToken cancellationToken
    )
    {
        if (!context.Items.ContainsKey("AppUser"))
            return Results.Unauthorized();

        if (
            !Uri.TryCreate(url, UriKind.Absolute, out var uri)
            || !string.IsNullOrEmpty(uri.UserInfo)
            || !string.IsNullOrEmpty(uri.Fragment)
            || (
                !IsLocalhost(uri)
                && (
                    uri.Scheme != Uri.UriSchemeHttps
                    || uri.Port != 443
                    || IPAddress.TryParse(uri.Host, out _)
                    || !IsAllowed(uri, await store.ReadAsync(cancellationToken))
                )
            )
        )
        {
            return Results.BadRequest(
                new { error = "Der Host der DPP-URL ist nicht freigegeben." }
            );
        }

        try
        {
            using var request = new HttpRequestMessage(HttpMethod.Get, uri);
            request.Headers.Accept.ParseAdd("application/json");
            using var response = await clients
                .CreateClient("dpp-explorer")
                .SendAsync(request, HttpCompletionOption.ResponseHeadersRead, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                return Results.Json(
                    new
                    {
                        error = "Die Datenquelle hat den Abruf abgelehnt.",
                        sourceStatus = (int)response.StatusCode,
                    },
                    statusCode: StatusCodes.Status502BadGateway
                );
            }

            if (response.Content.Headers.ContentLength is > 2_000_000)
                return Results.Json(new { error = "Die Antwort ist zu gross." }, statusCode: 502);

            var mediaType = response.Content.Headers.ContentType?.MediaType;
            if (
                mediaType is not ("application/json" or "application/ld+json")
                && mediaType?.EndsWith("+json", StringComparison.OrdinalIgnoreCase) != true
            )
                return Results.Json(
                    new { error = "Die Datenquelle liefert kein JSON." },
                    statusCode: 502
                );

            await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
            using var limitedStream = new LimitedReadStream(stream, 2_000_000);
            using var document = await JsonDocument.ParseAsync(
                limitedStream,
                cancellationToken: cancellationToken
            );
            return Results.Ok(
                new
                {
                    sourceUrl = uri.ToString(),
                    fetchedAtUtc = DateTimeOffset.UtcNow,
                    data = document.RootElement.Clone(),
                }
            );
        }
        catch (Exception exception)
            when (exception
                    is HttpRequestException
                        or TaskCanceledException
                        or JsonException
                        or InvalidDataException
            )
        {
            return Results.Json(
                new { error = "Der Pass konnte nicht gelesen werden." },
                statusCode: 502
            );
        }
    }

    private static bool CanManage(HttpContext context) =>
        context.Items.TryGetValue("CurrentOrganisationRoles", out var value)
        && value is IEnumerable<string> roles
        && roles.Contains("SYSTEM_ADMIN", StringComparer.OrdinalIgnoreCase);

    private static bool IsLocalhost(Uri uri) =>
        uri.Scheme is "http" or "https"
        && string.Equals(uri.IdnHost, "localhost", StringComparison.OrdinalIgnoreCase);

    private static bool IsAllowed(Uri uri,IEnumerable<DppSource> additionalSources) =>
        (
            string.Equals(uri.IdnHost, SuiteDppGatewayHost, StringComparison.OrdinalIgnoreCase)
            && uri.AbsolutePath.StartsWith(
                SuiteDppGatewayPathPrefix,
                StringComparison.OrdinalIgnoreCase
            )
        )
        || additionalSources.Any(source =>
            string.Equals(source.Host, uri.IdnHost, StringComparison.OrdinalIgnoreCase)
        );
}

internal sealed class LimitedReadStream(Stream inner, long limit) : Stream
{
    private long bytesRead;
    public override bool CanRead => inner.CanRead;
    public override bool CanSeek => false;
    public override bool CanWrite => false;
    public override long Length => throw new NotSupportedException();
    public override long Position
    {
        get => throw new NotSupportedException();
        set => throw new NotSupportedException();
    }

    public override async ValueTask<int> ReadAsync(
        Memory<byte> buffer,
        CancellationToken cancellationToken = default
    )
    {
        var read = await inner.ReadAsync(
            buffer[..(int)Math.Min(buffer.Length, limit - bytesRead + 1)],
            cancellationToken
        );
        bytesRead += read;
        if (bytesRead > limit)
            throw new InvalidDataException("Response too large");
        return read;
    }

    public override int Read(byte[] buffer, int offset, int count) =>
        throw new NotSupportedException();

    public override void Flush() => throw new NotSupportedException();

    public override long Seek(long offset, SeekOrigin origin) => throw new NotSupportedException();

    public override void SetLength(long value) => throw new NotSupportedException();

    public override void Write(byte[] buffer, int offset, int count) =>
        throw new NotSupportedException();
}
