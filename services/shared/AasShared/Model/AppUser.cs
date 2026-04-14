namespace AasShared.Model;

public class AppUser
{
    public long BenutzerId { get; set; }
    public long OrganisationId { get; set; }
    public List<string> BenutzerRollen { get; set; } = [];
    public string JwtToken { get; set; } = string.Empty;
    public string CurrrentLanguage { get; set; } = "en";
    public string CurrentPersonalAccessToken { get; set; } = string.Empty;
    public DateTime CurrentPersonalAccessTokenValidUntil { get; set; }

    // Simple properties to avoid complex dependencies
    public long? InfrastructureSettingsId { get; set; }
}
