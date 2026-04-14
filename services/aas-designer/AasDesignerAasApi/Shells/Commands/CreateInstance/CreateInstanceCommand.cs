using System.Net.Http.Headers;
using System.Text;
using AasCore.Aas3_1;
using AasDesignerApi.Model;
using AasDesignerCommon.Registry;
using AasDesignerCommon.Serialization;
using AasDesignerCommon.Shells;
using AasDesignerCommon.Utils;
using AasDesignerModel;
using AasShared.Configuration;
using AutoMapper;
using MediatR;
using Aas = AasCore.Aas3_1;

namespace AasDesignerAasApi.Shells.Commands.CreateInstance;

public class CreateInstanceCommand : IRequest<string>
{
    public AppUser AppUser { get; set; } = null!;
    public CreateInstanceRequest CreateInstanceRequest { get; set; } = null!;
}

public class CreateInstanceHandler : IRequestHandler<CreateInstanceCommand, string>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly AppSettings _appSettings;

    public CreateInstanceHandler(
        IApplicationDbContext context,
        IMapper mapper,
        AppSettings appSettings
    )
    {
        _context = context;
        _mapper = mapper;
        _appSettings = appSettings;
    }

    public async Task<string> Handle(
        CreateInstanceCommand request,
        CancellationToken cancellationToken
    )
    {
        var infrastructure = request.AppUser.CurrentInfrastructureSettings;

        var shellLoadResult = await ShellLoader.LoadAsync(
            infrastructure,
            request.CreateInstanceRequest.AasIdentifier,
            cancellationToken,
            request.AppUser
        );

        var environment = shellLoadResult.Environment;
        if (environment == null)
            throw new Exception("AAS not found");
        // das sind die originalen Files mit den originalen Pfaden
        var files = FilesFromAasResolver.GetAllAasFiles(
            environment,
            infrastructure.SubmodelRepositoryUrl.AppendSlash(),
            infrastructure.AasRepositoryUrl.AppendSlash()
        );

        // ändern und ins ziel schieben
        var modifications = EnvironmentCreateInstanceModifier.ModifyEnvironment(
            environment,
            request.AppUser.Organisation.IriPrefix,
            request.CreateInstanceRequest.SerialNumber,
            request.CreateInstanceRequest.DateOfManufacture
        );

        using var client = HttpClientCreator.CreateHttpClient(request.AppUser);

        foreach (var aas in environment.AssetAdministrationShells ?? [])
        {
            var editorDescriptor = new EditorDescriptor()
            {
                AasDescriptorEntry = new EditorDescriptorEntry()
                {
                    Endpoint = DescriptorEndpointResolver.ResolveAasDescriptorEndpoint(
                        infrastructure,
                        _appSettings.BaseUrl,
                        aas.Id
                    ),
                    NewId = aas.Id,
                    OldId = aas.Id,
                    IdShort = aas.IdShort ?? "",
                },
            };

            var url = infrastructure.AasRepositoryUrl.AppendSlash() + "shells";

            var aasJsonString = BasyxSerializer.Serialize(aas);
            var response = await client.PostAsync(
                url,
                new StringContent(aasJsonString, Encoding.UTF8, "application/json"),
                cancellationToken
            );
            var content = await response.Content.ReadAsStringAsync();
            response.EnsureSuccessStatusCode();

            foreach (var smRef in aas.Submodels ?? [])
            {
                var id = smRef.Keys.FirstOrDefault()?.Value ?? string.Empty;

                var sm = GetSubmodelFromEnv(environment, id);
                if (sm == null)
                {
                    continue;
                }

                var smJsonString = BasyxSerializer.Serialize(sm);
                var smUrl = infrastructure.SubmodelRepositoryUrl.AppendSlash() + "submodels";
                var smResponse = await client.PostAsync(
                    smUrl,
                    new StringContent(smJsonString, Encoding.UTF8, "application/json"),
                    cancellationToken
                );
                smResponse.EnsureSuccessStatusCode();

                var smDescriptorEntry = new EditorDescriptorEntry()
                {
                    Endpoint = DescriptorEndpointResolver.ResolveSubmodelDescriptorEndpoint(
                        infrastructure,
                        _appSettings.BaseUrl,
                        sm.Id
                    ),
                    NewId = sm.Id,
                    OldId = id,
                    IdShort = sm.IdShort ?? "",
                };
                editorDescriptor.SubmodelDescriptorEntries.Add(smDescriptorEntry);
            }

            // thumbnail laden und setzen
            var thumb = files.FirstOrDefault(f => f.IsThumbnail);
            if (thumb != null)
            {
                var loadedThumb = FileLoader.LoadFile(thumb, request.AppUser);
                if (loadedThumb != null && loadedThumb.Length > 0)
                {
                    var thumbUrl =
                        infrastructure.AasRepositoryUrl.AppendSlash()
                        + "shells/"
                        + aas.Id.ToBase64UrlEncoded(Encoding.UTF8).AppendSlash()
                        + "asset-information/thumbnail?fileName="
                        + thumb.Filename;
                    using var httpRequest = new HttpRequestMessage(HttpMethod.Put, thumbUrl);
                    var streamContent = new StreamContent(loadedThumb);
                    streamContent.Headers.ContentType = new MediaTypeHeaderValue(thumb.ContentType);
                    using var thumbContent = new MultipartFormDataContent
                    {
                        { streamContent, "file", thumb.Filename },
                    };

                    httpRequest.Content = thumbContent;

                    var thumbResponse = await client.SendAsync(httpRequest);
                    Console.WriteLine("ThumbResponse: " + thumbResponse.StatusCode);
                }
            }

            await DiscoveryUpdater.UpdateDiscoveryAsync(
                infrastructure.AasDiscoveryUrl,
                (AssetAdministrationShell)aas,
                cancellationToken,
                client
            );
            await RegistryUpdater.UpdateRegistryAsync(
                infrastructure,
                environment,
                cancellationToken,
                client,
                editorDescriptor
            );
        }

        foreach (var file in files)
        {
            // Laden und wieder wegschreiben
            var loadedFile = FileLoader.LoadFile(file, request.AppUser);

            var smId =
                modifications.FirstOrDefault(m => m.Id == file.SubmodelId)?.NewId ?? string.Empty;

            var fileUrl =
                infrastructure.AasRepositoryUrl.AppendSlash()
                + "submodels/"
                + smId.ToBase64UrlEncoded(Encoding.UTF8).AppendSlash()
                + "submodel-elements/"
                + file.idShortPath
                + "/attachment?fileName="
                + file.Filename;
            using var httpRequest = new HttpRequestMessage(HttpMethod.Put, fileUrl);
            var streamContent = new StreamContent(loadedFile);
            streamContent.Headers.ContentType = new MediaTypeHeaderValue(file.ContentType);
            using var content = new MultipartFormDataContent
            {
                { streamContent, "file", file.Filename },
            };

            httpRequest.Content = content;

            var fileResponse = await client.SendAsync(httpRequest);
            Console.WriteLine("FileResponse: " + fileResponse.StatusCode);
        }

        return modifications.Find(m => m.Type == ModificationType.Aas)?.NewId ?? string.Empty;
    }

    private static Submodel? GetSubmodelFromEnv(Aas.Environment environment, string id)
    {
        return (Submodel?)environment.Submodels?.FirstOrDefault(sm => sm.Id == id);
    }
}
