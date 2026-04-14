using System.Net.Http.Headers;
using System.Text;
using AasCore.Aas3_1;
using AasDesignerAasApi.Shells.Commands.Model;
using AasDesignerApi.Model;
using AasDesignerCommon.Serialization;
using AasDesignerCommon.Shells;
using AasDesignerCommon.Utils;
using AasDesignerModel;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AasDesignerAasApi.Shells.Commands.ChangeAllIds;

public class ChangeAllIdsCommand : IRequest<string>
{
    public AppUser AppUser { get; set; } = null!;
    public List<IdModification> Modifications { get; set; } = [];
    public EditorDescriptor EditorDescriptor { get; set; } = new();
}

public class ChangeAllIdsHandler : IRequestHandler<ChangeAllIdsCommand, string>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<ChangeAllIdsHandler> _logger;

    public ChangeAllIdsHandler(
        IApplicationDbContext context,
        IMapper mapper,
        ILogger<ChangeAllIdsHandler> logger
    )
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<string> Handle(
        ChangeAllIdsCommand request,
        CancellationToken cancellationToken
    )
    {
        var infrastructure = request.AppUser.CurrentInfrastructureSettings;
        var orga = await _context
            .Organisations.Where(o => o.Id == request.AppUser.OrganisationId)
            .FirstOrDefaultAsync();

        if (orga == null)
            throw new Exception("Organisation not found");
        var aasId = request.Modifications.FirstOrDefault(m => m.Type == "AAS")?.OldId;

        if (aasId == null)
            throw new Exception("AAS ID not found");

        var res = await ShellLoader.LoadAsync(
            infrastructure,
            aasId,
            cancellationToken,
            request.AppUser
        );
        if (res.Environment == null)
            throw new Exception("AAS not found");

        if (res.Environment.AssetAdministrationShells?[0] == null)
            throw new Exception("AAS not found");

        bool aasIdChanged = false;

        // über alle änderungen laufen und die ids anpassen
        foreach (var mod in request.Modifications)
        {
            if (mod.Type == "AAS")
            {
                if (res.Environment.AssetAdministrationShells[0].Id != mod.NewId)
                {
                    aasIdChanged = true;
                    res.Environment.AssetAdministrationShells[0].Id = mod.NewId;
                }
                if (res.Environment.AssetAdministrationShells[0].Administration == null)
                {
                    res.Environment.AssetAdministrationShells[0].Administration =
                        new AasCore.Aas3_1.AdministrativeInformation();
                }
                res.Environment.AssetAdministrationShells[0].Administration!.Version =
                    mod.NewVersion;
                res.Environment.AssetAdministrationShells[0].Administration!.Revision =
                    mod.NewRevision;
            }
            else if (mod.Type == "SM")
            {
                var submodel = res.Environment.Submodels?.FirstOrDefault(s => s.Id == mod.OldId);
                if (submodel != null)
                {
                    if (submodel.Id != mod.NewId)
                    {
                        submodel.Id = mod.NewId;
                        var smRef = res
                            .Environment.AssetAdministrationShells[0]
                            .Submodels?.FirstOrDefault(s => s.Keys[0].Value == mod.OldId);
                        if (smRef != null)
                        {
                            smRef.Keys[0].Value = mod.NewId;
                        }
                    }
                    if (submodel.Administration == null)
                    {
                        submodel.Administration = new AasCore.Aas3_1.AdministrativeInformation();
                    }
                    submodel.Administration.Version = mod.NewVersion;
                    submodel.Administration.Revision = mod.NewRevision;
                }
                else
                {
                    _logger.LogWarning("Unknown id type: " + mod.Type);
                }
            }
        }

        // wenn AAS ID geändert, dann muss die alte gelöscht werden und die neue geschrieben
        if (aasIdChanged)
        {
            using var client = HttpClientCreator.CreateHttpClient(request.AppUser);

            var newUrl = infrastructure.AasRepositoryUrl.AppendSlash() + "shells";
            // neue schreiben
            var aasJsonString = BasyxSerializer.Serialize(
                res.Environment.AssetAdministrationShells[0]
            );
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
                + aasId.ToBase64UrlEncoded(Encoding.UTF8)
                + "/asset-information/thumbnail?fileName=thumbnail";
            var loadedThumb = FileLoader.LoadFile(thumbUrl, request.AppUser);

            // alte löschen
            var deleteUrl =
                infrastructure.AasRepositoryUrl.AppendSlash()
                + "shells".AppendSlash()
                + aasId.ToBase64UrlEncoded(Encoding.UTF8);
            var response = await client.DeleteAsync(deleteUrl, cancellationToken);
            var content = await response.Content.ReadAsStringAsync();
            response.EnsureSuccessStatusCode();

            await DiscoveryUpdater.RemoveFromDiscovery(
                infrastructure.AasDiscoveryUrl,
                aasId,
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
                (AssetAdministrationShell)res.Environment.AssetAdministrationShells[0],
                cancellationToken,
                client
            );
        }

        // jetzt noch das "normale" update hinterher, damit SMs geändert werden
        await SaveShellInInfrastructure.UpdateSingle(
            res.Environment,
            request.AppUser,
            orga,
            [],
            cancellationToken,
            request.EditorDescriptor,
            _context,
            true,
            "IDs updated"
        );

        // TODO: wir müssen noch einmal über angehängte Dateien nachdenken....

        return res.Environment.AssetAdministrationShells[0].Id;
    }
}
