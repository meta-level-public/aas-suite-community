using System.Text;
using System.Text.Json.Nodes;
using AasCore.Aas3_1;
using AasDesignerAasApi.Shells.Queries.GetContainedSubmodels;
using AasDesignerApi.Model;
using AasDesignerCommon.Shells;
using AasDesignerCommon.Utils;
using AasDesignerModel.Model;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace AasDesignerAasApi.Shells;

public class SubmodelMetadataLoader
{
    private static readonly ILogger<SubmodelMetadataLoader>? _logger;

    // Statischer Konstruktor
    static SubmodelMetadataLoader()
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
        _logger = serviceProvider.GetService<ILogger<SubmodelMetadataLoader>>();
    }

    public static async Task<List<SubmodelMetadata>> LoadAsync(
        AasInfrastructureSettings aasInfrastructureSettings,
        string aasIdentifier,
        CancellationToken cancellationToken,
        AppUser appUser
    )
    {
        var result = new List<SubmodelMetadata>();
        using var client = HttpClientCreator.CreateHttpClient(appUser);

        var aasCandidateUrls = new List<string>();
        try
        {
            aasCandidateUrls = await ShellLoader.GetAasCandidateUrls(
                aasInfrastructureSettings,
                aasIdentifier,
                cancellationToken,
                appUser
            );
        }
        catch (Exception e)
        {
            _logger?.LogError(e, "Failed to get AAS URL. Falling back to default URL.");
        }

        var fallbackAasUrl =
            aasInfrastructureSettings.AasRepositoryUrl.AppendSlash()
            + "shells/"
            + aasIdentifier.ToBase64UrlEncoded(Encoding.UTF8);

        var settings = new JsonSerializerSettings
        {
            NullValueHandling = NullValueHandling.Ignore,
            ContractResolver = new CamelCasePropertyNamesContractResolver(),
        };

        var submodelRefUrlCandidates = aasCandidateUrls
            .Append(fallbackAasUrl)
            .Where(url => !string.IsNullOrWhiteSpace(url))
            .Select(url => url.AppendSlash() + "submodel-refs")
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        var (res, _) = await ShellLoader.LoadFromCandidateUrlsAsync(
            submodelRefUrlCandidates,
            async (candidateUrl, ct) =>
            {
                HttpResponseMessage response = await client.GetAsync(candidateUrl, ct);
                if (!response.IsSuccessStatusCode)
                {
                    throw new Exception(
                        $"Request to {candidateUrl} failed with status code {response.StatusCode}"
                    );
                }

                var responseRegistry = await response.Content.ReadAsStringAsync();
                return JsonConvert.DeserializeObject<SubmodelRefResult>(responseRegistry, settings)
                    ?? throw new Exception($"Deserialize failed for {candidateUrl}");
            },
            $"submodel refs for {aasIdentifier}",
            cancellationToken
        );

        if (res != null)
        {
            foreach (var smRef in res.ResultItem ?? [])
            {
                var submodelId = smRef.Keys[0].Value;
                var submodelCandidateUrls = new List<string>();
                try
                {
                    submodelCandidateUrls = await ShellLoader.GetSmCandidateUrls(
                        aasInfrastructureSettings,
                        aasIdentifier,
                        submodelId,
                        cancellationToken,
                        appUser,
                        client
                    );
                }
                catch (Exception e)
                {
                    _logger?.LogWarning(
                        e,
                        "Failed to resolve submodel candidates for {SubmodelId}",
                        submodelId
                    );
                }

                var fallbackSubmodelUrl =
                    aasInfrastructureSettings.SubmodelRepositoryUrl.AppendSlash()
                    + "submodels/"
                    + submodelId.ToBase64UrlEncoded(Encoding.UTF8);

                var metadataCandidates = submodelCandidateUrls
                    .Append(fallbackSubmodelUrl)
                    .Where(url => !string.IsNullOrWhiteSpace(url))
                    .Distinct(StringComparer.OrdinalIgnoreCase)
                    .SelectMany(url => new[] { url.AppendSlash() + "$metadata", url })
                    .ToList();

                try
                {
                    var (submodelRes, _) = await ShellLoader.LoadFromCandidateUrlsAsync(
                        metadataCandidates,
                        async (candidateUrl, ct) =>
                            await LoadMetadataAsync(client, candidateUrl, ct)
                            ?? throw new Exception($"No metadata at {candidateUrl}"),
                        $"metadata for submodel {submodelId}",
                        cancellationToken
                    );

                    result.Add(submodelRes);
                }
                catch (Exception e)
                {
                    _logger?.LogWarning(
                        e,
                        "Failed to load metadata for submodel {SubmodelId}",
                        submodelId
                    );
                }
            }
        }
        return result;
    }

    private static async Task<SubmodelMetadata?> LoadMetadataAsync(
        HttpClient client,
        string url,
        CancellationToken cancellationToken
    )
    {
        HttpResponseMessage submodelResponse = await client.GetAsync(url, cancellationToken);

        if (!submodelResponse.IsSuccessStatusCode)
        {
            _logger?.LogWarning(
                "Request to {SubmodelUrl} failed with status code {StatusCode}",
                url,
                submodelResponse.StatusCode
            );
            return null;
        }

        var smResponseContent = await submodelResponse.Content.ReadAsStringAsync();

        try
        {
            return JsonConvert.DeserializeObject<SubmodelMetadata>(smResponseContent);
        }
        catch (Exception e)
        {
            _logger?.LogWarning(
                e,
                "Failed to deserialize submodel metadata from {SubmodelUrl}",
                url
            );
            return null;
        }
    }

    public static async Task<Submodel?> LoadNameplate(
        AasInfrastructureSettings aasInfrastructureSettings,
        string aasIdentifier,
        CancellationToken cancellationToken,
        AppUser appUser
    )
    {
        using var client = HttpClientCreator.CreateHttpClient(appUser);

        var url =
            aasInfrastructureSettings.AasRepositoryUrl.AppendSlash()
            + "shells/"
            + aasIdentifier.ToBase64UrlEncoded(Encoding.UTF8).AppendSlash()
            + "submodel-refs";

        HttpResponseMessage response = await client.GetAsync(url, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            _logger?.LogError(
                "Request to {Url} failed with status code {StatusCode}",
                url,
                response.StatusCode
            );
            throw new Exception($"Request to {url} failed with status code {response.StatusCode}");
        }

        var responseRegistry = await response.Content.ReadAsStringAsync();
        var settings = new JsonSerializerSettings
        {
            NullValueHandling = NullValueHandling.Ignore,
            ContractResolver = new CamelCasePropertyNamesContractResolver(),
        };

        var res = JsonConvert.DeserializeObject<SubmodelRefResult>(responseRegistry, settings);

        if (res != null)
        {
            foreach (var smRef in res.ResultItem ?? [])
            {
                var submodelUrl =
                    aasInfrastructureSettings.SubmodelRepositoryUrl.AppendSlash()
                    + "submodels/"
                    + smRef.Keys[0].Value.ToBase64UrlEncoded(Encoding.UTF8);
                HttpResponseMessage submodelResponse = await client.GetAsync(
                    submodelUrl,
                    cancellationToken
                );

                if (!submodelResponse.IsSuccessStatusCode)
                {
                    _logger?.LogWarning(
                        "Request to {SubmodelUrl} failed with status code {StatusCode}",
                        submodelUrl,
                        submodelResponse.StatusCode
                    );
                }
                else
                {
                    var smResponseContent = await submodelResponse.Content.ReadAsStringAsync();

                    var node = JsonNode.Parse(smResponseContent);

                    if (node == null)
                    {
                        _logger?.LogWarning(
                            "Failed to parse submodel response from {SubmodelUrl}",
                            submodelUrl
                        );
                        continue;
                    }

                    var submodelRes = AasCore.Aas3_1.Jsonization.Deserialize.SubmodelFrom(node);
                    if (IsNameplate(submodelRes))
                        return submodelRes;
                }
            }
        }
        return null;
    }

    public static bool IsNameplate(Submodel submodel)
    {
        var nameplateSemanticIds = new List<string>
        {
            "https://admin-shell.io/idta/aas/DigitalNameplate/2/0",
            "https://admin-shell.io/idta/aas/DigitalNameplate/3/0",
            "https://admin-shell.io/zvei/nameplate/2/0/Nameplate",
        };

        if (submodel.SemanticId?.Keys.Any(k => nameplateSemanticIds.Contains(k.Value)) ?? false)
        {
            return true;
        }

        return false;
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
