using System.Net;
using System.Text;
using AasCore.Aas3_1;
using AasDesignerCommon.Registry;
using AasDesignerCommon.Utils;
using AasDesignerModel.Model;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using Newtonsoft.Json.Serialization;

namespace AasDesignerCommon.Shells;

public class RegistryUpdater
{
    private static ILogger<RegistryUpdater>? _logger;

    static RegistryUpdater()
    {
        // Dienstanbieter für Dependency Injection abrufen
        var serviceProvider = new ServiceCollection()
            .AddLogging(configure =>
            {
                configure.AddConsole();
                configure.AddDebug();
                configure.AddLog4Net("log4net.config", true);
            })
            .BuildServiceProvider();

        // Logger initialisieren
        _logger = serviceProvider.GetService<ILogger<RegistryUpdater>>();
    }

    public static string SerializeAasDesc(AssetAdministrationShellDescriptor aasDescriptor)
    {
        DefaultContractResolver contractResolver = new DefaultContractResolver
        {
            NamingStrategy = new CamelCaseNamingStrategy(),
        };
        var serializerSettings = new JsonSerializerSettings
        {
            ContractResolver = contractResolver,
            Formatting = Formatting.Indented,
            Converters = [new StringEnumConverter()],
            NullValueHandling = NullValueHandling.Ignore,
        };

        return JsonConvert.SerializeObject(aasDescriptor, serializerSettings);
    }

    public static string SerializeSmDesc(SubmodelDescriptor smDescriptor)
    {
        DefaultContractResolver contractResolver = new DefaultContractResolver
        {
            NamingStrategy = new CamelCaseNamingStrategy(),
        };
        var serializerSettings = new JsonSerializerSettings
        {
            ContractResolver = contractResolver,
            Formatting = Formatting.Indented,
            Converters = [new StringEnumConverter()],
            NullValueHandling = NullValueHandling.Ignore,
        };

        return JsonConvert.SerializeObject(smDescriptor, serializerSettings);
    }

    public static async Task UpdateRegistryAsync(
        AasInfrastructureSettings infrastructure,
        AasCore.Aas3_1.Environment environment,
        CancellationToken cancellationToken,
        HttpClient client,
        EditorDescriptor editorDescriptor
    )
    {
        if (
            environment.AssetAdministrationShells == null
            || environment.AssetAdministrationShells.Count == 0
        )
            return;
        foreach (var aas in environment.AssetAdministrationShells)
        {
            // schauen ob vorhanden
            var aasRegistryUrl =
                infrastructure.AasRegistryUrl.AppendSlash()
                + "shell-descriptors/"
                + aas.Id.ToBase64UrlEncoded(Encoding.UTF8);
            _logger?.LogDebug("AAS registry URL: {aasRegistryUrl}", aasRegistryUrl);
            List<Submodel> submodelsToAdd = [];
            aas.Submodels?.ForEach(sm =>
            {
                var submodel = environment.Submodels?.Find(s =>
                    s.Id == sm.Keys.FirstOrDefault()?.Value
                );
                if (submodel != null)
                {
                    submodelsToAdd.Add((Submodel)submodel);
                }
            });

            if (!string.IsNullOrWhiteSpace(infrastructure.AasRegistryUrl))
            {
                try
                {
                    var registryResponse = await client.GetAsync(aasRegistryUrl, cancellationToken);
                    if (registryResponse.StatusCode == HttpStatusCode.NotFound)
                    {
                        var aasDescriptor = DescriptorCreator.CreateDescriptor(
                            aas,
                            submodelsToAdd.Cast<ISubmodel>().ToList(),
                            infrastructure,
                            editorDescriptor
                        );

                        await PostDescriptorAsync(
                            infrastructure.AasRegistryUrl.AppendSlash() + "shell-descriptors",
                            SerializeAasDesc(aasDescriptor),
                            cancellationToken,
                            client,
                            "create aas descriptor"
                        );
                    }
                    else if (registryResponse.IsSuccessStatusCode)
                    {
                        var registryContent = await registryResponse.Content.ReadAsStringAsync();
                        var aasDescriptor =
                            JsonConvert.DeserializeObject<AssetAdministrationShellDescriptor>(
                                registryContent
                            );

                        if (aasDescriptor == null)
                        {
                            throw new Exception("Could not deserialize existing AAS descriptor.");
                        }

                        DescriptorUpdater.UpdateAasDescriptor(
                            aasDescriptor,
                            editorDescriptor,
                            aas,
                            submodelsToAdd
                        );

                        await PutDescriptorAsync(
                            aasRegistryUrl,
                            SerializeAasDesc(aasDescriptor),
                            cancellationToken,
                            client,
                            "update aas descriptor"
                        );
                    }
                    else
                    {
                        _logger?.LogError(
                            "Error updating aas registry: {ReasonPhrase} {StatusCode}",
                            registryResponse.ReasonPhrase,
                            registryResponse.StatusCode
                        );
                    }
                }
                catch (Exception e)
                {
                    _logger?.LogError(e, "Error reading registry: {Message}", e.Message);
                }
            }
            // sm registry updaten
            foreach (var sm in submodelsToAdd)
            {
                var smRegistryUrl =
                    infrastructure.SubmodelRegistryUrl.AppendSlash()
                    + "submodel-descriptors/"
                    + sm.Id.ToBase64UrlEncoded(Encoding.UTF8);
                _logger?.LogDebug("SM registry URL: {smRegistryUrl}", smRegistryUrl);
                if (smRegistryUrl == null)
                    continue;

                var editorDescriptorEntry = editorDescriptor.SubmodelDescriptorEntries.Find(entry =>
                    entry.NewId == sm.Id || entry.OldId == sm.Id
                );

                // aas Registry updaten
                try
                {
                    var registryResponse = await client.GetAsync(smRegistryUrl, cancellationToken);
                    if (registryResponse.StatusCode == HttpStatusCode.NotFound)
                    {
                        var smDescriptor = !string.IsNullOrWhiteSpace(
                            editorDescriptorEntry?.Endpoint
                        )
                            ? DescriptorCreator.CreateSubmodelDescriptorWithFullUrl(
                                sm,
                                DescriptorUpdater.GetDesiredEndpointHref(editorDescriptorEntry!)
                            )
                            : DescriptorCreator.CreateSubmodelDescriptor(
                                sm,
                                infrastructure.SubmodelRepositoryUrl
                            );

                        await PostDescriptorAsync(
                            infrastructure.SubmodelRegistryUrl.AppendSlash()
                                + "submodel-descriptors",
                            SerializeSmDesc(smDescriptor),
                            cancellationToken,
                            client,
                            "create submodel descriptor"
                        );
                    }
                    else if (registryResponse.IsSuccessStatusCode)
                    {
                        var registryContent = await registryResponse.Content.ReadAsStringAsync();
                        var smDescriptor = JsonConvert.DeserializeObject<SubmodelDescriptor>(
                            registryContent
                        );

                        if (smDescriptor == null)
                        {
                            throw new Exception(
                                "Could not deserialize existing submodel descriptor."
                            );
                        }

                        DescriptorUpdater.UpdateSubmodelDescriptor(
                            smDescriptor,
                            sm,
                            editorDescriptorEntry
                        );

                        await PutDescriptorAsync(
                            smRegistryUrl,
                            SerializeSmDesc(smDescriptor),
                            cancellationToken,
                            client,
                            "update submodel descriptor"
                        );
                    }
                    else
                    {
                        var c = await registryResponse.Content.ReadAsStringAsync();
                        _logger?.LogError(
                            "Error updating aas registry (create new descriptor): {ReasonPhrase} {StatusCode} {content}",
                            registryResponse.ReasonPhrase,
                            registryResponse.StatusCode,
                            c
                        );
                    }
                }
                catch (Exception e)
                {
                    _logger?.LogError(e, "Error reading registry: {Message}", e.Message);
                }
            }
        }
    }

    private static async Task PostDescriptorAsync(
        string url,
        string json,
        CancellationToken cancellationToken,
        HttpClient client,
        string operation
    )
    {
        var content = new StringContent(json, Encoding.UTF8, "application/json");
        var response = await client.PostAsync(url, content, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            var responseContent = await response.Content.ReadAsStringAsync();
            _logger?.LogError(
                "Error during {Operation}: {ReasonPhrase} {StatusCode} {Content}",
                operation,
                response.ReasonPhrase,
                response.StatusCode,
                responseContent
            );
        }
    }

    private static async Task PutDescriptorAsync(
        string url,
        string json,
        CancellationToken cancellationToken,
        HttpClient client,
        string operation
    )
    {
        var content = new StringContent(json, Encoding.UTF8, "application/json");
        var response = await client.PutAsync(url, content, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            var responseContent = await response.Content.ReadAsStringAsync();
            _logger?.LogError(
                "Error during {Operation}: {ReasonPhrase} {StatusCode} {Content}",
                operation,
                response.ReasonPhrase,
                response.StatusCode,
                responseContent
            );
        }
    }

    public static async Task RemoveFromAasRegistryAsync(
        string registryUrl,
        string aasId,
        CancellationToken cancellationToken,
        HttpClient client
    )
    {
        var url =
            registryUrl.AppendSlash()
            + "shell-descriptors/"
            + aasId.ToBase64UrlEncoded(Encoding.UTF8);
        try
        {
            var registryResponse = await client.DeleteAsync(url, cancellationToken);
            if (!registryResponse.IsSuccessStatusCode)
            {
                if (registryResponse.StatusCode == HttpStatusCode.NotFound)
                {
                    _logger?.LogDebug("AAS registry entry already removed: {AasId}", aasId);
                    return;
                }

                _logger?.LogError(
                    "Error removing from registry: {ReasonPhrase}",
                    registryResponse.ReasonPhrase
                );
            }
        }
        catch (Exception e)
        {
            _logger?.LogError(e, "Error removing from registry: {Message}", e.Message);
        }
    }

    public static async Task RemoveFromSmRegistryAsync(
        string registryUrl,
        string smId,
        CancellationToken cancellationToken,
        HttpClient client
    )
    {
        var url =
            registryUrl.AppendSlash()
            + "submodel-descriptors/"
            + smId.ToBase64UrlEncoded(Encoding.UTF8);
        try
        {
            var registryResponse = await client.DeleteAsync(url, cancellationToken);
            if (!registryResponse.IsSuccessStatusCode)
            {
                if (registryResponse.StatusCode == HttpStatusCode.NotFound)
                {
                    _logger?.LogDebug("Submodel registry entry already removed: {SmId}", smId);
                    return;
                }

                _logger?.LogError(
                    "Error removing from registry: {ReasonPhrase}",
                    registryResponse.ReasonPhrase
                );
            }
        }
        catch (Exception e)
        {
            _logger?.LogError(e, "Error removing from registry: {Message}", e.Message);
        }
    }
}
