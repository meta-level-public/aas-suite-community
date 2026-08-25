using System.Net;
using System.Text;
using AasCore.Aas3_1;
using AasDesignerAasApi.ConceptDescriptions.Queries.GetSmList;
using AasDesignerAasApi.ConceptDescriptions.Queries.GetSmPlain;
using AasDesignerApi.Model;
using AasDesignerAuthorization;
using AasDesignerCommon.Registry;
using AasDesignerCommon.Shells;
using AasDesignerCommon.Utils;
using AasDesignerModel.Model;
using AasShared.Exceptions;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace AasDesignerAasApi.Controllers
{
    [ApiController]
    [Route("aas-api/[controller]/[action]")]
    [ApiExplorerSettings(GroupName = "internal-aas")]
    public class SubmodelController : Controller
    {
        private readonly ILogger<SubmodelController> _logger;
        private readonly IServiceProvider _serviceProvider;

        public SubmodelController(
            ILogger<SubmodelController> logger,
            IServiceProvider serviceProvider
        )
        {
            _logger = logger;
            _serviceProvider = serviceProvider;
        }

        [HttpPost]
        [AasDesignerAuthorize(
            RequiredRoles = [AuthRoles.BENUTZER, AuthRoles.ORGA_ADMIN, AuthRoles.SYSTEM_ADMIN]
        )]
        public async Task<SmVm> GetSmList(
            int count = 10,
            string? cursor = null,
            string filterIdShort = ""
        )
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();

            var mediator = new Mediator(_serviceProvider);

            var command = new GetSmListQuery
            {
                AppUser = benutzer,
                Count = count,
                Cursor = cursor,
                FilterIdShort = filterIdShort,
            };

            return await mediator.Send(command);
        }

        [HttpPost]
        [AasDesignerAuthorize(
            RequiredRoles = [AuthRoles.BENUTZER, AuthRoles.ORGA_ADMIN, AuthRoles.SYSTEM_ADMIN]
        )]
        public async Task<string> GetSmPlain(string smIdentifier)
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();

            var mediator = new Mediator(_serviceProvider);

            var command = new GetSmPlainQuery { AppUser = benutzer, SmIdentifier = smIdentifier };

            return await mediator.Send(command);
        }

        [HttpPost]
        [DisableRequestSizeLimit]
        [RequestFormLimits(
            ValueLengthLimit = int.MaxValue,
            MultipartBodyLengthLimit = long.MaxValue
        )]
        [AasDesignerAuthorize(
            RequiredRoles = [AuthRoles.SHELLS_EDITOR, AuthRoles.ORGA_ADMIN, AuthRoles.SYSTEM_ADMIN]
        )]
        public async Task<bool> SaveSm(IFormCollection data)
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();

            var plainJson = data["plainJson"].ToString();
            var editorDescriptorString = data["editorDescriptor"].ToString();
            var editorDescriptor =
                JsonConvert.DeserializeObject<EditorDescriptor>(editorDescriptorString)
                ?? new EditorDescriptor();

            var jsonNode = AasJsonNodeParser.Parse(plainJson);
            var submodel = Jsonization.Deserialize.SubmodelFrom(jsonNode);

            var descriptorEntry =
                editorDescriptor.SubmodelDescriptorEntries.FirstOrDefault(entry =>
                    string.Equals(entry.NewId, submodel.Id, StringComparison.Ordinal)
                    || string.Equals(entry.OldId, submodel.Id, StringComparison.Ordinal)
                )
                ?? new EditorDescriptorEntry
                {
                    OldId = submodel.Id,
                    NewId = submodel.Id,
                    Endpoint =
                        benutzer.CurrentInfrastructureSettings.SubmodelRepositoryUrl.AppendSlash()
                        + "submodels/"
                        + submodel.Id.ToBase64UrlEncoded(Encoding.UTF8),
                    IdShort = submodel.IdShort ?? string.Empty,
                };

            descriptorEntry.NewId = submodel.Id;
            descriptorEntry.IdShort = submodel.IdShort ?? string.Empty;

            using var client = HttpClientCreator.CreateHttpClient(benutzer);

            await UpsertSubmodelInRepository(
                benutzer.CurrentInfrastructureSettings.SubmodelRepositoryUrl,
                submodel,
                plainJson,
                client
            );

            if (
                !string.IsNullOrWhiteSpace(descriptorEntry.OldId)
                && !string.Equals(
                    descriptorEntry.OldId,
                    descriptorEntry.NewId,
                    StringComparison.Ordinal
                )
            )
            {
                await DeleteSubmodelFromRepository(
                    benutzer.CurrentInfrastructureSettings.SubmodelRepositoryUrl,
                    descriptorEntry.OldId,
                    client
                );
            }

            await UpdateSubmodelRegistryDescriptor(
                benutzer.CurrentInfrastructureSettings,
                submodel,
                descriptorEntry,
                editorDescriptor,
                client
            );

            return true;
        }

        private static async Task UpsertSubmodelInRepository(
            string submodelRepositoryUrl,
            AasCore.Aas3_1.Submodel submodel,
            string submodelPayload,
            HttpClient client
        )
        {
            var putUrl =
                submodelRepositoryUrl.AppendSlash()
                + "submodels/"
                + submodel.Id.ToBase64UrlEncoded(Encoding.UTF8);

            using var putResponse = await client.PutAsync(
                putUrl,
                new StringContent(submodelPayload, Encoding.UTF8, "application/json")
            );

            if (putResponse.IsSuccessStatusCode)
            {
                return;
            }

            if (putResponse.StatusCode != HttpStatusCode.NotFound)
            {
                var putContent = await putResponse.Content.ReadAsStringAsync();
                throw new InvalidOperationException(
                    $"Saving submodel '{submodel.Id}' failed via PUT {putUrl}: {(int)putResponse.StatusCode} {putResponse.StatusCode}. {putContent}"
                );
            }

            var postUrl = submodelRepositoryUrl.AppendSlash() + "submodels";
            using var postResponse = await client.PostAsync(
                postUrl,
                new StringContent(submodelPayload, Encoding.UTF8, "application/json")
            );

            if (!postResponse.IsSuccessStatusCode)
            {
                var postContent = await postResponse.Content.ReadAsStringAsync();
                throw new InvalidOperationException(
                    $"Saving submodel '{submodel.Id}' failed via POST {postUrl}: {(int)postResponse.StatusCode} {postResponse.StatusCode}. {postContent}"
                );
            }
        }

        private static async Task DeleteSubmodelFromRepository(
            string submodelRepositoryUrl,
            string submodelId,
            HttpClient client
        )
        {
            var deleteUrl =
                submodelRepositoryUrl.AppendSlash()
                + "submodels/"
                + submodelId.ToBase64UrlEncoded(Encoding.UTF8);
            using var deleteResponse = await client.DeleteAsync(deleteUrl);
            if (
                !deleteResponse.IsSuccessStatusCode
                && deleteResponse.StatusCode != HttpStatusCode.NotFound
            )
            {
                var responseContent = await deleteResponse.Content.ReadAsStringAsync();
                throw new InvalidOperationException(
                    $"Deleting old submodel '{submodelId}' failed: {(int)deleteResponse.StatusCode} {deleteResponse.StatusCode}. {responseContent}"
                );
            }
        }

        private static async Task UpdateSubmodelRegistryDescriptor(
            AasInfrastructureSettings infrastructure,
            AasCore.Aas3_1.Submodel submodel,
            EditorDescriptorEntry descriptorEntry,
            EditorDescriptor editorDescriptor,
            HttpClient client
        )
        {
            if (string.IsNullOrWhiteSpace(infrastructure.SubmodelRegistryUrl))
            {
                return;
            }

            if (
                !string.IsNullOrWhiteSpace(descriptorEntry.OldId)
                && !string.Equals(
                    descriptorEntry.OldId,
                    descriptorEntry.NewId,
                    StringComparison.Ordinal
                )
            )
            {
                await RegistryUpdater.RemoveFromSmRegistryAsync(
                    infrastructure.SubmodelRegistryUrl,
                    descriptorEntry.OldId,
                    CancellationToken.None,
                    client
                );
            }

            var smRegistryUrl =
                infrastructure.SubmodelRegistryUrl.AppendSlash()
                + "submodel-descriptors/"
                + submodel.Id.ToBase64UrlEncoded(Encoding.UTF8);
            var registryResponse = await client.GetAsync(smRegistryUrl);

            if (registryResponse.StatusCode == HttpStatusCode.NotFound)
            {
                var createdSmDescriptor = !string.IsNullOrWhiteSpace(descriptorEntry.Endpoint)
                    ? DescriptorCreator.CreateSubmodelDescriptorWithFullUrl(
                        submodel,
                        DescriptorUpdater.GetDesiredEndpointHref(
                            descriptorEntry,
                            editorDescriptor.AasDescriptorEntry
                        )
                    )
                    : DescriptorCreator.CreateSubmodelDescriptor(
                        submodel,
                        infrastructure.SubmodelRepositoryUrl
                    );

                var postResponse = await client.PostAsync(
                    infrastructure.SubmodelRegistryUrl.AppendSlash() + "submodel-descriptors",
                    new StringContent(
                        RegistryUpdater.SerializeSmDesc(createdSmDescriptor),
                        Encoding.UTF8,
                        "application/json"
                    )
                );

                if (!postResponse.IsSuccessStatusCode)
                {
                    var responseContent = await postResponse.Content.ReadAsStringAsync();
                    throw new InvalidOperationException(
                        $"Creating submodel descriptor failed: {(int)postResponse.StatusCode} {postResponse.StatusCode}. {responseContent}"
                    );
                }

                return;
            }

            if (!registryResponse.IsSuccessStatusCode)
            {
                var responseContent = await registryResponse.Content.ReadAsStringAsync();
                throw new InvalidOperationException(
                    $"Loading submodel descriptor failed: {(int)registryResponse.StatusCode} {registryResponse.StatusCode}. {responseContent}"
                );
            }

            var registryContent = await registryResponse.Content.ReadAsStringAsync();
            var smDescriptor = JsonConvert.DeserializeObject<SubmodelDescriptor>(registryContent);
            if (smDescriptor == null)
            {
                throw new InvalidOperationException(
                    "Could not deserialize existing submodel descriptor."
                );
            }

            DescriptorUpdater.UpdateSubmodelDescriptor(
                smDescriptor,
                submodel,
                descriptorEntry,
                editorDescriptor.AasDescriptorEntry
            );

            var putResponse = await client.PutAsync(
                smRegistryUrl,
                new StringContent(
                    RegistryUpdater.SerializeSmDesc(smDescriptor),
                    Encoding.UTF8,
                    "application/json"
                )
            );
            if (!putResponse.IsSuccessStatusCode)
            {
                var responseContent = await putResponse.Content.ReadAsStringAsync();
                throw new InvalidOperationException(
                    $"Updating submodel descriptor failed: {(int)putResponse.StatusCode} {putResponse.StatusCode}. {responseContent}"
                );
            }
        }
    }
}
