using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using AasDesignerCommon.Model;
using AasDesignerModel;
using AasShared.Configuration;
using AasShared.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace AasDesignerAasApi.Infrastructure;

public sealed class DppAccessPolicyStore(
    IApplicationDbContext context,
    AppSettings settings,
    IHttpClientFactory httpClientFactory
)
{
    private static readonly string[] DppScopes = ["All", "Selected"];
    private static readonly string[] ConditionCombinations = ["All", "Any"];
    private static readonly HashSet<string> ConditionOperators =
    [
        "Equal",
        "NotEqual",
        "Contains",
        "StartsWith",
        "EndsWith",
        "Regex",
    ];
    private static readonly HashSet<string> DppMetadataFields =
    [
        "digitalProductPassportId",
        "uniqueProductIdentifier",
        "granularity",
        "dppSchemaVersion",
        "dppStatus",
        "economicOperatorId",
        "facilityId",
    ];

    public async Task<DppAccessPolicyDto> GetAsync(
        long id,
        long organisationId,
        bool allowCrossOrganisation,
        CancellationToken token
    )
    {
        var infrastructure = await GetInfrastructureAsync(
            id,
            organisationId,
            allowCrossOrganisation,
            token
        );
        var path = ConfigurationPath(infrastructure);
        if (!File.Exists(path))
            return await ReadLegacyPolicyAsync(id, infrastructure, token);
        var policy = JsonSerializer.Deserialize<DppAccessPolicyDto>(
            await File.ReadAllTextAsync(path, token)
        );
        if (policy is null)
            return CreateProfile(id, "Public");
        policy.InfrastructureId = id;
        if (
            string.IsNullOrWhiteSpace(policy.RawPolicyJson)
            && File.Exists(PolicyPath(infrastructure))
        )
            policy.RawPolicyJson = await File.ReadAllTextAsync(PolicyPath(infrastructure), token);
        Validate(policy);
        return policy;
    }

    private async Task<DppAccessPolicyDto> ReadLegacyPolicyAsync(
        long infrastructureId,
        AasDesignerModel.Model.AasInfrastructureSettings infrastructure,
        CancellationToken token
    )
    {
        var path = PolicyPath(infrastructure);
        if (!File.Exists(path))
            return CreateProfile(infrastructureId, "Public");
        return CreateProfile(infrastructureId, "Custom");
    }

    public async Task<DppAccessPolicyDto> UpdateAsync(
        DppAccessPolicyDto dto,
        long organisationId,
        bool allowCrossOrganisation,
        CancellationToken token
    )
    {
        Validate(dto);
        var infrastructure = await GetInfrastructureAsync(
            dto.InfrastructureId,
            organisationId,
            allowCrossOrganisation,
            token
        );
        var policyPath = PolicyPath(infrastructure);
        Directory.CreateDirectory(Path.GetDirectoryName(policyPath)!);
        var policyJson =
            dto.Profile == "Expert"
                ? NormalizeRawPolicy(dto.RawPolicyJson)
                : BuildPolicy(dto.Rules);
        dto.RawPolicyJson = policyJson;
        await File.WriteAllTextAsync(policyPath, policyJson, token);
        await File.WriteAllTextAsync(
            ConfigurationPath(infrastructure),
            JsonSerializer.Serialize(dto, new JsonSerializerOptions { WriteIndented = true }),
            token
        );
        if (settings.DppPolicyManagementApiEnabled)
            await ActivatePolicyAsync(infrastructure.DppApiUrl, policyJson, token);
        return dto;
    }

    private async Task ActivatePolicyAsync(
        string dppApiUrl,
        string policyJson,
        CancellationToken token
    )
    {
        if (
            string.IsNullOrWhiteSpace(settings.DppPolicyAdminOAuthClientId)
            || string.IsNullOrWhiteSpace(settings.DppPolicyAdminOAuthClientSecret)
        )
            throw new InvalidOperationException("DPP policy administration is not configured.");

        using var client = httpClientFactory.CreateClient();
        using var tokenRequest = new HttpRequestMessage(
            HttpMethod.Post,
            $"{settings.KeycloakIssuer.TrimEnd('/')}/protocol/openid-connect/token"
        );
        if (!string.IsNullOrWhiteSpace(settings.DppPolicyAdminOAuthTokenHostHeader))
            tokenRequest.Headers.Host = settings.DppPolicyAdminOAuthTokenHostHeader;
        tokenRequest.Content = new FormUrlEncodedContent(
            new Dictionary<string, string>
            {
                ["grant_type"] = "client_credentials",
                ["client_id"] = settings.DppPolicyAdminOAuthClientId,
                ["client_secret"] = settings.DppPolicyAdminOAuthClientSecret,
            }
        );
        using var tokenResponse = await client.SendAsync(tokenRequest, token);
        var tokenJson = await tokenResponse.Content.ReadAsStringAsync(token);
        tokenResponse.EnsureSuccessStatusCode();
        using var tokenDocument = JsonDocument.Parse(tokenJson);
        var accessToken = tokenDocument.RootElement.GetProperty("access_token").GetString();
        if (string.IsNullOrWhiteSpace(accessToken))
            throw new InvalidOperationException("Keycloak returned no DPP policy admin token.");

        using var policyDocument = JsonDocument.Parse(policyJson);
        using var request = new HttpRequestMessage(
            HttpMethod.Post,
            $"{dppApiUrl.TrimEnd('/')}/security/abac/policy-versions"
        );
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        request.Content = JsonContent.Create(
            new
            {
                source_ref = $"aas-suite:{DateTimeOffset.UtcNow:O}",
                activate = true,
                policy = policyDocument.RootElement.Clone(),
            }
        );
        using var response = await client.SendAsync(request, token);
        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync(token);
            throw new InvalidOperationException(
                $"The DPP API rejected the access policy ({(int)response.StatusCode}): {body}"
            );
        }
    }

    private async Task<AasDesignerModel.Model.AasInfrastructureSettings> GetInfrastructureAsync(
        long id,
        long organisationId,
        bool allowCrossOrganisation,
        CancellationToken token
    )
    {
        var infrastructure = await context.AasInfrastructureSettings.SingleOrDefaultAsync(
            item =>
                item.Id == id
                && (allowCrossOrganisation || item.OrganisationId == organisationId)
                && !item.Geloescht,
            token
        );

        if (infrastructure is null)
            throw new ResourceNotFoundException(
                "The infrastructure was not found for this organisation."
            );
        if (string.IsNullOrWhiteSpace(infrastructure.DppApiUrl))
            throw new InvalidOperationException(
                "The infrastructure has no manageable DPP API configuration."
            );

        return infrastructure;
    }

    private string PolicyPath(AasDesignerModel.Model.AasInfrastructureSettings infrastructure)
    {
        if (string.IsNullOrWhiteSpace(settings.DppSecurityBaseDirectory))
            throw new InvalidOperationException("DPP security directory is not configured.");
        return string.IsNullOrWhiteSpace(infrastructure.ContainerGuid)
            ? Path.Combine(settings.DppSecurityBaseDirectory, "access-rules.json")
            : Path.Combine(
                settings.DppSecurityBaseDirectory,
                infrastructure.ContainerGuid,
                "access-rules.json"
            );
    }

    private string ConfigurationPath(
        AasDesignerModel.Model.AasInfrastructureSettings infrastructure
    ) => Path.Combine(Path.GetDirectoryName(PolicyPath(infrastructure))!, "aas-suite-policy.json");

    private static void Validate(DppAccessPolicyDto policy)
    {
        if (policy.Profile == "Expert")
        {
            _ = NormalizeRawPolicy(policy.RawPolicyJson);
            return;
        }
        if (policy.Rules.Count > 50)
            throw new ArgumentException("A maximum of 50 DPP access rules is supported.");
        foreach (var rule in policy.Rules)
        {
            if (string.IsNullOrWhiteSpace(rule.Name) || rule.Name.Length > 100)
                throw new ArgumentException("Every DPP access rule needs a valid name.");
            if (
                rule.Role != "anonymous"
                && (
                    string.IsNullOrWhiteSpace(rule.Role)
                    || rule.Role.Length > 100
                    || rule.Role.Any(character =>
                        !(char.IsLetterOrDigit(character) || character is '-' or '_' or '.')
                    )
                )
            )
                throw new ArgumentException("Invalid DPP role.");
            if (!DppScopes.Contains(rule.DppScope))
                throw new ArgumentException("Unknown DPP scope.");
            if (!ConditionCombinations.Contains(rule.ConditionCombination))
                throw new ArgumentException("Unknown DPP condition combination.");
            foreach (var condition in rule.DppConditions)
            {
                if (!DppMetadataFields.Contains(condition.Field))
                    throw new ArgumentException("Unknown DPP metadata field.");
                if (!ConditionOperators.Contains(condition.Operator))
                    throw new ArgumentException("Unknown DPP condition operator.");
                condition.Value = condition.Value.Trim();
                if (condition.Value.Length == 0 || condition.Value.Length > 1000)
                    throw new ArgumentException("Every DPP condition needs a valid value.");
            }
            rule.VisibleSemanticIds = rule
                .VisibleSemanticIds.Where(id => !string.IsNullOrWhiteSpace(id))
                .Select(id => id.Trim())
                .Distinct(StringComparer.Ordinal)
                .ToList();
            rule.DppIds = rule
                .DppIds.Where(id => !string.IsNullOrWhiteSpace(id))
                .Select(id => id.Trim())
                .Distinct(StringComparer.Ordinal)
                .ToList();
            if (
                rule.DppScope == "Selected"
                && rule.DppIds.Count == 0
                && rule.DppConditions.Count == 0
            )
                throw new ArgumentException("Selected DPP scope requires at least one DPP ID.");
        }
    }

    private static string NormalizeRawPolicy(string? rawPolicyJson)
    {
        if (string.IsNullOrWhiteSpace(rawPolicyJson))
            throw new ArgumentException("The expert policy must not be empty.");

        JsonDocument document;
        try
        {
            document = JsonDocument.Parse(rawPolicyJson);
        }
        catch (JsonException exception)
        {
            throw new ArgumentException("The expert policy is not valid JSON.", exception);
        }

        using (document)
        {
            if (
                document.RootElement.ValueKind != JsonValueKind.Object
                || !document.RootElement.TryGetProperty("AllAccessPermissionRules", out var rules)
                || rules.ValueKind != JsonValueKind.Object
            )
                throw new ArgumentException(
                    "The expert policy must contain an AllAccessPermissionRules object."
                );

            return JsonSerializer.Serialize(
                document.RootElement,
                new JsonSerializerOptions { WriteIndented = true }
            );
        }
    }

    private static DppAccessPolicyDto CreateProfile(long infrastructureId, string profile)
    {
        return new DppAccessPolicyDto
        {
            InfrastructureId = infrastructureId,
            Profile = "Custom",
            Rules =
            [
                new DppAccessRuleDto { Name = "anonymous_read", Role = "anonymous" },
                new DppAccessRuleDto { Name = "partner_read", Role = "partner" },
            ],
        };
    }

    private static string BuildPolicy(IEnumerable<DppAccessRuleDto> configuredRules)
    {
        var enabledRules = configuredRules
            .Where(rule => rule.Enabled)
            .Select((rule, index) => new { Rule = rule, Index = index })
            .Where(item => Routes(item.Rule).Count > 0)
            .ToList();
        var attributes = new[]
        {
            new
            {
                name = "anonymous",
                attributes = new[] { new Dictionary<string, string> { ["GLOBAL"] = "ANONYMOUS" } },
            },
            new
            {
                name = "dpp_role",
                attributes = new[] { new Dictionary<string, string> { ["CLAIM"] = "role" } },
            },
        };
        var objects = enabledRules
            .Select(item =>
                (object)
                    new
                    {
                        name = $"routes_{item.Index}",
                        objects = Routes(item.Rule)
                            .Select(route => new Dictionary<string, string> { ["ROUTE"] = route }),
                    }
            )
            .Append(
                new
                {
                    name = "policy_management_routes",
                    objects = new[]
                    {
                        new Dictionary<string, string> { ["ROUTE"] = "/security/abac" },
                        new Dictionary<string, string> { ["ROUTE"] = "/security/abac/*" },
                    }.AsEnumerable(),
                }
            );
        var acls = new object[]
        {
            new
            {
                name = "policy_admin",
                acl = new
                {
                    USEATTRIBUTES = "dpp_role",
                    RIGHTS = new[] { "ALL" },
                    ACCESS = "ALLOW",
                },
            },
        };
        var formulas = new object[]
        {
            new
            {
                name = "is_policy_admin",
                formula = new Dictionary<string, object>
                {
                    ["$eq"] = new object[]
                    {
                        new Dictionary<string, object>
                        {
                            ["$attribute"] = new Dictionary<string, string> { ["CLAIM"] = "role" },
                        },
                        new Dictionary<string, string> { ["$strVal"] = "policy-admin" },
                    },
                },
            },
        };
        var rules = enabledRules
            .Select(item => (object)BuildAccessRule(item.Rule, item.Index))
            .Append(
                new Dictionary<string, object>
                {
                    ["USEACL"] = "policy_admin",
                    ["USEOBJECTS"] = new[] { "policy_management_routes" },
                    ["USEFORMULA"] = "is_policy_admin",
                }
            );
        return JsonSerializer.Serialize(
            new
            {
                AllAccessPermissionRules = new
                {
                    DEFATTRIBUTES = attributes,
                    DEFOBJECTS = objects,
                    DEFACLS = acls,
                    DEFFORMULAS = formulas,
                    rules,
                },
            },
            new JsonSerializerOptions { WriteIndented = true }
        );
    }

    private static List<string> Routes(DppAccessRuleDto _) =>
        ["/v1/dpps/*", "/v1/dppsByProductId/*", "/v1/dppsByIdAndDate/*", "/v1/dppsByProductIds"];

    private static Dictionary<string, object> BuildAccessRule(DppAccessRuleDto rule, int index)
    {
        var anonymous = rule.Role == "anonymous";
        object subjectCondition = anonymous
            ? new Dictionary<string, object> { ["$boolean"] = true }
            : EqualsAttribute("role", rule.Role);
        var dppConditions = rule.DppConditions.Select(FieldCondition).ToList();
        if (rule.DppScope == "Selected" && dppConditions.Count == 0)
            dppConditions.AddRange(
                rule.DppIds.Select(id => EqualsField("$sme.digitalProductPassportId#value", id))
            );

        object formula = subjectCondition;
        if (dppConditions.Count > 0)
        {
            var resourceCondition = CombineConditions(dppConditions, rule.ConditionCombination);
            formula = new Dictionary<string, object>
            {
                ["$and"] = new[] { subjectCondition, resourceCondition },
            };
        }

        var result = new Dictionary<string, object>
        {
            ["USEOBJECTS"] = new[] { $"routes_{index}" },
            ["ACL"] = new Dictionary<string, object>
            {
                ["ATTRIBUTES"] = new object[]
                {
                    anonymous
                        ? new Dictionary<string, string> { ["GLOBAL"] = "ANONYMOUS" }
                        : new Dictionary<string, string> { ["CLAIM"] = "role" },
                },
                ["RIGHTS"] = new[] { "READ" },
                ["ACCESS"] = "ALLOW",
            },
            ["FORMULA"] = formula,
        };
        if (rule.VisibleSemanticIds.Count > 0)
        {
            var semanticConditions = rule
                .VisibleSemanticIds.Select(id =>
                    EqualsField("$sme.contentSpecificationIds[]#value", id)
                )
                .ToList();
            result["FILTERLIST"] = new object[]
            {
                new Dictionary<string, object>
                {
                    ["FRAGMENT"] = "$sme.contentSpecificationIds[]#value",
                    ["MATCH"] = true,
                    ["CONDITION"] = CombineConditions(semanticConditions, "Any"),
                },
            };
        }
        return result;
    }

    private static Dictionary<string, object> EqualsAttribute(string claim, string value) =>
        new()
        {
            ["$eq"] = new object[]
            {
                new Dictionary<string, object>
                {
                    ["$attribute"] = new Dictionary<string, string> { ["CLAIM"] = claim },
                },
                new Dictionary<string, string> { ["$strVal"] = value },
            },
        };

    private static Dictionary<string, object> EqualsField(string field, string value) =>
        new()
        {
            ["$eq"] = new object[]
            {
                new Dictionary<string, string> { ["$field"] = field },
                new Dictionary<string, string> { ["$strVal"] = value },
            },
        };

    private static Dictionary<string, object> FieldCondition(DppFieldConditionDto condition)
    {
        var queryOperator = condition.Operator switch
        {
            "Equal" => "$eq",
            "NotEqual" => "$ne",
            "Contains" => "$contains",
            "StartsWith" => "$starts-with",
            "EndsWith" => "$ends-with",
            "Regex" => "$regex",
            _ => throw new ArgumentException("Unknown DPP condition operator."),
        };
        return new Dictionary<string, object>
        {
            [queryOperator] = new object[]
            {
                new Dictionary<string, string> { ["$field"] = $"$sme.{condition.Field}#value" },
                new Dictionary<string, string> { ["$strVal"] = condition.Value },
            },
        };
    }

    private static object CombineConditions(
        IReadOnlyList<Dictionary<string, object>> conditions,
        string combination
    )
    {
        return conditions.Count == 1
            ? conditions[0]
            : new Dictionary<string, object>
            {
                [combination == "All" ? "$and" : "$or"] = conditions,
            };
    }
}
