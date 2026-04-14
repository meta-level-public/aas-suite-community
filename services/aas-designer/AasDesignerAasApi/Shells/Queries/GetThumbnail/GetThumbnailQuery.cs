using System.Text;
using AasDesignerApi.Model;
using AasDesignerCommon.Shells;
using AasDesignerCommon.Utils;
using AasDesignerModel;
using AasShared.Configuration;
using AutoMapper;
using MediatR;

namespace AasDesignerAasApi.Shells.Queries.GetThumbnail;

public class GetThumbnailQuery : IRequest<Stream?>
{
    public AppUser AppUser { get; set; } = null!;
    public string AasIdentifier { get; set; } = string.Empty;

    public static Stream GetNoThumbSvgStream()
    {
        return new MemoryStream(
            Encoding.UTF8.GetBytes(
                @"<?xml version=""1.0"" encoding=""utf-8""?><!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools --> <svg fill=""#000000"" width=""800px"" height=""800px"" viewBox=""0 0 32 32"" id=""icon"" xmlns=""http://www.w3.org/2000/svg""><defs><style>.cls-1{fill:none;}</style></defs><title>no-image</title><path d=""M30,3.4141,28.5859,2,2,28.5859,3.4141,30l2-2H26a2.0027,2.0027,0,0,0,2-2V5.4141ZM26,26H7.4141l7.7929-7.793,2.3788,2.3787a2,2,0,0,0,2.8284,0L22,19l4,3.9973Zm0-5.8318-2.5858-2.5859a2,2,0,0,0-2.8284,0L19,19.1682l-2.377-2.3771L26,7.4141Z""/><path d=""M6,22V19l5-4.9966,1.3733,1.3733,1.4159-1.416-1.375-1.375a2,2,0,0,0-2.8284,0L6,16.1716V6H22V4H6A2.002,2.002,0,0,0,4,6V22Z""/><rect id=""_Transparent_Rectangle_"" data-name=""&lt;Transparent Rectangle&gt;"" class=""cls-1"" width=""32"" height=""32""/></svg>"
            )
        );
    }
}

public class GetThumbnailQueryHandler : IRequestHandler<GetThumbnailQuery, Stream?>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly AppSettings _appSettings;

    public GetThumbnailQueryHandler(
        IApplicationDbContext context,
        IMapper mapper,
        AppSettings appSettings
    )
    {
        _context = context;
        _mapper = mapper;
        _appSettings = appSettings;
    }

    public async Task<Stream?> Handle(
        GetThumbnailQuery request,
        CancellationToken cancellationToken
    )
    {
        var infrastructure = request.AppUser.CurrentInfrastructureSettings;
        var aasRepoShellUrl =
            infrastructure.AasRepositoryUrl.AppendSlash()
            + "shells".AppendSlash()
            + request.AasIdentifier.ToBase64UrlEncoded(Encoding.UTF8);

        var thumbEndpoints = new List<string>();
        AddThumbEndpoints(thumbEndpoints, aasRepoShellUrl, "thumbnail");

        try
        {
            var assetInformation = await ShellLoader.LoadAssetInformationOnly(
                request.AppUser.CurrentInfrastructureSettings,
                request.AasIdentifier,
                cancellationToken,
                request.AppUser
            );
            var thumbPath = assetInformation?.DefaultThumbnail?.Path;
            if (!string.IsNullOrWhiteSpace(thumbPath))
            {
                var fileName = Path.GetFileName(thumbPath);
                if (!string.IsNullOrWhiteSpace(fileName))
                {
                    AddThumbEndpoints(thumbEndpoints, aasRepoShellUrl, fileName);
                }
                AddThumbEndpoints(thumbEndpoints, aasRepoShellUrl, thumbPath);
            }
        }
        catch
        {
            // optional metadata, fallback endpoints below are sufficient
        }

        // Fallback: Endpoint aus Registry-Descriptor versuchen
        try
        {
            var aasUrls = await ShellLoader.GetAasCandidateUrls(
                request.AppUser.CurrentInfrastructureSettings,
                request.AasIdentifier,
                cancellationToken,
                request.AppUser
            );
            foreach (var aasUrl in aasUrls)
            {
                AddThumbEndpoints(thumbEndpoints, aasUrl, "thumbnail");
            }
        }
        catch
        {
            // ignore
        }

        foreach (var endpoint in thumbEndpoints.Distinct())
        {
            var stream = await TryLoadThumbnail(endpoint, request.AppUser, cancellationToken);
            if (stream != null)
            {
                return stream;
            }
        }

        return null;
    }

    private static void AddThumbEndpoints(List<string> endpoints, string shellUrl, string fileName)
    {
        var baseThumbUrl = shellUrl.AppendSlash() + "asset-information/thumbnail";
        endpoints.Add(baseThumbUrl);

        if (!string.IsNullOrWhiteSpace(fileName))
        {
            endpoints.Add($"{baseThumbUrl}?fileName={Uri.EscapeDataString(fileName)}");
        }
    }

    private static async Task<Stream?> TryLoadThumbnail(
        string endpoint,
        AppUser appUser,
        CancellationToken cancellationToken
    )
    {
        using var client = HttpClientCreator.CreateHttpClient(appUser);
        using var response = await client.GetAsync(endpoint, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            return null;
        }

        var mediaType =
            response.Content.Headers.ContentType?.MediaType?.ToLowerInvariant() ?? string.Empty;
        if (mediaType.Contains("json") || mediaType.Contains("text/html"))
        {
            return null;
        }

        var bytes = await response.Content.ReadAsByteArrayAsync(cancellationToken);
        if (bytes.Length == 0)
        {
            return null;
        }

        // Some stacks return JSON error payloads despite 2xx.
        var firstNonWhitespace = bytes
            .Select(b => (char)b)
            .FirstOrDefault(c => !char.IsWhiteSpace(c));
        if (firstNonWhitespace == '{' || firstNonWhitespace == '[')
        {
            return null;
        }

        return new MemoryStream(bytes);
    }
}
