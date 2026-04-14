using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json.Nodes;
using System.Threading.Tasks;
using AasCore.Aas3_1;
using AasDesignerApi.Model;
using AasDesignerCommon.Lookup;
using AasDesignerCommon.Model;
using AasDesignerCommon.Registry;
using AasDesignerCommon.Serialization;
using AasDesignerCommon.Submodels;
using AasDesignerCommon.Utils;
using AasDesignerModel;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using static AasCore.Aas3_1.Jsonization;

namespace AasDesignerCommon.Shells;

public class SaveShellInInfrastructure
{
    public static async Task<SaveShellResult> SaveSingle(
        string plainJson,
        AppUser appUser,
        Organisation orga,
        string baseUrl,
        List<ProvidedFile> providedFileStreams,
        IApplicationDbContext context,
        CancellationToken cancellationToken,
        List<string>? excludedSubmodelIds = null
    )
    {
        var result = new SaveShellResult();

        var jsonNode =
            JsonNode.Parse(plainJson) ?? throw new System.Exception("Could not parse JSON");
        AasCore.Aas3_1.Environment? environment = null;
        // De-serialize from the JSON node
        environment = Deserialize.EnvironmentFrom(jsonNode);
        ExcludeSubmodelsFromEnvironment(environment, excludedSubmodelIds);

        using var client = HttpClientCreator.CreateHttpClient(appUser);

        var aasId = string.Empty;

        var changelogToAddList = new Dictionary<IAssetAdministrationShell, Submodel>();
        environment.AssetAdministrationShells?.ForEach(aas =>
        {
            var sm = AasDesignerChangelogCreator.GetIfNotContained(aas, environment, appUser, orga);
            if (sm != null)
            {
                changelogToAddList.Add(aas, sm);
            }
        });

        foreach (var changelogEntry in changelogToAddList)
        {
            if (changelogEntry.Value != null)
            {
                AasDesignerChangelogCreator.AddSubmodel(
                    environment,
                    changelogEntry.Value,
                    changelogEntry.Key
                );
            }
        }

        ImportFilePathsFixer.FixFilePaths(environment);

        foreach (var aas in environment.AssetAdministrationShells ?? [])
        {
            if (aasId == string.Empty)
            {
                aasId = aas.Id;
            }
            var editorDescriptor = new EditorDescriptor()
            {
                AasDescriptorEntry = new EditorDescriptorEntry()
                {
                    Endpoint = DescriptorEndpointResolver.ResolveAasDescriptorEndpoint(
                        appUser.CurrentInfrastructureSettings,
                        baseUrl,
                        aas.Id
                    ),
                    NewId = aas.Id,
                    OldId = aas.Id,
                    IdShort = aas.IdShort ?? "",
                },
            };
            var url =
                appUser.CurrentInfrastructureSettings.AasRepositoryUrl.AppendSlash() + "shells";

            var aasJsonString = BasyxSerializer.Serialize(aas);
            var response = await SendShellWithRoleFallbackAsync(
                client,
                HttpMethod.Post,
                url,
                aasJsonString,
                cancellationToken
            );
            var content = await response.Content.ReadAsStringAsync();
            response.EnsureSuccessStatusCode();

            try
            {
                var submodelFailures = new List<SubmodelImportException>();

                foreach (var smRef in aas.Submodels ?? [])
                {
                    var id = smRef.Keys.FirstOrDefault()?.Value ?? string.Empty;

                    var sm = GetSubmodelFromEnv(environment, id);
                    if (sm == null)
                        continue;

                    var smUrl =
                        appUser.CurrentInfrastructureSettings.SubmodelRepositoryUrl.AppendSlash()
                        + "submodels/"
                        + id.ToBase64UrlEncoded(Encoding.UTF8);
                    var smJsonString = BasyxSerializer.Serialize(sm);
                    try
                    {
                        await SaveSubmodelAsync(
                            client,
                            appUser.CurrentInfrastructureSettings.SubmodelRepositoryUrl,
                            aas.Id,
                            id,
                            sm.IdShort ?? string.Empty,
                            smJsonString,
                            cancellationToken
                        );
                        var smDescriptorEntry = new EditorDescriptorEntry()
                        {
                            Endpoint = DescriptorEndpointResolver.ResolveSubmodelDescriptorEndpoint(
                                appUser.CurrentInfrastructureSettings,
                                baseUrl,
                                sm.Id
                            ),
                            NewId = sm.Id,
                            OldId = id,
                            IdShort = sm.IdShort ?? "",
                        };
                        editorDescriptor.SubmodelDescriptorEntries.Add(smDescriptorEntry);
                    }
                    catch (SubmodelImportException e)
                    {
                        submodelFailures.Add(e);
                    }
                }

                if (submodelFailures.Count > 0)
                {
                    throw new SubmodelImportBatchException(submodelFailures);
                }

                await DiscoveryUpdater.UpdateDiscoveryAsync(
                    appUser.CurrentInfrastructureSettings.AasDiscoveryUrl,
                    (AssetAdministrationShell)aas,
                    cancellationToken,
                    client
                );
                await RegistryUpdater.UpdateRegistryAsync(
                    appUser.CurrentInfrastructureSettings,
                    environment,
                    cancellationToken,
                    client,
                    editorDescriptor
                );
                LookupUpdater.UpdateLookupAsync(appUser, environment, context);
                await AasxServerFixer.FixAasxServerSubmodelReferences(
                    appUser,
                    aas,
                    environment,
                    context,
                    cancellationToken
                );
            }
            catch
            {
                await ShellDeleter.DeleteShell(
                    editorDescriptor,
                    appUser.CurrentInfrastructureSettings,
                    cancellationToken,
                    client
                );
                throw;
            }
        }

        var aasFiles = FilesFromAasResolver.GetAllAasFiles(
            environment,
            appUser.CurrentInfrastructureSettings.SubmodelRepositoryUrl.AppendSlash(),
            appUser.CurrentInfrastructureSettings.AasRepositoryUrl.AppendSlash()
        );

        if (providedFileStreams != null)
        {
            foreach (var providedFile in providedFileStreams)
            {
                var fileBytes = await ReadProvidedFileBytesAsync(providedFile, cancellationToken);
                if (fileBytes == null)
                {
                    continue;
                }

                // do something with the file
                // datei in der aasFiles-Liste finden und an den endpunkt schicken
                var aasFilesMatched = aasFiles
                    .Where(f => f.Filename.EndsWith(providedFile.Filename))
                    .ToList();

                foreach (var aasFile in aasFilesMatched)
                {
                    if (aasFile == null || environment.AssetAdministrationShells == null)
                        continue;
                    // datei zum endpunkt schicken

                    if (aasFile.IsThumbnail)
                    {
                        var thumbUrl =
                            appUser.CurrentInfrastructureSettings.AasRepositoryUrl.AppendSlash()
                            + "shells/"
                            + environment
                                .AssetAdministrationShells[0]
                                .Id.ToBase64UrlEncoded(Encoding.UTF8)
                                .AppendSlash()
                            + "asset-information/thumbnail?fileName="
                            + providedFile.Filename;
                        using var httpRequestThumb = new HttpRequestMessage(
                            HttpMethod.Put,
                            thumbUrl
                        );
                        var contentType = !string.IsNullOrEmpty(aasFile.ContentType)
                            ? aasFile.ContentType
                            : "application/octet-stream";
                        using var thumbContent = CreateMultipartFileContent(
                            fileBytes,
                            providedFile.Filename,
                            contentType
                        );

                        httpRequestThumb.Content = thumbContent;

                        var thumbResponse = await client.SendAsync(httpRequestThumb);
                        Console.WriteLine("ThumbResponse: " + thumbResponse.StatusCode);
                    }
                    else
                    {
                        var fileUrl =
                            aasFile.Endpoint + "?fileName=" + providedFile.Filename.ToUrlEncoded();
                        using var httpRequest = new HttpRequestMessage(HttpMethod.Put, fileUrl);
                        var contentType = !string.IsNullOrEmpty(aasFile.ContentType)
                            ? aasFile.ContentType
                            : "application/octet-stream";

                        using var content = CreateMultipartFileContent(
                            fileBytes,
                            providedFile.Filename,
                            contentType
                        );

                        httpRequest.Content = content;

                        var fileResponse = await client.SendAsync(httpRequest);
                        if (!fileResponse.IsSuccessStatusCode)
                        {
                            // throw new Exception($"Request to {fileUrl} failed with status code {fileResponse.StatusCode}");
                            Console.WriteLine("Error saving file: " + fileResponse.StatusCode);
                        }
                        else
                        {
                            // versuchen den neuen Namen zu bekommen!
                            var fileUrlLoad = aasFile.Endpoint.Replace("/attachment", "/$value");
                            var fileResponseLoad = await client.GetAsync(
                                fileUrlLoad,
                                cancellationToken
                            );
                            var contLoad = fileResponseLoad.Content.ReadAsStringAsync(
                                cancellationToken
                            );

                            var contJson = JsonConvert.DeserializeObject<JObject>(contLoad.Result);
                            var filenameNew =
                                contJson?["value"]?.ToString() ?? providedFile.Filename;

                            // Liste bauen mit alt/neu
                            if (!result.OldNewFileNames.ContainsKey(providedFile.Filename))
                            {
                                result.OldNewFileNames.Add(providedFile.Filename, filenameNew);
                            }
                        }
                    }
                }
            }
        }

        foreach (var cd in environment.ConceptDescriptions ?? [])
        {
            var cdUrl =
                appUser.CurrentInfrastructureSettings.ConceptDescriptionRepositoryUrl.AppendSlash()
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
                    appUser.CurrentInfrastructureSettings.ConceptDescriptionRepositoryUrl.AppendSlash()
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
        result.AasId = aasId;
        result.Environment = environment;
        return result;
    }

    public static async Task<SaveShellResult> UpdateSingle(
        string plainJson,
        AppUser appUser,
        Organisation orga,
        List<ProvidedFile> providedFileStreams,
        CancellationToken cancellationToken,
        EditorDescriptor editorDescriptor,
        IApplicationDbContext context,
        bool createChangelogEntry = true,
        string action = "Update",
        List<string>? deletedSubmodels = null
    )
    {
        var jsonNode =
            JsonNode.Parse(plainJson) ?? throw new System.Exception("Could not parse JSON");
        // De-serialize from the JSON node
        AasCore.Aas3_1.Environment? environment = Deserialize.EnvironmentFrom(jsonNode);

        return await UpdateSingle(
            environment,
            appUser,
            orga,
            providedFileStreams,
            cancellationToken,
            editorDescriptor,
            context,
            createChangelogEntry,
            action,
            deletedSubmodels
        );
    }

    public static async Task<SaveShellResult> UpdateSingle(
        AasCore.Aas3_1.Environment environment,
        AppUser appUser,
        Organisation orga,
        List<ProvidedFile> providedFileStreams,
        CancellationToken cancellationToken,
        EditorDescriptor editorDescriptor,
        IApplicationDbContext context,
        bool CreateChangelogEntry = true,
        string action = "Update",
        List<string>? deletedSubmodels = null
    )
    {
        var result = new SaveShellResult();
        var hasProvidedThumbnail = providedFileStreams.Any(file =>
            file.Type == ProvidedFileType.Thumbnail
        );
        var preservedThumbnails = new List<PreservedThumbnailUpload>();

        using var client = HttpClientCreator.CreateHttpClient(appUser);
        var aasId = string.Empty;

        // Changelog Submodell hinzufügen, falls erforderlich und Changelog soll geschrieben werden
        if (CreateChangelogEntry)
        {
            var smListToAdd = new Dictionary<IAssetAdministrationShell, Submodel>();
            environment.AssetAdministrationShells?.ForEach(aas =>
            {
                var sm = AasDesignerChangelogCreator.GetIfNotContained(
                    aas,
                    environment,
                    appUser,
                    orga
                );
                if (sm != null)
                {
                    smListToAdd.Add(aas, sm);
                }
            });

            foreach (var sm in smListToAdd)
            {
                if (sm.Value != null)
                {
                    AasDesignerChangelogCreator.AddSubmodel(environment, sm.Value, sm.Key);
                }
            }
        }

        foreach (var aas in environment.AssetAdministrationShells ?? [])
        {
            if (aasId == string.Empty)
            {
                aasId = aas.Id;
            }

            if (CreateChangelogEntry)
            {
                AasDesignerChangelogCreator.UpdateChangelog(
                    aas,
                    environment,
                    appUser,
                    orga,
                    action
                );
            }

            var url =
                appUser.CurrentInfrastructureSettings.AasRepositoryUrl.AppendSlash()
                + "shells/"
                + aas.Id.ToBase64UrlEncoded(Encoding.UTF8);
            var existingAasResponse = await client.GetAsync(url, cancellationToken);

            if (!existingAasResponse.IsSuccessStatusCode)
            {
                throw new System.Exception(
                    $"Request to {url} failed with status code {existingAasResponse.StatusCode}"
                );
            }

            var responseRegistry = await existingAasResponse.Content.ReadAsStringAsync();

            JObject? res = JsonConvert.DeserializeObject<JObject>(responseRegistry);

            AssetAdministrationShell? existingAas = null;
            if (res != null)
            {
                var jsonNode = JsonNode.Parse(res.ToString());
                if (jsonNode == null)
                    throw new System.Exception("Could not parse JSON");

                existingAas = Deserialize.AssetAdministrationShellFrom(jsonNode);
            }

            if (!hasProvidedThumbnail)
            {
                var preservedThumbnail = await TryCreatePreservedThumbnailUploadAsync(
                    client,
                    appUser.CurrentInfrastructureSettings.AasRepositoryUrl,
                    aas.Id,
                    existingAas?.AssetInformation?.DefaultThumbnail?.Path,
                    aas.AssetInformation?.DefaultThumbnail?.Path,
                    aas.AssetInformation?.DefaultThumbnail?.ContentType
                        ?? existingAas?.AssetInformation?.DefaultThumbnail?.ContentType,
                    cancellationToken
                );

                if (preservedThumbnail != null)
                {
                    preservedThumbnails.Add(preservedThumbnail);
                }
            }

            var aasJsonString = BasyxSerializer.Serialize(aas);
            var response = await SendShellWithRoleFallbackAsync(
                client,
                HttpMethod.Put,
                url,
                aasJsonString,
                cancellationToken
            );
            var content = await response.Content.ReadAsStringAsync();
            response.EnsureSuccessStatusCode();

            foreach (var smRef in aas.Submodels ?? [])
            {
                var id = smRef.Keys.FirstOrDefault()?.Value ?? string.Empty;

                var sm = GetSubmodelFromEnv(environment, id);

                var smUrl =
                    appUser.CurrentInfrastructureSettings.SubmodelRepositoryUrl.AppendSlash()
                    + "submodels/"
                    + id.ToBase64UrlEncoded(Encoding.UTF8);
                if (sm == null)
                {
                    continue;
                }

                var smJsonString = BasyxSerializer.Serialize(sm);
                await SaveSubmodelAsync(
                    client,
                    appUser.CurrentInfrastructureSettings.SubmodelRepositoryUrl,
                    aas.Id,
                    id,
                    sm.IdShort ?? string.Empty,
                    smJsonString,
                    cancellationToken
                );
            }

            foreach (var smRef in existingAas?.Submodels ?? [])
            {
                var id = smRef.Keys.FirstOrDefault()?.Value ?? string.Empty;
                if (
                    !HasSubmodelReference(aas, id)
                    && deletedSubmodels != null
                    && !deletedSubmodels.Contains(id)
                )
                {
                    // Wenn explizites Löschen angegeben, dann Löschen, sonst stehenlassen!
                    var smUrl =
                        appUser.CurrentInfrastructureSettings.SubmodelRepositoryUrl.AppendSlash()
                        + "submodels/"
                        + id.ToBase64UrlEncoded(Encoding.UTF8);
                    var smResponse = await client.DeleteAsync(smUrl, cancellationToken);
                    if (!smResponse.IsSuccessStatusCode)
                    {
                        // throw new Exception($"Request to {smUrl} failed with status code {smResponse.StatusCode}");
                        Console.WriteLine("Error deleting submodel: " + smResponse.StatusCode);
                    }
                    Console.WriteLine(
                        "Submodel "
                            + id
                            + " is not referenced anymore. Keeping it in the repository."
                    );
                }
            }

            await DiscoveryUpdater.UpdateDiscoveryAsync(
                appUser.CurrentInfrastructureSettings.AasDiscoveryUrl,
                (AssetAdministrationShell)aas,
                cancellationToken,
                client
            );
            await RegistryUpdater.UpdateRegistryAsync(
                appUser.CurrentInfrastructureSettings,
                environment,
                cancellationToken,
                client,
                editorDescriptor
            );

            await AasxServerFixer.FixAasxServerSubmodelReferences(
                appUser,
                aas,
                environment,
                context,
                cancellationToken
            );
            LookupUpdater.UpdateLookupAsync(appUser, environment, context);
        }

        var aasFiles = FilesFromAasResolver.GetAllAasFiles(
            environment,
            appUser.CurrentInfrastructureSettings.SubmodelRepositoryUrl.AppendSlash(),
            appUser.CurrentInfrastructureSettings.AasRepositoryUrl.AppendSlash()
        );

        if (providedFileStreams != null)
        {
            foreach (
                var providedFile in providedFileStreams.Where(f =>
                    f.Type != ProvidedFileType.Deleted
                )
            )
            {
                var fileBytes = await ReadProvidedFileBytesAsync(providedFile, cancellationToken);
                if (fileBytes == null)
                {
                    continue;
                }

                if (providedFile.Type == ProvidedFileType.Thumbnail)
                {
                    var shellId = environment.AssetAdministrationShells?.FirstOrDefault()?.Id;
                    if (string.IsNullOrWhiteSpace(shellId))
                    {
                        continue;
                    }

                    await UploadThumbnailAsync(
                        client,
                        appUser.CurrentInfrastructureSettings.AasRepositoryUrl,
                        shellId,
                        fileBytes,
                        providedFile.Filename,
                        providedFile.ContentType,
                        cancellationToken
                    );

                    await TryAddPersistedThumbnailRenameAsync(
                        result,
                        client,
                        appUser.CurrentInfrastructureSettings.AasRepositoryUrl,
                        shellId,
                        providedFile.Filename,
                        cancellationToken
                    );
                }
                else
                {
                    // do something with the file
                    // datei in der aasFiles-Liste finden und an den endpunkt schicken
                    var aasFilesMatched = aasFiles
                        .Where(f => f.Filename.EndsWith(providedFile.Filename))
                        .ToList();

                    foreach (var aasFile in aasFilesMatched)
                    {
                        try
                        {
                            if (aasFile == null || environment.AssetAdministrationShells == null)
                                continue;
                            // datei zum endpunkt schicken

                            var fileUrl = aasFile.Endpoint + "?fileName=" + providedFile.Filename;
                            using var httpRequest = new HttpRequestMessage(HttpMethod.Put, fileUrl);
                            using var content = CreateMultipartFileContent(
                                fileBytes,
                                providedFile.Filename,
                                providedFile.ContentType
                            );

                            httpRequest.Content = content;

                            var fileResponse = await client.SendAsync(httpRequest);
                            if (!fileResponse.IsSuccessStatusCode)
                            {
                                // throw new Exception($"Request to {fileUrl} failed with status code {fileResponse.StatusCode}");
                                Console.WriteLine("Error saving file: " + fileResponse.StatusCode);
                            }
                            else
                            {
                                // versuchen den neuen Namen zu bekommen!
                                var fileUrlLoad = aasFile.Endpoint.Replace(
                                    "/attachment",
                                    "/$value"
                                );
                                var fileResponseLoad = await client.GetAsync(
                                    fileUrlLoad,
                                    cancellationToken
                                );
                                var contLoad = fileResponseLoad.Content.ReadAsStringAsync(
                                    cancellationToken
                                );

                                var contJson = JsonConvert.DeserializeObject<JObject>(
                                    contLoad.Result
                                );
                                var filenameNew =
                                    contJson?["value"]?.ToString() ?? providedFile.Filename;

                                // Liste bauen mit alt/neu
                                result.OldNewFileNames.Add(providedFile.Filename, filenameNew);
                            }
                        }
                        catch (System.Exception ex)
                        {
                            Console.WriteLine("Error saving file: " + ex.Message);
                        }
                    }
                }
            }
        }

        if (!hasProvidedThumbnail)
        {
            foreach (var preservedThumbnail in preservedThumbnails)
            {
                await UploadThumbnailAsync(
                    client,
                    appUser.CurrentInfrastructureSettings.AasRepositoryUrl,
                    preservedThumbnail.ShellId,
                    preservedThumbnail.FileBytes,
                    preservedThumbnail.TargetFilename,
                    preservedThumbnail.ContentType,
                    cancellationToken
                );

                await TryAddPersistedThumbnailRenameAsync(
                    result,
                    client,
                    appUser.CurrentInfrastructureSettings.AasRepositoryUrl,
                    preservedThumbnail.ShellId,
                    preservedThumbnail.TargetFilename,
                    cancellationToken
                );
            }
        }

        foreach (var cd in environment.ConceptDescriptions ?? [])
        {
            var cdUrl =
                appUser.CurrentInfrastructureSettings.ConceptDescriptionRepositoryUrl.AppendSlash()
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
                    appUser.CurrentInfrastructureSettings.ConceptDescriptionRepositoryUrl.AppendSlash()
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
        result.AasId = aasId;

        return result;
    }

    private static bool HasSubmodelReference(IAssetAdministrationShell aas, string id)
    {
        return aas.Submodels?.Any(sm => sm.Keys.FirstOrDefault()?.Value == id) ?? false;
    }

    private static async Task<HttpResponseMessage> SendShellWithRoleFallbackAsync(
        HttpClient client,
        HttpMethod method,
        string url,
        string payload,
        CancellationToken cancellationToken
    )
    {
        var response = await SendShellRequestAsync(client, method, url, payload, cancellationToken);

        if (
            response.StatusCode == HttpStatusCode.BadRequest
            && payload.Contains("\"assetKind\":\"Role\"", StringComparison.Ordinal)
        )
        {
            var fallbackPayload = ReplaceRoleAssetKindWithNotApplicable(payload);
            if (!string.Equals(payload, fallbackPayload, StringComparison.Ordinal))
            {
                response.Dispose();
                Console.WriteLine(
                    "AAS repository rejected assetKind 'Role'. Retrying save with 'NotApplicable' for compatibility."
                );
                response = await SendShellRequestAsync(
                    client,
                    method,
                    url,
                    fallbackPayload,
                    cancellationToken
                );
            }
        }

        return response;
    }

    private static async Task<HttpResponseMessage> SendShellRequestAsync(
        HttpClient client,
        HttpMethod method,
        string url,
        string payload,
        CancellationToken cancellationToken
    )
    {
        using var request = new HttpRequestMessage(method, url)
        {
            Content = new StringContent(payload, Encoding.UTF8, "application/json"),
        };
        return await client.SendAsync(request, cancellationToken);
    }

    private static string ReplaceRoleAssetKindWithNotApplicable(string payload)
    {
        var root = JsonNode.Parse(payload);
        if (root == null)
            return payload;

        ReplaceRoleAssetKindNode(root);
        return root.ToJsonString();
    }

    private static async Task SaveSubmodelAsync(
        HttpClient client,
        string submodelRepositoryUrl,
        string aasId,
        string submodelId,
        string idShort,
        string submodelPayload,
        CancellationToken cancellationToken
    )
    {
        var putUrl =
            submodelRepositoryUrl.AppendSlash()
            + "submodels/"
            + submodelId.ToBase64UrlEncoded(Encoding.UTF8);

        using var putResponse = await client.PutAsync(
            putUrl,
            new StringContent(submodelPayload, Encoding.UTF8, "application/json"),
            cancellationToken
        );

        if (putResponse.IsSuccessStatusCode)
        {
            return;
        }

        if (putResponse.StatusCode != HttpStatusCode.NotFound)
        {
            var putContent = await putResponse.Content.ReadAsStringAsync(cancellationToken);
            throw new SubmodelImportException(
                submodelId,
                idShort,
                putResponse.StatusCode,
                $"Saving submodel '{submodelId}' failed via PUT {putUrl}: {(int)putResponse.StatusCode} {putResponse.StatusCode}. {putContent}"
            );
        }

        var postUrl = submodelRepositoryUrl.AppendSlash() + "submodels";
        using var postResponse = await client.PostAsync(
            postUrl,
            new StringContent(submodelPayload, Encoding.UTF8, "application/json"),
            cancellationToken
        );

        if (postResponse.IsSuccessStatusCode)
        {
            return;
        }

        var postContent = await postResponse.Content.ReadAsStringAsync(cancellationToken);
        throw new SubmodelImportException(
            submodelId,
            idShort,
            postResponse.StatusCode,
            $"Saving submodel '{submodelId}' failed via POST {postUrl} after PUT-miss for AAS '{aasId}': {(int)postResponse.StatusCode} {postResponse.StatusCode}. {postContent}"
        );
    }

    private static MultipartFormDataContent CreateMultipartFileContent(
        byte[] fileBytes,
        string filename,
        string? contentType
    )
    {
        var fileContent = new ByteArrayContent(fileBytes);
        fileContent.Headers.ContentType = new MediaTypeHeaderValue(
            !string.IsNullOrWhiteSpace(contentType) ? contentType : "application/octet-stream"
        );

        var content = new MultipartFormDataContent();
        content.Add(fileContent, "file", filename);

        return content;
    }

    private static async Task<PreservedThumbnailUpload?> TryCreatePreservedThumbnailUploadAsync(
        HttpClient client,
        string aasRepositoryUrl,
        string shellId,
        string? existingThumbnailPath,
        string? targetThumbnailPath,
        string? contentType,
        CancellationToken cancellationToken
    )
    {
        if (string.IsNullOrWhiteSpace(existingThumbnailPath))
        {
            return null;
        }

        if (string.IsNullOrWhiteSpace(targetThumbnailPath))
        {
            return null;
        }

        var existingThumbnailBytes = await TryReadThumbnailBytesAsync(
            client,
            aasRepositoryUrl,
            shellId,
            Path.GetFileName(existingThumbnailPath),
            cancellationToken
        );

        if (existingThumbnailBytes == null || existingThumbnailBytes.Length == 0)
        {
            return null;
        }

        return new PreservedThumbnailUpload(
            shellId,
            existingThumbnailBytes,
            Path.GetFileName(targetThumbnailPath),
            contentType
        );
    }

    private static async Task<byte[]?> TryReadThumbnailBytesAsync(
        HttpClient client,
        string aasRepositoryUrl,
        string shellId,
        string? filename,
        CancellationToken cancellationToken
    )
    {
        var thumbUrl = BuildThumbnailUrl(aasRepositoryUrl, shellId, filename);
        using var response = await client.GetAsync(thumbUrl, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            return null;
        }

        return await response.Content.ReadAsByteArrayAsync(cancellationToken);
    }

    private static async Task UploadThumbnailAsync(
        HttpClient client,
        string aasRepositoryUrl,
        string shellId,
        byte[] fileBytes,
        string filename,
        string? contentType,
        CancellationToken cancellationToken
    )
    {
        var thumbUrl = BuildThumbnailUrl(aasRepositoryUrl, shellId, filename);
        using var httpRequestThumb = new HttpRequestMessage(HttpMethod.Put, thumbUrl);
        using var thumbContent = CreateMultipartFileContent(fileBytes, filename, contentType);

        httpRequestThumb.Content = thumbContent;

        using var thumbResponse = await client.SendAsync(httpRequestThumb, cancellationToken);
        Console.WriteLine("ThumbResponse: " + thumbResponse.StatusCode);

        if (!thumbResponse.IsSuccessStatusCode)
        {
            var responseContent = await thumbResponse.Content.ReadAsStringAsync(cancellationToken);
            throw new InvalidOperationException(
                $"Saving thumbnail '{filename}' failed for shell '{shellId}' with status code {(int)thumbResponse.StatusCode} {thumbResponse.StatusCode}. {responseContent}"
            );
        }
    }

    private static async Task TryAddPersistedThumbnailRenameAsync(
        SaveShellResult result,
        HttpClient client,
        string aasRepositoryUrl,
        string shellId,
        string requestedFilename,
        CancellationToken cancellationToken
    )
    {
        var persistedFilename = await TryGetPersistedThumbnailFilenameAsync(
            client,
            aasRepositoryUrl,
            shellId,
            cancellationToken
        );

        if (
            !string.IsNullOrWhiteSpace(persistedFilename)
            && !string.Equals(requestedFilename, persistedFilename, StringComparison.Ordinal)
            && !result.OldNewFileNames.ContainsKey(requestedFilename)
        )
        {
            result.OldNewFileNames.Add(requestedFilename, persistedFilename);
        }
    }

    private static async Task<string?> TryGetPersistedThumbnailFilenameAsync(
        HttpClient client,
        string aasRepositoryUrl,
        string shellId,
        CancellationToken cancellationToken
    )
    {
        var shellUrl =
            aasRepositoryUrl.AppendSlash() + "shells/" + shellId.ToBase64UrlEncoded(Encoding.UTF8);
        using var response = await client.GetAsync(shellUrl, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            return null;
        }

        var content = await response.Content.ReadAsStringAsync(cancellationToken);
        var jsonNode = JsonNode.Parse(content);
        if (jsonNode == null)
        {
            return null;
        }

        var shell = Deserialize.AssetAdministrationShellFrom(jsonNode);
        var persistedPath = shell.AssetInformation?.DefaultThumbnail?.Path;
        return string.IsNullOrWhiteSpace(persistedPath) ? null : Path.GetFileName(persistedPath);
    }

    private static string BuildThumbnailUrl(
        string aasRepositoryUrl,
        string shellId,
        string? filename
    )
    {
        var thumbUrl =
            aasRepositoryUrl.AppendSlash()
            + "shells/"
            + shellId.ToBase64UrlEncoded(Encoding.UTF8).AppendSlash()
            + "asset-information/thumbnail";

        if (!string.IsNullOrWhiteSpace(filename))
        {
            thumbUrl += "?fileName=" + Uri.EscapeDataString(filename);
        }

        return thumbUrl;
    }

    private static async Task<byte[]?> ReadProvidedFileBytesAsync(
        ProvidedFile providedFile,
        CancellationToken cancellationToken
    )
    {
        if (providedFile.Stream == null || !providedFile.Stream.CanRead)
        {
            return null;
        }

        if (providedFile.Stream.CanSeek)
        {
            providedFile.Stream.Position = 0;
        }

        using var buffer = new MemoryStream();
        await providedFile.Stream.CopyToAsync(buffer, cancellationToken);

        if (buffer.Length == 0)
        {
            return null;
        }

        return buffer.ToArray();
    }

    private static void ExcludeSubmodelsFromEnvironment(
        AasCore.Aas3_1.Environment environment,
        List<string>? excludedSubmodelIds
    )
    {
        if (excludedSubmodelIds == null || excludedSubmodelIds.Count == 0)
        {
            return;
        }

        var excluded = excludedSubmodelIds
            .Where(id => !string.IsNullOrWhiteSpace(id))
            .ToHashSet(StringComparer.Ordinal);

        if (excluded.Count == 0)
        {
            return;
        }

        environment.Submodels = environment
            .Submodels?.Where(sm => !excluded.Contains(sm.Id))
            .ToList();

        foreach (var aas in environment.AssetAdministrationShells ?? [])
        {
            aas.Submodels = aas
                .Submodels?.Where(smRef =>
                    !excluded.Contains(smRef.Keys.FirstOrDefault()?.Value ?? string.Empty)
                )
                .ToList();
        }
    }

    private static void ReplaceRoleAssetKindNode(JsonNode node)
    {
        if (node is JsonObject obj)
        {
            foreach (var kvp in obj.ToList())
            {
                if (
                    string.Equals(kvp.Key, "assetKind", StringComparison.Ordinal)
                    && kvp.Value is JsonValue value
                    && string.Equals(value.ToString(), "Role", StringComparison.Ordinal)
                )
                {
                    obj[kvp.Key] = "NotApplicable";
                    continue;
                }

                if (kvp.Value != null)
                {
                    ReplaceRoleAssetKindNode(kvp.Value);
                }
            }
            return;
        }

        if (node is JsonArray array)
        {
            foreach (var child in array)
            {
                if (child != null)
                {
                    ReplaceRoleAssetKindNode(child);
                }
            }
        }
    }

    private static Submodel? GetSubmodelFromEnv(AasCore.Aas3_1.Environment environment, string id)
    {
        return (Submodel?)environment.Submodels?.FirstOrDefault(sm => sm.Id == id);
    }

    private sealed record PreservedThumbnailUpload(
        string ShellId,
        byte[] FileBytes,
        string TargetFilename,
        string? ContentType
    );
}
