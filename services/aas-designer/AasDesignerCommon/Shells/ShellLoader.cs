using System.Net;
using System.Text;
using System.Text.Json.Nodes;
using AasCore.Aas3_1;
using AasDesignerApi.Model;
using AasDesignerCommon.Model;
using AasDesignerCommon.Utils;
using AasDesignerModel.Model;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace AasDesignerCommon.Shells;

public class LoadShellResult
{
    public AasCore.Aas3_1.Environment? Environment { get; set; }
    public List<ConceptDescriptionMetadata> ConceptDescriptionMetadata { get; set; } = [];
    public EditorDescriptor EditorDescriptor { get; set; } = new();
}

public class EditorDescriptor
{
    public EditorDescriptorEntry AasDescriptorEntry { get; set; } = new EditorDescriptorEntry();
    public List<EditorDescriptorEntry> SubmodelDescriptorEntries { get; set; } = [];
}

public class EditorDescriptorEntry
{
    public string OldId { get; set; } = string.Empty;
    public string NewId { get; set; } = string.Empty;
    public string Endpoint { get; set; } = string.Empty;
    public string IdShort { get; set; } = string.Empty;
}

public static class ShellLoader
{
    public static async Task<LoadShellResult> LoadAsync(
        AasInfrastructureSettings aasInfrastructureSettings,
        string aasIdentifier,
        CancellationToken cancellationToken,
        AppUser appUser,
        HttpClient? client = null
    )
    {
        var result = new LoadShellResult();
        var disposeClient = client == null;
        client ??= HttpClientCreator.CreateHttpClient(appUser);

        try
        {
            // zunächst in aas-Registry die aas-url laden, falls das nicht klappt, direkten zugriff aufs repo versuchen
            var aasCandidateUrls = new List<string>();
            try
            {
                aasCandidateUrls = await GetAasCandidateUrls(
                    aasInfrastructureSettings,
                    aasIdentifier,
                    cancellationToken,
                    appUser,
                    client
                );
            }
            catch (Exception e)
            {
                Console.WriteLine(
                    $"Failed to resolve registry endpoint for AAS {aasIdentifier}: {e.Message}"
                );
            }

            var fallbackAasUrl = GetAasRepositoryUrl(aasInfrastructureSettings, aasIdentifier);
            var (aas, loadedAasUrl) = await LoadFromCandidateUrlsAsync(
                BuildCandidateUrls([.. aasCandidateUrls, fallbackAasUrl]),
                (candidateUrl, ct) => LoadShellFromUrlAsync(client, candidateUrl, ct),
                $"AAS {aasIdentifier}",
                cancellationToken
            );

            result.EditorDescriptor.AasDescriptorEntry.OldId = aasIdentifier;
            result.EditorDescriptor.AasDescriptorEntry.NewId = aasIdentifier;
            result.EditorDescriptor.AasDescriptorEntry.Endpoint = loadedAasUrl;
            result.EditorDescriptor.AasDescriptorEntry.IdShort = aas.IdShort ?? string.Empty;

            var environment = new AasCore.Aas3_1.Environment { AssetAdministrationShells = [aas] };

            // submodels ladem
            environment.Submodels = [];
            foreach (var smRef in aas.Submodels ?? [])
            {
                var smIdentifier = smRef.Keys[0].Value;
                var submodelCandidateUrls = new List<string>();
                try
                {
                    // Submodel-URLs aus Shell- und SM-Registry laden.
                    submodelCandidateUrls = await GetSmCandidateUrls(
                        aasInfrastructureSettings,
                        aasIdentifier,
                        smIdentifier,
                        cancellationToken,
                        appUser,
                        client
                    );
                }
                catch (Exception e)
                {
                    Console.WriteLine(
                        $"Failed to resolve registry endpoint for submodel {smIdentifier}: {e.Message}"
                    );
                }

                var smDescriptorEntry = new EditorDescriptorEntry();
                result.EditorDescriptor.SubmodelDescriptorEntries.Add(smDescriptorEntry);

                var fallbackSubmodelUrl = GetSubmodelRepositoryUrl(
                    aasInfrastructureSettings,
                    smIdentifier
                );

                try
                {
                    var (submodel, loadedSubmodelUrl) = await LoadFromCandidateUrlsAsync(
                        BuildCandidateUrls([.. submodelCandidateUrls, fallbackSubmodelUrl]),
                        (candidateUrl, ct) => LoadSubmodelFromUrlAsync(client, candidateUrl, ct),
                        $"submodel {smIdentifier}",
                        cancellationToken
                    );

                    environment.Submodels.Add(submodel);
                    smDescriptorEntry.OldId = submodel.Id;
                    smDescriptorEntry.NewId = submodel.Id;
                    smDescriptorEntry.IdShort = submodel.IdShort ?? string.Empty;
                    smDescriptorEntry.Endpoint = loadedSubmodelUrl;
                }
                catch (Exception e)
                {
                    // Referenz bleibt bewusst bestehen und wird im Frontend als "fehlendes Teilmodell" angezeigt.
                    smDescriptorEntry.OldId = smIdentifier;
                    Console.WriteLine(e);
                }
            }
            List<ConceptDescriptionMetadata> conceptDescriptionMetadata = [];

            if (aasInfrastructureSettings.ConceptDescriptionRepositoryUrl != null)
            {
                conceptDescriptionMetadata = CDsFromAasResolver.GetAllConceptDescriptions(
                    environment,
                    aasInfrastructureSettings.ConceptDescriptionRepositoryUrl.AppendSlash()
                );
                try
                {
                    conceptDescriptionMetadata.ForEach(cdDescriptor =>
                    {
                        var cd = CdLoader.GetCdFromDescriptor(
                            cdDescriptor,
                            aasInfrastructureSettings.ConceptDescriptionRepositoryUrl.AppendSlash(),
                            client
                        );
                        if (cd != null)
                        {
                            if (environment.ConceptDescriptions == null)
                                environment.ConceptDescriptions = [];
                            if (!environment.ConceptDescriptions.Any(c => cd.Id == c.Id))
                            {
                                environment.ConceptDescriptions.Add(cd);
                            }
                        }
                    });
                    environment.ConceptDescriptions = environment
                        .ConceptDescriptions?.OrderBy(cd => cd.IdShort)
                        .ToList();
                }
                catch (Exception e)
                {
                    // ignor
                    Console.WriteLine(e);
                }
            }

            AasDateTimeValueNormalizer.NormalizeEnvironment(environment);
            result.Environment = environment;
            result.ConceptDescriptionMetadata = conceptDescriptionMetadata;
            return result;
        }
        finally
        {
            if (disposeClient)
            {
                client.Dispose();
            }
        }
    }

    public static async Task<AssetAdministrationShell?> LoadShellOnly(
        AasInfrastructureSettings aasInfrastructureSettings,
        string aasIdentifier,
        CancellationToken cancellationToken,
        AppUser appUser,
        HttpClient? client = null
    )
    {
        var disposeClient = client == null;
        client ??= HttpClientCreator.CreateHttpClient(appUser);

        try
        {
            var candidateUrls = new List<string>();
            try
            {
                candidateUrls = await GetAasCandidateUrls(
                    aasInfrastructureSettings,
                    aasIdentifier,
                    cancellationToken,
                    appUser,
                    client
                );
            }
            catch (Exception e)
            {
                Console.WriteLine(
                    $"Failed to resolve registry endpoint for AAS {aasIdentifier}: {e.Message}"
                );
            }

            var fallbackUrl = GetAasRepositoryUrl(aasInfrastructureSettings, aasIdentifier);
            var (aas, _) = await LoadFromCandidateUrlsAsync(
                BuildCandidateUrls([.. candidateUrls, fallbackUrl]),
                (candidateUrl, ct) => LoadShellFromUrlAsync(client, candidateUrl, ct),
                $"AAS {aasIdentifier}",
                cancellationToken
            );

            return aas;
        }
        finally
        {
            if (disposeClient)
            {
                client.Dispose();
            }
        }
    }

    public static async Task<AssetInformation?> LoadAssetInformationOnly(
        AasInfrastructureSettings aasInfrastructureSettings,
        string aasIdentifier,
        CancellationToken cancellationToken,
        AppUser appUser,
        HttpClient? client = null
    )
    {
        var disposeClient = client == null;
        client ??= HttpClientCreator.CreateHttpClient(appUser);

        try
        {
            var candidateUrls = new List<string>();
            try
            {
                candidateUrls = (
                    await GetAasCandidateUrls(
                        aasInfrastructureSettings,
                        aasIdentifier,
                        cancellationToken,
                        appUser,
                        client
                    )
                )
                    .Select(candidateUrl => candidateUrl.AppendSlash() + "asset-information")
                    .ToList();
            }
            catch (Exception e)
            {
                Console.WriteLine(
                    $"Failed to resolve registry endpoint for AAS asset information {aasIdentifier}: {e.Message}"
                );
            }

            var fallbackUrl = GetAssetInformationRepositoryUrl(
                aasInfrastructureSettings,
                aasIdentifier
            );
            var (assetInformation, _) = await LoadFromCandidateUrlsAsync(
                BuildCandidateUrls([.. candidateUrls, fallbackUrl]),
                (candidateUrl, ct) => LoadAssetInformationFromUrlAsync(client, candidateUrl, ct),
                $"AAS asset information {aasIdentifier}",
                cancellationToken
            );

            return assetInformation;
        }
        finally
        {
            if (disposeClient)
            {
                client.Dispose();
            }
        }
    }

    public static async Task<bool> CheckIfExists(
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
            + aasIdentifier.ToBase64UrlEncoded(Encoding.UTF8);

        HttpResponseMessage response = await client.GetAsync(url, cancellationToken);
        if (response.StatusCode == HttpStatusCode.NotFound)
        {
            return false;
        }
        else if (response.IsSuccessStatusCode)
        {
            return true;
        }

        throw new Exception($"Request to {url} failed with status code {response.StatusCode}");
    }

    public static async Task<List<string>> GetAasCandidateUrls(
        AasInfrastructureSettings aasInfrastructureSettings,
        string aasIdentifier,
        CancellationToken cancellationToken,
        AppUser appUser,
        HttpClient? client = null
    )
    {
        var disposeClient = client == null;
        client ??= HttpClientCreator.CreateHttpClient(appUser);

        try
        {
            if (string.IsNullOrWhiteSpace(aasInfrastructureSettings.AasRegistryUrl))
            {
                return [];
            }

            var url =
                aasInfrastructureSettings.AasRegistryUrl.AppendSlash()
                + "shell-descriptors/"
                + aasIdentifier.ToBase64UrlEncoded(Encoding.UTF8);

            HttpResponseMessage response = await client.GetAsync(url, cancellationToken);

            var responseBody = await response.Content.ReadAsStringAsync();
            if (response.IsSuccessStatusCode && !responseBody.StartsWith("<"))
            {
                JObject? res = JsonConvert.DeserializeObject<JObject>(responseBody);
                if (res == null)
                {
                    return [];
                }

                return ExtractEndpointUrls(
                    res.Value<JArray>("endpoints") ?? [],
                    aasInfrastructureSettings
                );
            }

            if (response.StatusCode == HttpStatusCode.NotFound || responseBody.StartsWith("<"))
            {
                return [];
            }

            throw new Exception($"Request to {url} failed with status code {response.StatusCode}");
        }
        finally
        {
            if (disposeClient)
            {
                client.Dispose();
            }
        }
    }

    public static async Task<string> GetAasUrl(
        AasInfrastructureSettings aasInfrastructureSettings,
        string aasIdentifier,
        CancellationToken cancellationToken,
        AppUser appUser,
        HttpClient? client = null
    )
    {
        var candidateUrls = await GetAasCandidateUrls(
            aasInfrastructureSettings,
            aasIdentifier,
            cancellationToken,
            appUser,
            client
        );

        return BuildCandidateUrls([
                .. candidateUrls,
                GetAasRepositoryUrl(aasInfrastructureSettings, aasIdentifier),
            ])
            .First();
    }

    public static async Task<List<string>> GetSmCandidateUrls(
        AasInfrastructureSettings aasInfrastructureSettings,
        string aasIdentifier,
        string smIdentifier,
        CancellationToken cancellationToken,
        AppUser appUser,
        HttpClient? client = null
    )
    {
        var result = new List<string>();
        var disposeClient = client == null;
        client ??= HttpClientCreator.CreateHttpClient(appUser);

        try
        {
            if (!string.IsNullOrWhiteSpace(aasInfrastructureSettings.AasRegistryUrl))
            {
                var url =
                    aasInfrastructureSettings.AasRegistryUrl.AppendSlash()
                    + "shell-descriptors/"
                    + aasIdentifier.ToBase64UrlEncoded(Encoding.UTF8);

                HttpResponseMessage response = await client.GetAsync(url, cancellationToken);

                var responseBody = await response.Content.ReadAsStringAsync();
                if (response.IsSuccessStatusCode && !responseBody.StartsWith("<"))
                {
                    JObject? res = JsonConvert.DeserializeObject<JObject>(responseBody);

                    if (res != null)
                    {
                        var smDescriptors = res.Value<JArray>("submodelDescriptors") ?? [];
                        foreach (var smDescriptor in smDescriptors)
                        {
                            var smId = smDescriptor.Value<string>("id") ?? string.Empty;
                            if (smId == smIdentifier)
                            {
                                result.AddRange(
                                    ExtractEndpointUrls(
                                        smDescriptor.Value<JArray>("endpoints") ?? [],
                                        aasInfrastructureSettings
                                    )
                                );
                            }
                        }
                    }
                }
            }

            if (!string.IsNullOrWhiteSpace(aasInfrastructureSettings.SubmodelRegistryUrl))
            {
                var url =
                    aasInfrastructureSettings.SubmodelRegistryUrl.AppendSlash()
                    + "submodel-descriptors/"
                    + smIdentifier.ToBase64UrlEncoded(Encoding.UTF8);

                HttpResponseMessage response = await client.GetAsync(url, cancellationToken);

                var responseBody = await response.Content.ReadAsStringAsync();
                if (response.IsSuccessStatusCode && !responseBody.StartsWith("<"))
                {
                    JObject? res = JsonConvert.DeserializeObject<JObject>(responseBody);
                    if (res != null)
                    {
                        result.AddRange(
                            ExtractEndpointUrls(
                                res.Value<JArray>("endpoints") ?? [],
                                aasInfrastructureSettings
                            )
                        );
                    }
                }
                else if (
                    response.StatusCode != HttpStatusCode.NotFound
                    && !responseBody.StartsWith("<")
                )
                {
                    throw new Exception(
                        $"Request to {url} failed with status code {response.StatusCode}"
                    );
                }
            }

            return BuildCandidateUrls(result);
        }
        finally
        {
            if (disposeClient)
            {
                client.Dispose();
            }
        }
    }

    public static async Task<string> GetSmUrl(
        AasInfrastructureSettings aasInfrastructureSettings,
        string aasIdentifier,
        string smIdentifier,
        CancellationToken cancellationToken,
        AppUser appUser,
        HttpClient? client = null
    )
    {
        var candidateUrls = await GetSmCandidateUrls(
            aasInfrastructureSettings,
            aasIdentifier,
            smIdentifier,
            cancellationToken,
            appUser,
            client
        );

        return BuildCandidateUrls([
                .. candidateUrls,
                GetSubmodelRepositoryUrl(aasInfrastructureSettings, smIdentifier),
            ])
            .First();
    }

    private static List<string> BuildCandidateUrls(IEnumerable<string> candidateUrls)
    {
        return candidateUrls
            .Where(url => !string.IsNullOrWhiteSpace(url))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();
    }

    private static string GetAasRepositoryUrl(
        AasInfrastructureSettings aasInfrastructureSettings,
        string aasIdentifier
    )
    {
        return (
            aasInfrastructureSettings.AasRepositoryUrl.AppendSlash()
            + "shells/"
            + aasIdentifier.ToBase64UrlEncoded(Encoding.UTF8)
        )
            .Replace("//", "/")
            .Replace(":/", "://");
    }

    private static string GetAssetInformationRepositoryUrl(
        AasInfrastructureSettings aasInfrastructureSettings,
        string aasIdentifier
    )
    {
        return GetAasRepositoryUrl(aasInfrastructureSettings, aasIdentifier).AppendSlash()
            + "asset-information";
    }

    private static string GetSubmodelRepositoryUrl(
        AasInfrastructureSettings aasInfrastructureSettings,
        string smIdentifier
    )
    {
        return (
            aasInfrastructureSettings.SubmodelRepositoryUrl.AppendSlash()
            + "submodels/"
            + smIdentifier.ToBase64UrlEncoded(Encoding.UTF8)
        )
            .Replace("//", "/")
            .Replace(":/", "://");
    }

    public static async Task<(T Result, string Url)> LoadFromCandidateUrlsAsync<T>(
        IReadOnlyList<string> candidateUrls,
        Func<string, CancellationToken, Task<T>> loadFromUrlAsync,
        string subject,
        CancellationToken cancellationToken
    )
    {
        if (candidateUrls.Count == 0)
        {
            throw new Exception($"No candidate URLs available for {subject}.");
        }

        var failures = new List<string>();

        foreach (var candidateUrl in candidateUrls)
        {
            try
            {
                var result = await loadFromUrlAsync(candidateUrl, cancellationToken);
                return (result, candidateUrl);
            }
            catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
            {
                var message = $"Loading {subject} from {candidateUrl} timed out.";
                failures.Add(message);
                Console.WriteLine(message);
            }
            catch (Exception e)
            {
                var message = $"Loading {subject} from {candidateUrl} failed: {e.Message}";
                failures.Add(message);
                Console.WriteLine(message);
            }
        }

        throw new Exception($"Failed to load {subject}. {string.Join(" | ", failures)}");
    }

    private static List<string> ExtractEndpointUrls(
        JArray endpoints,
        AasInfrastructureSettings aasInfrastructureSettings
    )
    {
        return endpoints
            .Select(endpoint => endpoint.Value<JObject>("protocolInformation"))
            .Select(protocolInformation => protocolInformation?.Value<string>("href"))
            .Where(href => !string.IsNullOrWhiteSpace(href))
            .Select(href => NormalizeResolvedEndpointUrl(href!, aasInfrastructureSettings))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();
    }

    private static string NormalizeResolvedEndpointUrl(
        string url,
        AasInfrastructureSettings aasInfrastructureSettings
    )
    {
        return url.Replace(
                "/aas-proxy/aas-repo",
                "/aas-proxy/" + aasInfrastructureSettings.Id + "/aas-repo"
            )
            .Replace("//", "/")
            .Replace(":/", "://");
    }

    private static async Task<AssetAdministrationShell> LoadShellFromUrlAsync(
        HttpClient client,
        string url,
        CancellationToken cancellationToken
    )
    {
        HttpResponseMessage response = await client.GetAsync(url, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            throw new Exception($"Request to {url} failed with status code {response.StatusCode}");
        }

        var responseBody = await response.Content.ReadAsStringAsync();
        var jsonNode = AasJsonNodeParser.Parse(responseBody);
        return Jsonization.Deserialize.AssetAdministrationShellFrom(jsonNode);
    }

    private static async Task<AssetInformation> LoadAssetInformationFromUrlAsync(
        HttpClient client,
        string url,
        CancellationToken cancellationToken
    )
    {
        HttpResponseMessage response = await client.GetAsync(url, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            throw new Exception($"Request to {url} failed with status code {response.StatusCode}");
        }

        var responseBody = await response.Content.ReadAsStringAsync();
        var jsonNode = AasJsonNodeParser.Parse(responseBody);
        return Jsonization.Deserialize.AssetInformationFrom(jsonNode);
    }

    private static async Task<Submodel> LoadSubmodelFromUrlAsync(
        HttpClient client,
        string url,
        CancellationToken cancellationToken
    )
    {
        HttpResponseMessage response = await client.GetAsync(url, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            throw new Exception($"Request to {url} failed with status code {response.StatusCode}");
        }

        var responseBody = await response.Content.ReadAsStringAsync();
        responseBody = EmbeddedDataspecFixUtil.FixEmbeddedDataspec(responseBody);

        var jsonNode = AasJsonNodeParser.Parse(responseBody);
        var submodel = Jsonization.Deserialize.SubmodelFrom(jsonNode);
        AasDateTimeValueNormalizer.NormalizeSubmodel(submodel);
        return submodel;
    }
}
