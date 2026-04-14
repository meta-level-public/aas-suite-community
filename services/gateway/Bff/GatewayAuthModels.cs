using System.Text.Json.Serialization;

namespace gateway.Bff;

public sealed class GatewayAuthResponse
{
    public long Id { get; set; }
    public string Vorname { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string LoginName { get; set; } = string.Empty;
    public string ProfilbildBase64 { get; set; } = string.Empty;
    public string JwtToken { get; set; } = string.Empty;
    public List<string> Rollen { get; set; } = [];
    public string RefreshToken { get; set; } = string.Empty;
    public object? Einstellungen { get; set; }
    public List<GatewayOrgaSettings> OrgaSettings { get; set; } = [];
    public long? PreferredOrgaId { get; set; }
    public string ResultCode { get; set; } = string.Empty;
    public string AdditionalMessage { get; set; } = string.Empty;

    public GatewayAuthResponse Sanitize()
    {
        return new GatewayAuthResponse
        {
            Id = Id,
            Vorname = Vorname,
            Name = Name,
            LoginName = LoginName,
            ProfilbildBase64 = ProfilbildBase64,
            JwtToken = string.Empty,
            Rollen = [.. Rollen],
            RefreshToken = string.Empty,
            Einstellungen = Einstellungen,
            OrgaSettings = [.. OrgaSettings.Select(orga => orga.Clone())],
            PreferredOrgaId = PreferredOrgaId,
            ResultCode = ResultCode,
            AdditionalMessage = AdditionalMessage,
        };
    }

    public GatewayAuthResponse Clone()
    {
        return new GatewayAuthResponse
        {
            Id = Id,
            Vorname = Vorname,
            Name = Name,
            LoginName = LoginName,
            ProfilbildBase64 = ProfilbildBase64,
            JwtToken = JwtToken,
            Rollen = [.. Rollen],
            RefreshToken = RefreshToken,
            Einstellungen = Einstellungen,
            OrgaSettings = [.. OrgaSettings.Select(orga => orga.Clone())],
            PreferredOrgaId = PreferredOrgaId,
            ResultCode = ResultCode,
            AdditionalMessage = AdditionalMessage,
        };
    }
}

public sealed class GatewayOrgaSettings
{
    public string OrgaName { get; set; } = string.Empty;
    public long OrgaId { get; set; }
    public string IriPrefix { get; set; } = string.Empty;
    public string ThemeUrl { get; set; } = string.Empty;
    public string RegistryUrl { get; set; } = string.Empty;
    public string AasServerUrl { get; set; } = string.Empty;
    public List<string> Rollen { get; set; } = [];
    public string LogoBase64 { get; set; } = string.Empty;
    public DateTime? LicenseExpiry { get; set; }

    public GatewayOrgaSettings Clone()
    {
        return new GatewayOrgaSettings
        {
            OrgaName = OrgaName,
            OrgaId = OrgaId,
            IriPrefix = IriPrefix,
            ThemeUrl = ThemeUrl,
            RegistryUrl = RegistryUrl,
            AasServerUrl = AasServerUrl,
            Rollen = [.. Rollen],
            LogoBase64 = LogoBase64,
            LicenseExpiry = LicenseExpiry,
        };
    }
}

public sealed class GatewaySessionState
{
    public GatewayAuthResponse AuthResponse { get; set; } = new();
    public GatewayOidcSessionState? OidcSession { get; set; }

    public GatewaySessionState Clone()
    {
        return new GatewaySessionState
        {
            AuthResponse = AuthResponse.Clone(),
            OidcSession = OidcSession?.Clone(),
        };
    }
}

public sealed class GatewayOidcSessionState
{
    public string SsoSource { get; set; } = string.Empty;
    public string IdToken { get; set; } = string.Empty;

    public GatewayOidcSessionState Clone()
    {
        return new GatewayOidcSessionState { SsoSource = SsoSource, IdToken = IdToken };
    }
}

public sealed class PendingOidcState
{
    public string State { get; set; } = string.Empty;
    public string CodeVerifier { get; set; } = string.Empty;
    public string SsoSource { get; set; } = string.Empty;
    public string ReturnUrl { get; set; } = "/dashboard";
}

public sealed class GatewaySsoSourceConfiguration
{
    public string AuthorizationUrl { get; set; } = string.Empty;
    public string InternalAuthorizationUrl { get; set; } = string.Empty;
    public string ClientId { get; set; } = string.Empty;
    public string ClientSecret { get; set; } = string.Empty;
    public string Scopes { get; set; } = string.Empty;
    public string WellKnownUrl { get; set; } = string.Empty;
    public string InternalWellKnownUrl { get; set; } = string.Empty;
}

public sealed class GatewaySystemConfiguration
{
    public string SsoConfigName { get; set; } = string.Empty;
}

public sealed class OidcDiscoveryDocument
{
    [JsonPropertyName("authorization_endpoint")]
    public string AuthorizationEndpoint { get; set; } = string.Empty;

    [JsonPropertyName("token_endpoint")]
    public string TokenEndpoint { get; set; } = string.Empty;

    [JsonPropertyName("end_session_endpoint")]
    public string EndSessionEndpoint { get; set; } = string.Empty;
}

public sealed class OidcTokenResponse
{
    [JsonPropertyName("access_token")]
    public string AccessToken { get; set; } = string.Empty;

    [JsonPropertyName("id_token")]
    public string IdToken { get; set; } = string.Empty;
}

public sealed class GatewayLogoutResponse
{
    public string LogoutUrl { get; set; } = string.Empty;
}
