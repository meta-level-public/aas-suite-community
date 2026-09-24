using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using AasDesignerAasApi.Infrastructure;
using AasDesignerApi.Model;
using AasDesignerAuthorization;
using AasDesignerCommon.Utils;
using AasDesignerModel.Model;
using AasShared.Configuration;
using AasShared.Controllers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AasDesignerAasApi.Controllers;

public sealed record CreateDppMetadataRequest(
    string AasId,
    string UniqueProductIdentifier,
    string Granularity,
    string DppSchemaVersion,
    string DppStatus,
    string EconomicOperatorId,
    string? FacilityId,
    IReadOnlyList<string>? ContentSpecificationIds
);

public sealed record DppReadinessIssue(string Severity, string Code, string Message);

[ApiController]
[Route("aas-proxy/dpp/metadata")]
[ApiExplorerSettings(GroupName = "aas-api-proxy")]
public class DppMetadataController : InternalApiBaseController
{
    private const string MetadataSemanticId = "https://admin-shell.io/idta/cds/dppMetadata/1";
    private const string LegacyMetadataSemanticId =
        "urn:samm:io.admin-shell.idta.dpp_meta:1.0.0#DppMeta";
    private const string MetadataTemplateResource = "DppMetadataTemplates.1.0.json";
    private static readonly HashSet<string> AllowedDppStatuses =
    [
        "Draft",
        "Active",
        "Suspended",
        "Withdrawn",
    ];
    private readonly HttpClient _httpClient;
    private readonly IDppPublisherTokenProvider _publisherTokenProvider;
    private readonly IDppApiTokenProvider _dppApiTokenProvider;
    private readonly AppSettings _appSettings;

    public DppMetadataController(
        HttpClient httpClient,
        IDppPublisherTokenProvider publisherTokenProvider,
        IDppApiTokenProvider dppApiTokenProvider,
        AppSettings appSettings
    )
    {
        _httpClient = httpClient;
        _publisherTokenProvider = publisherTokenProvider;
        _dppApiTokenProvider = dppApiTokenProvider;
        _appSettings = appSettings;
    }

    [HttpPost("instantiate")]
    [AasDesignerAuthorize(
        RequiredRoles = [AuthRoles.SHELLS_EDITOR, AuthRoles.ORGA_ADMIN, AuthRoles.SYSTEM_ADMIN]
    )]
    public IActionResult Instantiate([FromBody] CreateDppMetadataRequest request)
    {
        if (
            string.IsNullOrWhiteSpace(request.AasId)
            || string.IsNullOrWhiteSpace(request.UniqueProductIdentifier)
            || string.IsNullOrWhiteSpace(request.DppSchemaVersion)
            || !AllowedDppStatuses.Contains(request.DppStatus)
            || string.IsNullOrWhiteSpace(request.EconomicOperatorId)
            || request.Granularity is not ("Item" or "Model" or "Batch")
            || (request.ContentSpecificationIds ?? []).Any(string.IsNullOrWhiteSpace)
        )
            return BadRequest("Die DPP-Metadaten sind unvollständig.");

        var metadataId = $"{request.AasId}/submodels/DppMetadata";
        var metadata = BuildMetadata(
            request.AasId,
            metadataId,
            request,
            (request.ContentSpecificationIds ?? []).Distinct(StringComparer.Ordinal).ToArray(),
            DateTimeOffset.UtcNow.ToString("O")
        );
        return Content(metadata.ToJsonString(), "application/json", Encoding.UTF8);
    }

    [HttpGet]
    [AasDesignerAuthorize]
    public async Task<IActionResult> Get(
        [FromQuery] string aasId,
        CancellationToken cancellationToken
    )
    {
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser user)
            return Unauthorized();
        var urls = GetRepositoryUrls(user.CurrentInfrastructureSettings);
        if (urls == null)
            return StatusCode(
                StatusCodes.Status503ServiceUnavailable,
                "Die Infrastruktur hat keine vollständige DPP-Konfiguration."
            );

        var (aasUrl, submodelUrl) = urls.Value;
        var result = await FindMetadata(aasId, aasUrl, submodelUrl, cancellationToken);
        if (result.Error != null)
            return result.Error;
        using var metadata = result.Metadata!;
        var elements = metadata.RootElement.GetProperty("submodelElements");
        string? Value(string name)
        {
            var element = elements
                .EnumerateArray()
                .FirstOrDefault(x =>
                    x.TryGetProperty("idShort", out var idShort) && idShort.GetString() == name
                );
            return
                element.ValueKind == JsonValueKind.Object
                && element.TryGetProperty("value", out var value)
                && value.ValueKind == JsonValueKind.String
                ? value.GetString()
                : null;
        }
        var specificationIds = elements
            .EnumerateArray()
            .FirstOrDefault(x =>
                x.TryGetProperty("idShort", out var idShort)
                && idShort.GetString() == "contentSpecificationIds"
            );
        var contentSpecificationIds =
            specificationIds.ValueKind == JsonValueKind.Object
            && specificationIds.TryGetProperty("value", out var entries)
            && entries.ValueKind == JsonValueKind.Array
                ? entries
                    .EnumerateArray()
                    .Select(x =>
                        x.TryGetProperty("value", out var value) ? value.GetString() : null
                    )
                    .Where(x => !string.IsNullOrWhiteSpace(x))
                    .ToArray()
                : [];
        return Ok(
            new
            {
                uniqueProductIdentifier = Value("uniqueProductIdentifier"),
                granularity = Value("granularity"),
                dppSchemaVersion = Value("dppSchemaVersion"),
                dppStatus = Value("dppStatus"),
                economicOperatorId = Value("economicOperatorId"),
                facilityId = Value("facilityId"),
                contentSpecificationIds,
            }
        );
    }

    [HttpGet("readiness")]
    [AasDesignerAuthorize]
    public async Task<IActionResult> CheckReadiness(
        [FromQuery] string aasId,
        CancellationToken cancellationToken
    )
    {
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser user)
            return Unauthorized();
        var infrastructure = user.CurrentInfrastructureSettings;
        var urls = GetRepositoryUrls(infrastructure);
        var dppUrl = ServiceUrl(infrastructure.GetResolvedServiceUrl("dpp-api"));
        if (urls == null || dppUrl == null)
            return StatusCode(
                StatusCodes.Status503ServiceUnavailable,
                "Die Infrastruktur hat keine vollständige DPP-Konfiguration."
            );

        var (aasUrl, submodelUrl) = urls.Value;
        var result = await FindMetadata(aasId, aasUrl, submodelUrl, cancellationToken);
        if (result.Error != null)
            return result.Error;
        using var metadata = result.Metadata!;
        using var aas = result.Aas!;
        var issues = new List<DppReadinessIssue>();
        var elements = metadata.RootElement.GetProperty("submodelElements");
        string? Value(string name)
        {
            var element = elements
                .EnumerateArray()
                .FirstOrDefault(x =>
                    x.TryGetProperty("idShort", out var idShort) && idShort.GetString() == name
                );
            return
                element.ValueKind == JsonValueKind.Object
                && element.TryGetProperty("value", out var value)
                && value.ValueKind == JsonValueKind.String
                ? value.GetString()
                : null;
        }
        foreach (
            var name in new[]
            {
                "uniqueProductIdentifier",
                "granularity",
                "dppSchemaVersion",
                "economicOperatorId",
            }
        )
            if (string.IsNullOrWhiteSpace(Value(name)))
                issues.Add(new("error", "MISSING_FIELD", $"Pflichtfeld {name} fehlt."));
        if (
            aas.RootElement.TryGetProperty("assetInformation", out var asset)
            && asset.TryGetProperty("globalAssetId", out var assetId)
            && assetId.ValueKind == JsonValueKind.String
            && !string.IsNullOrWhiteSpace(assetId.GetString())
            && Value("uniqueProductIdentifier") != assetId.GetString()
        )
            issues.Add(
                new(
                    "error",
                    "PRODUCT_ID_MISMATCH",
                    "Die Produktkennung stimmt nicht mit der globalAssetId der AAS überein."
                )
            );

        var specificationList = elements
            .EnumerateArray()
            .FirstOrDefault(x =>
                x.TryGetProperty("idShort", out var idShort)
                && idShort.GetString() == "contentSpecificationIds"
            );
        var specifications =
            specificationList.ValueKind == JsonValueKind.Object
            && specificationList.TryGetProperty("value", out var entries)
            && entries.ValueKind == JsonValueKind.Array
                ? entries
                    .EnumerateArray()
                    .Select(x =>
                        x.TryGetProperty("value", out var value) ? value.GetString() : null
                    )
                    .Where(x => !string.IsNullOrWhiteSpace(x))
                    .Distinct(StringComparer.Ordinal)
                    .ToArray()
                : [];
        if (specifications.Length == 0)
            issues.Add(
                new(
                    "warning",
                    "NO_CONTENT_SPECIFICATIONS",
                    "Es sind keine DPP-Teilmodelle ausgewählt."
                )
            );
        var attached = result.Submodels!.Where(x => x.Id != result.MetadataId).ToArray();
        foreach (var specification in specifications)
        {
            var matching = attached.Where(x => x.SemanticId == specification).ToArray();
            if (matching.Length == 0)
            {
                issues.Add(
                    new(
                        "error",
                        "SUBMODEL_MISSING",
                        $"Kein verknüpftes Teilmodell für {specification} gefunden."
                    )
                );
                continue;
            }
            foreach (var (id, _) in matching)
            {
                var encodedId = id.ToBase64UrlEncoded(Encoding.UTF8);
                using var response = await _httpClient.GetAsync(
                    $"{submodelUrl}/submodels/{encodedId}",
                    cancellationToken
                );
                if (!response.IsSuccessStatusCode)
                {
                    issues.Add(
                        new(
                            "error",
                            "SUBMODEL_UNAVAILABLE",
                            $"Teilmodell {id} ist nicht erreichbar."
                        )
                    );
                    continue;
                }
                using var submodel = JsonDocument.Parse(
                    await response.Content.ReadAsStringAsync(cancellationToken)
                );
                CheckFileReferences(submodel.RootElement, id, issues);
            }
        }

        using var dppResponse = await GetDppAsync(dppUrl, aasId, cancellationToken);
        var accessible = dppResponse.IsSuccessStatusCode;
        if (!accessible)
        {
            var detail = await DppErrorDetail(dppResponse, cancellationToken);
            issues.Add(
                new(
                    "error",
                    "DPP_API_FAILED",
                    $"DPP-API liefert HTTP {(int)dppResponse.StatusCode}: {detail}"
                )
            );
        }
        return Ok(
            new
            {
                ready = accessible && !issues.Any(x => x.Severity == "error"),
                dppAccessible = accessible,
                issues,
            }
        );
    }

    private static void CheckFileReferences(
        JsonElement element,
        string submodelId,
        List<DppReadinessIssue> issues
    )
    {
        if (element.ValueKind == JsonValueKind.Object)
        {
            if (
                element.TryGetProperty("modelType", out var modelType)
                && modelType.GetString() == "File"
                && element.TryGetProperty("value", out var value)
                && value.ValueKind == JsonValueKind.String
                && !string.IsNullOrWhiteSpace(value.GetString())
                && (
                    !Uri.TryCreate(value.GetString(), UriKind.Absolute, out var uri)
                    || uri.Scheme is not ("http" or "https")
                )
            )
            {
                var name = element.TryGetProperty("idShort", out var idShort)
                    ? idShort.GetString()
                    : "Datei";
                issues.Add(
                    new(
                        "warning",
                        "RELATIVE_FILE_URL",
                        $"{submodelId} / {name}: interner Dateipfad {value.GetString()}. Für verwaltete Dateianhänge verlangt die BaSyx-DPP-API eine gültige general.externalUrl."
                    )
                );
            }
            foreach (var property in element.EnumerateObject())
                CheckFileReferences(property.Value, submodelId, issues);
        }
        else if (element.ValueKind == JsonValueKind.Array)
            foreach (var child in element.EnumerateArray())
                CheckFileReferences(child, submodelId, issues);
    }

    private static async Task<string> DppErrorDetail(
        HttpResponseMessage response,
        CancellationToken cancellationToken
    )
    {
        var body = await response.Content.ReadAsStringAsync(cancellationToken);
        try
        {
            using var json = JsonDocument.Parse(body);
            var messages = json.RootElement.GetProperty("messages");
            var first = messages[0];
            if (
                first.TryGetProperty("text", out var text)
                && text.ValueKind == JsonValueKind.String
            )
                return text.GetString()![..Math.Min(text.GetString()!.Length, 300)];
        }
        catch (JsonException) { }
        catch (KeyNotFoundException) { }
        return response.ReasonPhrase ?? "Unbekannter Fehler";
    }

    [HttpPut]
    [AasDesignerAuthorize(
        RequiredRoles = [AuthRoles.SHELLS_EDITOR, AuthRoles.ORGA_ADMIN, AuthRoles.SYSTEM_ADMIN]
    )]
    public async Task<IActionResult> Update(
        [FromBody] CreateDppMetadataRequest request,
        CancellationToken cancellationToken
    )
    {
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser user)
            return Unauthorized();
        if (user.CurrentInfrastructureSettings.IsReadonly)
            return Forbid();
        if (
            string.IsNullOrWhiteSpace(request.AasId)
            || string.IsNullOrWhiteSpace(request.UniqueProductIdentifier)
            || string.IsNullOrWhiteSpace(request.DppSchemaVersion)
            || !AllowedDppStatuses.Contains(request.DppStatus)
            || string.IsNullOrWhiteSpace(request.EconomicOperatorId)
            || request.Granularity is not ("Item" or "Model" or "Batch")
        )
            return BadRequest(
                "DPP-ID, Produktkennung, Granularität, Schemaversion und Wirtschaftsakteur sind erforderlich."
            );

        var urls = GetRepositoryUrls(user.CurrentInfrastructureSettings);
        if (urls == null)
            return StatusCode(
                StatusCodes.Status503ServiceUnavailable,
                "Die Infrastruktur hat keine vollständige DPP-Konfiguration."
            );
        var (aasUrl, submodelUrl) = urls.Value;
        var result = await FindMetadata(request.AasId, aasUrl, submodelUrl, cancellationToken);
        if (result.Error != null)
            return result.Error;
        using var metadata = result.Metadata!;
        using var aas = result.Aas!;
        if (
            aas.RootElement.TryGetProperty("assetInformation", out var asset)
            && asset.TryGetProperty("globalAssetId", out var productId)
            && productId.ValueKind == JsonValueKind.String
            && !string.IsNullOrWhiteSpace(productId.GetString())
            && productId.GetString() != request.UniqueProductIdentifier
        )
            return Conflict("Die Produktkennung muss der globalAssetId der AAS entsprechen.");

        var selected = request.ContentSpecificationIds ?? [];
        if (selected.Any(string.IsNullOrWhiteSpace))
            return BadRequest("Ausgewählte Teilmodelle benötigen eine Semantic ID.");
        var specificationIds = selected.Distinct(StringComparer.Ordinal).ToArray();
        var attachedSemanticIds = new HashSet<string>(StringComparer.Ordinal);
        foreach (var (submodelId, semanticId) in result.Submodels!)
            if (submodelId != result.MetadataId && semanticId != null)
                attachedSemanticIds.Add(semanticId);
        if (specificationIds.Any(id => !attachedSemanticIds.Contains(id)))
            return BadRequest(
                "Mindestens eine Semantic ID gehört zu keinem Teilmodell dieser AAS."
            );

        var node = JsonNode.Parse(metadata.RootElement.GetRawText())!.AsObject();
        var elements = node["submodelElements"]!.AsArray();
        void SetValue(string name, string? value, string valueType = "xs:string")
        {
            var property = elements.FirstOrDefault(x => x?["idShort"]?.GetValue<string>() == name);
            if (value == null)
            {
                if (property != null)
                    elements.Remove(property);
                return;
            }
            if (property == null)
            {
                property = new JsonObject
                {
                    ["modelType"] = "Property",
                    ["idShort"] = name,
                    ["valueType"] = valueType,
                    ["value"] = value,
                };
                elements.Add(property);
            }
            else
                property["value"] = value;
        }
        SetValue("uniqueProductIdentifier", request.UniqueProductIdentifier.Trim());
        SetValue("granularity", request.Granularity);
        SetValue("dppSchemaVersion", request.DppSchemaVersion.Trim());
        SetValue("dppStatus", request.DppStatus);
        SetValue("economicOperatorId", request.EconomicOperatorId.Trim());
        SetValue(
            "facilityId",
            string.IsNullOrWhiteSpace(request.FacilityId) ? null : request.FacilityId.Trim()
        );
        SetValue("lastUpdate", DateTimeOffset.UtcNow.ToString("O"), "xs:dateTime");
        var specifications = elements.FirstOrDefault(x =>
            x?["idShort"]?.GetValue<string>() == "contentSpecificationIds"
        );
        if (specifications == null)
        {
            specifications = new JsonObject
            {
                ["modelType"] = "SubmodelElementList",
                ["idShort"] = "contentSpecificationIds",
                ["typeValueListElement"] = "Property",
                ["valueTypeListElement"] = "xs:string",
            };
            elements.Add(specifications);
        }
        specifications["value"] = new JsonArray(
            specificationIds
                .Select(id =>
                    (JsonNode?)
                        new JsonObject
                        {
                            ["modelType"] = "Property",
                            ["valueType"] = "xs:string",
                            ["value"] = id,
                        }
                )
                .ToArray()
        );

        var encodedId = result.MetadataId!.ToBase64UrlEncoded(Encoding.UTF8);
        using var updateResponse = await _httpClient.PutAsync(
            $"{submodelUrl}/submodels/{encodedId}",
            JsonContent(node),
            cancellationToken
        );
        if (!updateResponse.IsSuccessStatusCode)
            return StatusCode(
                (int)updateResponse.StatusCode,
                "DPP-Metadaten konnten nicht gespeichert werden."
            );
        var publicationError = await SynchronizePublication(
            request.AasId,
            request.DppStatus,
            user.CurrentInfrastructureSettings,
            cancellationToken
        );
        if (publicationError != null)
            return publicationError;
        return Ok(new { dppId = request.AasId });
    }

    private static (string AasUrl, string SubmodelUrl)? GetRepositoryUrls(
        AasInfrastructureSettings infrastructure
    )
    {
        var aasUrl = ServiceUrl(infrastructure.GetResolvedServiceUrl("aas-repo"));
        var submodelUrl = ServiceUrl(infrastructure.GetResolvedServiceUrl("sm-repo"));
        return aasUrl == null || submodelUrl == null ? null : (aasUrl, submodelUrl);
    }

    private async Task<(
        JsonDocument? Aas,
        JsonDocument? Metadata,
        string? MetadataId,
        List<(string Id, string? SemanticId)>? Submodels,
        IActionResult? Error
    )> FindMetadata(
        string aasId,
        string aasUrl,
        string submodelUrl,
        CancellationToken cancellationToken
    )
    {
        var encodedAasId = aasId.ToBase64UrlEncoded(Encoding.UTF8);
        using var aasResponse = await _httpClient.GetAsync(
            $"{aasUrl}/shells/{encodedAasId}",
            cancellationToken
        );
        if (aasResponse.StatusCode == HttpStatusCode.NotFound)
            return (null, null, null, null, NotFound("Die AAS wurde nicht gefunden."));
        if (!aasResponse.IsSuccessStatusCode)
            return (null, null, null, null, StatusCode(StatusCodes.Status502BadGateway));
        var aas = JsonDocument.Parse(
            await aasResponse.Content.ReadAsStringAsync(cancellationToken)
        );
        if (
            !aas.RootElement.TryGetProperty("id", out var storedId)
            || storedId.GetString() != aasId
        )
        {
            aas.Dispose();
            return (
                null,
                null,
                null,
                null,
                Conflict("Die geladene AAS-ID stimmt nicht mit der Anfrage überein.")
            );
        }
        var submodels = new List<(string Id, string? SemanticId)>();
        JsonDocument? metadata = null;
        string? metadataId = null;
        if (aas.RootElement.TryGetProperty("submodels", out var references))
        {
            foreach (var reference in references.EnumerateArray())
            {
                if (!reference.TryGetProperty("keys", out var keys) || keys.GetArrayLength() == 0)
                    continue;
                var id = keys[keys.GetArrayLength() - 1].GetProperty("value").GetString();
                if (string.IsNullOrWhiteSpace(id))
                    continue;
                var encodedId = id.ToBase64UrlEncoded(Encoding.UTF8);
                using var response = await _httpClient.GetAsync(
                    $"{submodelUrl}/submodels/{encodedId}",
                    cancellationToken
                );
                if (!response.IsSuccessStatusCode)
                {
                    aas.Dispose();
                    metadata?.Dispose();
                    return (
                        null,
                        null,
                        null,
                        null,
                        StatusCode(
                            StatusCodes.Status502BadGateway,
                            "Ein verknüpftes Teilmodell konnte nicht gelesen werden."
                        )
                    );
                }
                var submodel = JsonDocument.Parse(
                    await response.Content.ReadAsStringAsync(cancellationToken)
                );
                string? semanticId = null;
                if (
                    submodel.RootElement.TryGetProperty("semanticId", out var semantic)
                    && semantic.ValueKind == JsonValueKind.Object
                    && semantic.TryGetProperty("keys", out var semanticKeys)
                    && semanticKeys.GetArrayLength() > 0
                )
                    semanticId = semanticKeys[semanticKeys.GetArrayLength() - 1]
                        .GetProperty("value")
                        .GetString();
                submodels.Add((id, semanticId));
                if (
                    semanticId is MetadataSemanticId or LegacyMetadataSemanticId
                    && metadata == null
                )
                {
                    metadata = submodel;
                    metadataId = id;
                }
                else
                    submodel.Dispose();
            }
        }
        if (metadata != null)
            return (aas, metadata, metadataId, submodels, null);
        aas.Dispose();
        return (
            null,
            null,
            null,
            null,
            NotFound("Fuer diese AAS sind keine DPP-Metadaten konfiguriert.")
        );
    }

    [HttpPost]
    [AasDesignerAuthorize(
        RequiredRoles = [AuthRoles.SHELLS_EDITOR, AuthRoles.ORGA_ADMIN, AuthRoles.SYSTEM_ADMIN]
    )]
    public async Task<IActionResult> Create(
        [FromBody] CreateDppMetadataRequest request,
        CancellationToken cancellationToken
    )
    {
        var aasId = request.AasId;
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser user)
            return Unauthorized();

        var infrastructure = user.CurrentInfrastructureSettings;
        if (infrastructure.IsReadonly)
            return Forbid();

        if (
            string.IsNullOrWhiteSpace(aasId)
            || string.IsNullOrWhiteSpace(request.UniqueProductIdentifier)
            || string.IsNullOrWhiteSpace(request.DppSchemaVersion)
            || !AllowedDppStatuses.Contains(request.DppStatus)
            || string.IsNullOrWhiteSpace(request.EconomicOperatorId)
            || request.Granularity is not ("Item" or "Model" or "Batch")
        )
            return BadRequest(
                "DPP-ID, Produktkennung, Granularität, Schemaversion und Wirtschaftsakteur sind erforderlich."
            );

        var dppUrl = ServiceUrl(infrastructure.GetResolvedServiceUrl("dpp-api"));
        var aasUrl = ServiceUrl(infrastructure.GetResolvedServiceUrl("aas-repo"));
        var submodelUrl = ServiceUrl(infrastructure.GetResolvedServiceUrl("sm-repo"));
        if (dppUrl == null || aasUrl == null || submodelUrl == null)
            return StatusCode(
                StatusCodes.Status503ServiceUnavailable,
                "Die Infrastruktur hat keine vollständige DPP-Konfiguration."
            );

        var encodedId = aasId.ToBase64UrlEncoded(Encoding.UTF8);
        using var aasResponse = await _httpClient.GetAsync(
            $"{aasUrl}/shells/{encodedId}",
            cancellationToken
        );
        if (aasResponse.StatusCode == HttpStatusCode.NotFound)
            return NotFound("Die AAS wurde in der ausgewählten Infrastruktur nicht gefunden.");
        if (!aasResponse.IsSuccessStatusCode)
            return StatusCode(
                StatusCodes.Status502BadGateway,
                "Die AAS konnte nicht gelesen werden."
            );

        using var aas = JsonDocument.Parse(
            await aasResponse.Content.ReadAsStringAsync(cancellationToken)
        );
        if (
            !aas.RootElement.TryGetProperty("id", out var storedId)
            || storedId.GetString() != aasId
        )
            return Conflict("Die geladene AAS-ID stimmt nicht mit der Anfrage überein.");
        if (
            aas.RootElement.TryGetProperty("assetInformation", out var asset)
            && asset.TryGetProperty("globalAssetId", out var productId)
            && productId.ValueKind == JsonValueKind.String
            && !string.IsNullOrWhiteSpace(productId.GetString())
            && productId.GetString() != request.UniqueProductIdentifier
        )
            return Conflict("Die Produktkennung muss der globalAssetId der AAS entsprechen.");

        var requestedSpecifications = request.ContentSpecificationIds ?? [];
        if (requestedSpecifications.Any(string.IsNullOrWhiteSpace))
            return BadRequest("Ausgewählte Teilmodelle benötigen eine Semantic ID.");
        var contentSpecificationIds = requestedSpecifications
            .Distinct(StringComparer.Ordinal)
            .ToArray();
        if (contentSpecificationIds.Length > 0)
        {
            var attachedSemanticIds = new HashSet<string>(StringComparer.Ordinal);
            if (aas.RootElement.TryGetProperty("submodels", out var references))
            {
                foreach (var submodelReference in references.EnumerateArray())
                {
                    if (
                        !submodelReference.TryGetProperty("keys", out var keys)
                        || keys.GetArrayLength() == 0
                    )
                        continue;
                    var submodelId = keys[keys.GetArrayLength() - 1]
                        .GetProperty("value")
                        .GetString();
                    if (string.IsNullOrWhiteSpace(submodelId))
                        continue;
                    var encodedSubmodelId = submodelId.ToBase64UrlEncoded(Encoding.UTF8);
                    using var submodelResponse = await _httpClient.GetAsync(
                        $"{submodelUrl}/submodels/{encodedSubmodelId}",
                        cancellationToken
                    );
                    if (!submodelResponse.IsSuccessStatusCode)
                        return StatusCode(
                            StatusCodes.Status502BadGateway,
                            "Ein verknüpftes Teilmodell konnte nicht gelesen werden."
                        );
                    using var submodel = JsonDocument.Parse(
                        await submodelResponse.Content.ReadAsStringAsync(cancellationToken)
                    );
                    if (
                        submodel.RootElement.TryGetProperty("semanticId", out var semanticReference)
                        && semanticReference.ValueKind == JsonValueKind.Object
                        && semanticReference.TryGetProperty("keys", out var semanticKeys)
                        && semanticKeys.GetArrayLength() > 0
                    )
                    {
                        var semanticId = semanticKeys[semanticKeys.GetArrayLength() - 1]
                            .GetProperty("value")
                            .GetString();
                        if (!string.IsNullOrWhiteSpace(semanticId))
                            attachedSemanticIds.Add(semanticId);
                    }
                    if (contentSpecificationIds.All(attachedSemanticIds.Contains))
                        break;
                }
            }
            if (contentSpecificationIds.Any(id => !attachedSemanticIds.Contains(id)))
                return BadRequest(
                    "Mindestens eine Semantic ID gehört zu keinem Teilmodell dieser AAS."
                );
        }

        var dppResource = $"{dppUrl}/v1/dpps/{Uri.EscapeDataString(aasId)}";
        using var existing = await SendDppAsync(HttpMethod.Get, dppResource, cancellationToken);
        if (existing.IsSuccessStatusCode)
            return Conflict("Für diese AAS ist bereits ein DPP vorhanden.");
        if (existing.StatusCode != HttpStatusCode.NotFound)
            return StatusCode(
                StatusCodes.Status502BadGateway,
                "Der DPP-Status konnte nicht geprüft werden."
            );

        var metadataId = $"{aasId}/submodels/DppMetadata";
        var timestamp = DateTimeOffset.UtcNow.ToString("O");
        var metadata = BuildMetadata(
            aasId,
            metadataId,
            request,
            contentSpecificationIds,
            timestamp
        );
        using var createResponse = await _httpClient.PostAsync(
            $"{submodelUrl}/submodels",
            JsonContent(metadata),
            cancellationToken
        );
        if (!createResponse.IsSuccessStatusCode)
            return StatusCode(
                (int)createResponse.StatusCode,
                "Das DPP-Metadaten-Submodell konnte nicht angelegt werden."
            );

        var reference = new
        {
            type = "ModelReference",
            keys = new[] { new { type = "Submodel", value = metadataId } },
        };
        using var linkResponse = await _httpClient.PostAsync(
            $"{aasUrl}/shells/{encodedId}/submodel-refs",
            JsonContent(reference),
            cancellationToken
        );
        if (!linkResponse.IsSuccessStatusCode)
        {
            return StatusCode(
                (int)linkResponse.StatusCode,
                "Das Metadaten-Submodell wurde angelegt, konnte aber nicht mit der AAS verknüpft werden. Bitte nicht erneut anlegen, bevor die Referenz geprüft wurde."
            );
        }

        using var verifyResponse = await SendDppAsync(
            HttpMethod.Get,
            dppResource,
            cancellationToken
        );
        if (!verifyResponse.IsSuccessStatusCode)
            return StatusCode(
                StatusCodes.Status502BadGateway,
                "DPP-Metadaten wurden angelegt, aber die DPP-API kann sie noch nicht lesen. Bitte den Status erneut prüfen."
            );

        var publicationError = await SynchronizePublication(
            aasId,
            request.DppStatus,
            infrastructure,
            cancellationToken
        );
        if (publicationError != null)
            return publicationError;

        return Ok(new { dppId = aasId, status = request.DppStatus });
    }

    private async Task<IActionResult?> SynchronizePublication(
        string dppId,
        string dppStatus,
        AasInfrastructureSettings infrastructure,
        CancellationToken cancellationToken
    )
    {
        var managementUrl = ServiceUrl(_appSettings.DppGatewayManagementUrl);
        if (managementUrl == null)
        {
            if (dppStatus != "Active")
                return null;
            return StatusCode(
                StatusCodes.Status503ServiceUnavailable,
                "Die DPP-Gateway-Veröffentlichung ist nicht konfiguriert."
            );
        }
        var infrastructureId = string.IsNullOrWhiteSpace(infrastructure.ContainerGuid)
            ? "single-tenant"
            : infrastructure.ContainerGuid;
        string accessToken;
        try
        {
            accessToken = await _publisherTokenProvider.GetAccessTokenAsync(
                infrastructureId,
                cancellationToken
            );
        }
        catch (Exception exception)
            when (exception is HttpRequestException or InvalidOperationException)
        {
            return StatusCode(
                StatusCodes.Status503ServiceUnavailable,
                "Die Berechtigung zur DPP-Veröffentlichung konnte nicht erstellt werden."
            );
        }

        var target = $"{managementUrl}/management/publications/{Uri.EscapeDataString(dppId)}";
        using var request = new HttpRequestMessage(
            dppStatus == "Active" ? HttpMethod.Put : HttpMethod.Delete,
            target
        );
        request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue(
            "Bearer",
            accessToken
        );
        using var response = await _httpClient.SendAsync(request, cancellationToken);
        var missingInactivePublication =
            dppStatus != "Active" && response.StatusCode == HttpStatusCode.NotFound;
        if (!response.IsSuccessStatusCode && !missingInactivePublication)
            return StatusCode(
                StatusCodes.Status502BadGateway,
                dppStatus == "Active"
                    ? "Die DPP-Metadaten wurden gespeichert, aber die Veröffentlichung im Gateway ist fehlgeschlagen."
                    : "Die DPP-Metadaten wurden gespeichert, aber die Veröffentlichung konnte nicht entfernt werden."
            );
        return null;
    }

    private Task<HttpResponseMessage> GetDppAsync(
        string dppUrl,
        string dppId,
        CancellationToken cancellationToken
    ) =>
        SendDppAsync(
            HttpMethod.Get,
            $"{dppUrl}/v1/dpps/{Uri.EscapeDataString(dppId)}",
            cancellationToken
        );

    private async Task<HttpResponseMessage> SendDppAsync(
        HttpMethod method,
        string url,
        CancellationToken cancellationToken
    )
    {
        var accessToken = await _dppApiTokenProvider.GetAccessTokenAsync(cancellationToken);
        using var request = new HttpRequestMessage(method, url);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        return await _httpClient.SendAsync(request, cancellationToken);
    }

    private static string? ServiceUrl(string value)
    {
        if (
            !Uri.TryCreate(value, UriKind.Absolute, out var uri)
            || uri.Scheme is not ("http" or "https")
            || !string.IsNullOrEmpty(uri.UserInfo)
            || !string.IsNullOrEmpty(uri.Query)
            || !string.IsNullOrEmpty(uri.Fragment)
        )
            return null;
        return uri.ToString().TrimEnd('/');
    }

    private static StringContent JsonContent(object value) =>
        new(JsonSerializer.Serialize(value), Encoding.UTF8, "application/json");

    private static JsonObject BuildMetadata(
        string aasId,
        string metadataId,
        CreateDppMetadataRequest request,
        IReadOnlyList<string> contentSpecificationIds,
        string timestamp
    )
    {
        using var stream =
            typeof(DppMetadataController).Assembly.GetManifestResourceStream(
                MetadataTemplateResource
            ) ?? throw new InvalidOperationException("Das DPP-Metadaten-Template 1.0 fehlt.");
        var metadata =
            JsonNode.Parse(stream)?.AsObject()
            ?? throw new InvalidOperationException("Das DPP-Metadaten-Template 1.0 ist ungültig.");

        metadata["id"] = metadataId;
        metadata["kind"] = "Instance";
        metadata.Remove("administration");
        RemoveTemplateQualifiers(metadata);

        var elements =
            metadata["submodelElements"]?.AsArray()
            ?? throw new InvalidOperationException(
                "Das DPP-Metadaten-Template enthält keine Elemente."
            );
        var values = new Dictionary<string, string>(StringComparer.Ordinal)
        {
            ["digitalProductPassportId"] = aasId,
            ["uniqueProductIdentifier"] = request.UniqueProductIdentifier.Trim(),
            ["granularity"] = request.Granularity,
            ["dppSchemaVersion"] = request.DppSchemaVersion.Trim(),
            ["dppStatus"] = request.DppStatus,
            ["lastUpdate"] = timestamp,
            ["economicOperatorId"] = request.EconomicOperatorId.Trim(),
        };
        if (!string.IsNullOrWhiteSpace(request.FacilityId))
            values["facilityId"] = request.FacilityId.Trim();

        foreach (var element in elements.OfType<JsonObject>().ToArray())
        {
            var idShort = element["idShort"]?.GetValue<string>();
            if (idShort == "facilityId" && !values.ContainsKey(idShort))
            {
                elements.Remove(element);
                continue;
            }
            if (idShort == "contentSpecificationIds")
            {
                var prototype =
                    element["value"]?.AsArray().FirstOrDefault()?.DeepClone()
                    ?? throw new InvalidOperationException(
                        "Das DPP-Metadaten-Template enthält keine Vorlage für Content-Spezifikationen."
                    );
                element["value"] = new JsonArray(
                    contentSpecificationIds
                        .Select(id =>
                        {
                            var item = prototype.DeepClone().AsObject();
                            item["value"] = id;
                            return (JsonNode)item;
                        })
                        .ToArray()
                );
            }
            else if (idShort != null && values.TryGetValue(idShort, out var value))
            {
                element["value"] = value;
            }
        }

        return metadata;
    }

    private static void RemoveTemplateQualifiers(JsonNode node)
    {
        if (node is JsonObject jsonObject)
        {
            jsonObject.Remove("qualifiers");
            foreach (var child in jsonObject.ToArray())
                if (child.Value != null)
                    RemoveTemplateQualifiers(child.Value);
        }
        else if (node is JsonArray jsonArray)
        {
            foreach (var child in jsonArray)
                if (child != null)
                    RemoveTemplateQualifiers(child);
        }
    }
}
