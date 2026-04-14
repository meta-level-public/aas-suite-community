namespace AasDesignerSystemManagementApi.SystemManagement.Model;

public class LegalLinksConfiguration
{
    public string DatenschutzLinkDe { get; set; } = string.Empty;
    public string DatenschutzLinkEn { get; set; } = string.Empty;
    public string AgbLinkDe { get; set; } = string.Empty;
    public string AgbLinkEn { get; set; } = string.Empty;
    public string AvvLinkDe { get; set; } = string.Empty;
    public string AvvLinkEn { get; set; } = string.Empty;
    public string ImprintLink { get; set; } = string.Empty;
}

public class LegalLinksSettingsDto
{
    public string DatenschutzLinkDe { get; set; } = string.Empty;
    public string DatenschutzLinkEn { get; set; } = string.Empty;
    public string AgbLinkDe { get; set; } = string.Empty;
    public string AgbLinkEn { get; set; } = string.Empty;
    public string AvvLinkDe { get; set; } = string.Empty;
    public string AvvLinkEn { get; set; } = string.Empty;
    public string ImprintLink { get; set; } = string.Empty;
}

public interface ILegalLinksSettingsRuntimeService
{
    Task<LegalLinksSettingsDto> GetLegalLinksSettingsAsync(CancellationToken cancellationToken);
    Task<LegalLinksSettingsDto> UpdateLegalLinksSettingsAsync(
        LegalLinksSettingsDto settings,
        CancellationToken cancellationToken
    );
}
