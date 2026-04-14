using System.Net;
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
using Microsoft.EntityFrameworkCore;
using Aas = AasCore.Aas3_1;

namespace AasDesignerAasApi.Shells.Commands.TransferShell;

public class TransferShellCommand : IRequest<TransferShellResponse>
{
    public AppUser AppUser { get; set; } = null!;
    public TransferShellRequest TransferShellRequest { get; set; } = null!;
}

public class TransferShellHandler : IRequestHandler<TransferShellCommand, TransferShellResponse>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly AppSettings _appSettings;

    public TransferShellHandler(
        IApplicationDbContext context,
        IMapper mapper,
        AppSettings appSettings
    )
    {
        _context = context;
        _mapper = mapper;
        _appSettings = appSettings;
    }

    public async Task<TransferShellResponse> Handle(
        TransferShellCommand request,
        CancellationToken cancellationToken
    )
    {
        var targetInfrastructure = await _context
            .Organisations.Include(o =>
                o.AasInfrastructureSettings.Where(s =>
                    s.Id == request.TransferShellRequest.TargetRepoId
                )
            )
            .Where(o => o.Id == request.AppUser.OrganisationId)
            .Select(x =>
                x.AasInfrastructureSettings.FirstOrDefault(x =>
                    x.Id == request.TransferShellRequest.TargetRepoId
                )
            )
            .FirstOrDefaultAsync();
        var sourceInfrastructure = request.AppUser.CurrentInfrastructureSettings;

        if (targetInfrastructure == null)
            throw new Exception("Setting not found");
        var shellLoadResult = await ShellLoader.LoadAsync(
            sourceInfrastructure,
            request.TransferShellRequest.AasIdentifier,
            cancellationToken,
            request.AppUser
        );

        var environment = shellLoadResult.Environment;
        if (environment == null)
            throw new Exception("AAS not found");
        // das sind die originalen Files mit den originalen Pfaden
        var files = FilesFromAasResolver.GetAllAasFiles(
            environment,
            sourceInfrastructure.SubmodelRepositoryUrl.AppendSlash(),
            sourceInfrastructure.AasRepositoryUrl.AppendSlash()
        );

        // ändern und ins ziel schieben
        var modifications = EnvironmentTransferModifier.ModifyEnvironment(
            environment,
            request.AppUser.Organisation.IriPrefix
        );

        using var client = HttpClientCreator.CreateHttpClient(request.AppUser);

        foreach (var aas in environment.AssetAdministrationShells ?? [])
        {
            var editorDescriptor = new EditorDescriptor()
            {
                AasDescriptorEntry = new EditorDescriptorEntry()
                {
                    Endpoint = DescriptorEndpointResolver.ResolveAasDescriptorEndpoint(
                        targetInfrastructure,
                        _appSettings.BaseUrl,
                        aas.Id
                    ),
                    NewId = aas.Id,
                    OldId = aas.Id,
                    IdShort = aas.IdShort ?? "",
                },
            };

            var url = targetInfrastructure.AasRepositoryUrl.AppendSlash() + "shells";

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
                var smUrl = targetInfrastructure.SubmodelRepositoryUrl.AppendSlash() + "submodels";
                var smResponse = await client.PostAsync(
                    smUrl,
                    new StringContent(smJsonString, Encoding.UTF8, "application/json"),
                    cancellationToken
                );
                smResponse.EnsureSuccessStatusCode();

                var smDescriptorEntry = new EditorDescriptorEntry()
                {
                    Endpoint = DescriptorEndpointResolver.ResolveSubmodelDescriptorEndpoint(
                        targetInfrastructure,
                        _appSettings.BaseUrl,
                        sm.Id
                    ),
                    NewId = sm.Id,
                    OldId = id,
                    IdShort = sm.IdShort ?? "",
                };
                editorDescriptor.SubmodelDescriptorEntries.Add(smDescriptorEntry);
            }

            try
            {
                // thumbnail laden und setzen
                var thumb = files.FirstOrDefault(f => f.IsThumbnail);
                if (thumb != null)
                {
                    var loadedThumb = FileLoader.LoadFile(thumb, request.AppUser);
                    if (loadedThumb != null && loadedThumb.Length > 0)
                    {
                        var thumbUrl =
                            targetInfrastructure.AasRepositoryUrl.AppendSlash()
                            + "shells/"
                            + aas.Id.ToBase64UrlEncoded(Encoding.UTF8).AppendSlash()
                            + "asset-information/thumbnail?fileName="
                            + thumb.Filename;
                        using var httpRequest = new HttpRequestMessage(HttpMethod.Put, thumbUrl);
                        var streamContent = new StreamContent(loadedThumb);
                        streamContent.Headers.ContentType = new MediaTypeHeaderValue(
                            thumb.ContentType
                        );
                        using var thumbContent = new MultipartFormDataContent
                        {
                            { streamContent, "file", thumb.Filename },
                        };

                        httpRequest.Content = thumbContent;

                        var thumbResponse = await client.SendAsync(httpRequest);
                        Console.WriteLine("ThumbResponse: " + thumbResponse.StatusCode);
                    }
                }
            }
            catch (Exception)
            {
                // ignorieren, dass kein thumbnail da ist
            }

            await DiscoveryUpdater.UpdateDiscoveryAsync(
                targetInfrastructure.AasDiscoveryUrl,
                (AssetAdministrationShell)aas,
                cancellationToken,
                client
            );
            await RegistryUpdater.UpdateRegistryAsync(
                targetInfrastructure,
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
                targetInfrastructure.AasRepositoryUrl.AppendSlash()
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

        foreach (var cd in environment.ConceptDescriptions ?? [])
        {
            var cdUrl =
                targetInfrastructure.ConceptDescriptionRepositoryUrl.AppendSlash()
                + "concept-descriptions".AppendSlash()
                + cd.Id.ToBase64UrlEncoded(Encoding.UTF8);
            var cdJsonString = BasyxSerializer.Serialize(cd);
            var cdResponse = await client.PutAsync(
                cdUrl,
                new StringContent(cdJsonString, Encoding.UTF8, "application/json"),
                cancellationToken
            );
            if (cdResponse.StatusCode == HttpStatusCode.NotFound)
            {
                // POST dann ohne ID ...
                cdUrl =
                    targetInfrastructure.ConceptDescriptionRepositoryUrl.AppendSlash()
                    + "concept-descriptions";
                cdResponse = await client.PostAsync(
                    cdUrl,
                    new StringContent(cdJsonString, Encoding.UTF8, "application/json"),
                    cancellationToken
                );
                if (!cdResponse.IsSuccessStatusCode)
                {
                    // throw new Exception($"Request to {smUrl} failed with status code {smResponse.StatusCode}");
                    Console.WriteLine("Error saving ConceptDescription: " + cdResponse.StatusCode);
                }
            }
        }

        var aasIdentifier =
            modifications.Find(m => m.Type == ModificationType.Aas)?.NewId ?? string.Empty;
        var hasPcnSubmodel = HasPcnSubmodel(environment);
        var brokerUrls = GetBrokerUrls(environment);
        var topic = GetTopic(environment);

        var transferResult = new TransferShellResponse()
        {
            AasIdentifier = aasIdentifier,
            TargetInfrastructureId = targetInfrastructure.Id,
            HasPcnSubmodel = hasPcnSubmodel,
            BrokerUrls = brokerUrls,
            Topic = topic,
        };

        return transferResult;
    }

    private bool HasPcnSubmodel(Aas.Environment environment)
    {
        return environment.Submodels?.Any(sm =>
                sm.SemanticId?.Keys.Any(k => k.Value == "0173-10029#01-XFB001#001") ?? false
            )
            ?? false;
    }

    private BasicEventElement? GetEventElement(Aas.Environment environment)
    {
        var pcnSm = environment.Submodels?.FirstOrDefault(sm =>
            sm.SemanticId?.Keys.Any(k => k.Value == "0173-10029#01-XFB001#001") ?? false
        );
        if (pcnSm == null)
            return null;

        foreach (var element in pcnSm.SubmodelElements ?? [])
        {
            if (
                (
                    element.IdShort == "PcnEventsOutgoing"
                    || element.IdShort == "PcnEventsIncoming"
                    || HasSemanticId(
                        element,
                        "http://admin-shell.io/VDMA/Fluidics/ProductChangeNotification/EventsOutgoing/1/0"
                    )
                    || HasSemanticId(
                        element,
                        "http://admin-shell.io/VDMA/Fluidics/ProductChangeNotification/EventsIncoming/1/0"
                    )
                )
                && element is BasicEventElement
            )
            {
                return element as BasicEventElement;
            }
        }

        return null;
    }

    private List<string> GetBrokerUrls(Aas.Environment environment)
    {
        var brokerUrls = new List<string>();
        var pcnSm = environment.Submodels?.FirstOrDefault(sm =>
            sm.SemanticId?.Keys.Any(k => k.Value == "0173-10029#01-XFB001#001") ?? false
        );
        if (pcnSm == null)
            return brokerUrls;

        var eventElement = GetEventElement(environment);
        if (eventElement == null)
            return brokerUrls;
        var brokerId = eventElement.MessageBroker?.Keys.LastOrDefault()?.Value ?? string.Empty;
        // TODO: Das Element muss hier über den vollen Pfad gesucht werden!
        var mqttEndpointCollection = pcnSm.SubmodelElements?.FirstOrDefault(
            (el) => el.IdShort == brokerId
        );
        var mqttEndpoint = (
            (mqttEndpointCollection as SubmodelElementCollection)?.Value?.FirstOrDefault(
                (el) => el.IdShort == "EndpointMqtt"
            ) as Property
        )?.Value;
        var wsEndpoint = (
            (mqttEndpointCollection as SubmodelElementCollection)?.Value?.FirstOrDefault(
                (el) => el.IdShort == "EndpointWs"
            ) as Property
        )?.Value;

        List<string> res = [];
        if (mqttEndpoint != null)
        {
            brokerUrls.Add(mqttEndpoint);
        }
        if (wsEndpoint != null)
        {
            brokerUrls.Add(wsEndpoint);
        }
        return brokerUrls;
    }

    private string GetTopic(Aas.Environment environment)
    {
        var topic = string.Empty;
        var pcnSm = environment.Submodels?.FirstOrDefault(sm =>
            sm.SemanticId?.Keys.Any(k => k.Value == "0173-10029#01-XFB001#001") ?? false
        );
        if (pcnSm == null)
            return topic;

        var eventElement = GetEventElement(environment);

        return eventElement?.MessageTopic ?? topic;
    }

    private static Submodel? GetSubmodelFromEnv(Aas.Environment environment, string id)
    {
        return (Submodel?)environment.Submodels?.FirstOrDefault(sm => sm.Id == id);
    }

    public static bool HasSemanticId(ISubmodelElement submodelElement, string semanticId)
    {
        if (submodelElement.SemanticId?.Keys.Any(k => k.Value == semanticId) ?? false)
        {
            return true;
        }

        return false;
    }
}
