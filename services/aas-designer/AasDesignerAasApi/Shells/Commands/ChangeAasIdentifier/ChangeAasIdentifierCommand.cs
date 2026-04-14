using System.Net.Http.Headers;
using System.Text;
using AasCore.Aas3_1;
using AasDesignerApi.Model;
using AasDesignerCommon.Serialization;
using AasDesignerCommon.Shells;
using AasDesignerCommon.Utils;
using AasDesignerModel;
using AutoMapper;
using MediatR;

namespace AasDesignerAasApi.Shells.Commands.ChangeAasIdentifier;

public class ChangeAasIdentifierCommand : IRequest<string>
{
    public AppUser AppUser { get; set; } = null!;
    public string AasIdentifier { get; set; } = string.Empty;
    public string NewAasIdentifier { get; set; } = string.Empty;
}

public class ChangeAasIdentifierHandler : IRequestHandler<ChangeAasIdentifierCommand, string>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public ChangeAasIdentifierHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<string> Handle(
        ChangeAasIdentifierCommand request,
        CancellationToken cancellationToken
    )
    {
        var infrastructure = request.AppUser.CurrentInfrastructureSettings;

        var aas = await ShellLoader.LoadShellOnly(
            infrastructure,
            request.AasIdentifier,
            cancellationToken,
            request.AppUser
        );
        if (aas == null)
            throw new Exception("AAS not found");

        using var client = HttpClientCreator.CreateHttpClient(request.AppUser);

        // id auf die neue setzen
        aas.Id = request.NewAasIdentifier;

        var newUrl = infrastructure.AasRepositoryUrl.AppendSlash() + "shells";
        // neue schreiben
        var aasJsonString = BasyxSerializer.Serialize(aas);
        var responseNew = await client.PostAsync(
            newUrl,
            new StringContent(aasJsonString, Encoding.UTF8, "application/json"),
            cancellationToken
        );
        var contentNew = await responseNew.Content.ReadAsStringAsync();
        responseNew.EnsureSuccessStatusCode();

        // thumbnail laden für später
        var thumbUrl =
            infrastructure.AasRepositoryUrl.AppendSlash()
            + "shells".AppendSlash()
            + request.AasIdentifier.ToBase64UrlEncoded(Encoding.UTF8)
            + "/asset-information/thumbnail?fileName=thumbnail";
        var loadedThumb = FileLoader.LoadFile(thumbUrl, request.AppUser);

        // alte löschen
        var deleteUrl =
            infrastructure.AasRepositoryUrl.AppendSlash()
            + "shells".AppendSlash()
            + request.AasIdentifier.ToBase64UrlEncoded(Encoding.UTF8);
        var response = await client.DeleteAsync(deleteUrl, cancellationToken);
        var content = await response.Content.ReadAsStringAsync();
        response.EnsureSuccessStatusCode();

        await DiscoveryUpdater.RemoveFromDiscovery(
            infrastructure.AasDiscoveryUrl,
            request.AasIdentifier,
            cancellationToken,
            client
        );

        if (loadedThumb != null && loadedThumb.Length > 0)
        {
            using var httpRequest = new HttpRequestMessage(HttpMethod.Put, thumbUrl);
            var streamContent = new StreamContent(loadedThumb);
            streamContent.Headers.ContentType = new MediaTypeHeaderValue("image/png");
            using var thumbContent = new MultipartFormDataContent
            {
                { streamContent, "file", "thumbnail.png" },
            };

            httpRequest.Content = thumbContent;

            var thumbResponse = await client.SendAsync(httpRequest);
            Console.WriteLine("ThumbResponse: " + thumbResponse.StatusCode);
        }

        await DiscoveryUpdater.UpdateDiscoveryAsync(
            infrastructure.AasDiscoveryUrl,
            (AssetAdministrationShell)aas,
            cancellationToken,
            client
        );
        // TODO: Registry updaten!
        // await RegistryUpdater.UpdateRegistryAsync(infrastructure, environment, cancellationToken, client);

        return request.NewAasIdentifier;
    }
}
