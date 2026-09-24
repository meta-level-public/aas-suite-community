using Microsoft.Extensions.Options;

namespace DppGateway;

public enum DppGatewayMode
{
    SingleTenant,
    MultiTenant,
}

public sealed class DppGatewayOptions
{
    public const long DefaultMaximumResponseBytes = 10 * 1024 * 1024;
    public const int DefaultPublicRateLimitPermitLimit = 1200;

    public DppGatewayMode Mode { get; set; } = DppGatewayMode.SingleTenant;
    public long MaximumResponseBytes { get; set; } = DefaultMaximumResponseBytes;
    public int PublicRateLimitPermitLimit { get; set; } = DefaultPublicRateLimitPermitLimit;
    public int PublicRateLimitWindowSeconds { get; set; } = 60;
    public string PublicationRegistryConnectionString { get; set; } = string.Empty;
    public string PublisherAuthority { get; set; } = string.Empty;
    public string PublisherMetadataAddress { get; set; } = string.Empty;
    public string PublisherValidIssuer { get; set; } = string.Empty;
    public bool PublisherRequireHttpsMetadata { get; set; } = true;
    public string PublisherAudience { get; set; } = "dpp-gateway-management";
    public string AccessTokenAudience { get; set; } = "aas-designer-local";
    public string SingleTenantInfrastructureId { get; set; } = "single-tenant";
    public string MultiTenantUpstreamBaseUrlTemplate { get; set; } = string.Empty;
    public string MultiTenantAttachmentBaseUrlTemplate { get; set; } = string.Empty;
    public DppOAuthOptions MultiTenantOAuth { get; set; } = new();
    public string SingleTenantUpstreamBaseUrl { get; set; } = string.Empty;
    public string SingleTenantAttachmentBaseUrl { get; set; } = string.Empty;
    public DppOAuthOptions SingleTenantOAuth { get; set; } = new();
    public List<DppInfrastructureOptions> Infrastructures { get; set; } = [];
    public List<DppRouteOptions> Routes { get; set; } = [];
}

public sealed class DppInfrastructureOptions
{
    public string InfrastructureId { get; set; } = string.Empty;
    public string UpstreamBaseUrl { get; set; } = string.Empty;
    public string AttachmentBaseUrl { get; set; } = string.Empty;
    public DppOAuthOptions OAuth { get; set; } = new();
}

public sealed class DppOAuthOptions
{
    public bool Enabled { get; set; }
    public string TokenEndpoint { get; set; } = string.Empty;
    public string ClientId { get; set; } = string.Empty;
    public string ClientSecret { get; set; } = string.Empty;
    public string Scope { get; set; } = string.Empty;
    public bool TokenExchangeEnabled { get; set; }
    public string Audience { get; set; } = string.Empty;
}

public sealed class DppRouteOptions
{
    public string DppId { get; set; } = string.Empty;
    public string InfrastructureId { get; set; } = string.Empty;
}

public sealed class DppGatewayOptionsValidator : IValidateOptions<DppGatewayOptions>
{
    public ValidateOptionsResult Validate(string? name, DppGatewayOptions options)
    {
        if (options.MaximumResponseBytes is <= 0 or > 100 * 1024 * 1024)
            return ValidateOptionsResult.Fail(
                "DppGateway:MaximumResponseBytes must be between 1 and 104857600."
            );
        if (options.PublicRateLimitPermitLimit <= 0)
            return ValidateOptionsResult.Fail(
                "DppGateway:PublicRateLimitPermitLimit must be greater than zero."
            );
        if (options.PublicRateLimitWindowSeconds is <= 0 or > 3600)
            return ValidateOptionsResult.Fail(
                "DppGateway:PublicRateLimitWindowSeconds must be between 1 and 3600."
            );
        if (string.IsNullOrWhiteSpace(options.PublicationRegistryConnectionString))
            return ValidateOptionsResult.Fail(
                "DppGateway:PublicationRegistryConnectionString must not be empty."
            );

        if (options.Mode == DppGatewayMode.SingleTenant)
        {
            if (!IsValidUpstreamBaseUrl(options.SingleTenantUpstreamBaseUrl))
                return ValidateOptionsResult.Fail(
                    "SingleTenant mode requires a valid SingleTenantUpstreamBaseUrl."
                );
            if (!IsValidUpstreamBaseUrl(options.SingleTenantAttachmentBaseUrl))
                return ValidateOptionsResult.Fail(
                    "SingleTenant mode requires a valid SingleTenantAttachmentBaseUrl."
                );
            return ValidateOAuth(options.SingleTenantOAuth, "SingleTenantOAuth");
        }

        var knownInfrastructureIds = options
            .Infrastructures.Select(x => x.InfrastructureId.Trim())
            .ToHashSet(StringComparer.Ordinal);
        if (!string.IsNullOrWhiteSpace(options.MultiTenantUpstreamBaseUrlTemplate))
        {
            if (!options.MultiTenantUpstreamBaseUrlTemplate.Contains("{infrastructureId}"))
                return ValidateOptionsResult.Fail(
                    "MultiTenantUpstreamBaseUrlTemplate requires the {infrastructureId} placeholder."
                );
            var exampleUrl = options.MultiTenantUpstreamBaseUrlTemplate.Replace(
                "{infrastructureId}",
                "00000000-0000-0000-0000-000000000000",
                StringComparison.Ordinal
            );
            if (!IsValidUpstreamBaseUrl(exampleUrl))
                return ValidateOptionsResult.Fail("MultiTenantUpstreamBaseUrlTemplate is invalid.");
            var sharedOAuthResult = ValidateOAuth(options.MultiTenantOAuth, "MultiTenantOAuth");
            if (sharedOAuthResult.Failed)
                return sharedOAuthResult;
        }
        else if (knownInfrastructureIds.Count == 0)
            return ValidateOptionsResult.Fail(
                "MultiTenant mode requires infrastructures or a URL template."
            );
        var duplicateInfrastructure = options
            .Infrastructures.GroupBy(x => x.InfrastructureId.Trim(), StringComparer.Ordinal)
            .FirstOrDefault(group => group.Key.Length > 0 && group.Count() > 1);
        if (duplicateInfrastructure != null)
            return ValidateOptionsResult.Fail(
                $"Duplicate DPP infrastructure: {duplicateInfrastructure.Key}"
            );
        foreach (var infrastructure in options.Infrastructures)
        {
            if (string.IsNullOrWhiteSpace(infrastructure.InfrastructureId))
                return ValidateOptionsResult.Fail("Every DPP infrastructure requires an ID.");
            if (!IsValidUpstreamBaseUrl(infrastructure.UpstreamBaseUrl))
                return ValidateOptionsResult.Fail(
                    $"Invalid upstream URL for infrastructure {infrastructure.InfrastructureId}."
                );
            if (!IsValidUpstreamBaseUrl(infrastructure.AttachmentBaseUrl))
                return ValidateOptionsResult.Fail(
                    $"Invalid attachment URL for infrastructure {infrastructure.InfrastructureId}."
                );
            var oauthResult = ValidateOAuth(
                infrastructure.OAuth,
                $"Infrastructure {infrastructure.InfrastructureId} OAuth"
            );
            if (oauthResult.Failed)
                return oauthResult;
        }

        if (!string.IsNullOrWhiteSpace(options.MultiTenantUpstreamBaseUrlTemplate))
        {
            if (!options.MultiTenantAttachmentBaseUrlTemplate.Contains("{infrastructureId}"))
                return ValidateOptionsResult.Fail(
                    "MultiTenantAttachmentBaseUrlTemplate requires the {infrastructureId} placeholder."
                );
            var exampleAttachmentUrl = options.MultiTenantAttachmentBaseUrlTemplate.Replace(
                "{infrastructureId}",
                "00000000-0000-0000-0000-000000000000",
                StringComparison.Ordinal
            );
            if (!IsValidUpstreamBaseUrl(exampleAttachmentUrl))
                return ValidateOptionsResult.Fail(
                    "MultiTenantAttachmentBaseUrlTemplate is invalid."
                );
        }

        return ValidateOptionsResult.Success;
    }

    private static ValidateOptionsResult ValidateOAuth(DppOAuthOptions oauth, string name)
    {
        if (!oauth.Enabled)
            return ValidateOptionsResult.Success;
        if (
            !IsValidUpstreamBaseUrl(oauth.TokenEndpoint)
            || string.IsNullOrWhiteSpace(oauth.ClientId)
            || string.IsNullOrWhiteSpace(oauth.ClientSecret)
        )
            return ValidateOptionsResult.Fail(
                $"{name} requires token endpoint, client ID and client secret."
            );
        return ValidateOptionsResult.Success;
    }

    internal static bool IsValidUpstreamBaseUrl(string value) =>
        Uri.TryCreate(value, UriKind.Absolute, out var uri)
        && uri.Scheme is "http" or "https"
        && string.IsNullOrEmpty(uri.UserInfo)
        && string.IsNullOrEmpty(uri.Query)
        && string.IsNullOrEmpty(uri.Fragment);
}
