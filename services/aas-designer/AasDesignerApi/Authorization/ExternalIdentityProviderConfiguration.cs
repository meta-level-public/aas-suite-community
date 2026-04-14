namespace AasDesignerApi.Authorization;

public sealed class ExternalIdentityProviderConfiguration
{
    public string AuthorizationUrl { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;
    public byte[]? Certificate { get; set; }
    public string CertificatePassword { get; set; } = string.Empty;
    public string EMailClaimName { get; set; } = string.Empty;
    public string FirstNameClaimName { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty;
    public string LastNameClaimName { get; set; } = string.Empty;
    public string ResouceAccessName { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string WellKnownUrl { get; set; } = string.Empty;
}
