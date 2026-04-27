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

public class LegalLinksDocumentInfoDto
{
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
}

public class LegalLinksDocumentUploadDto
{
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;

    /// <summary>
    /// Base64-encoded file content. Empty string signals document deletion.
    /// </summary>
    public string ContentBase64 { get; set; } = string.Empty;
}

public class UpdateLegalLinksSettingsRequest
{
    public string DatenschutzLinkDe { get; set; } = string.Empty;
    public string DatenschutzLinkEn { get; set; } = string.Empty;
    public string AgbLinkDe { get; set; } = string.Empty;
    public string AgbLinkEn { get; set; } = string.Empty;
    public string AvvLinkDe { get; set; } = string.Empty;
    public string AvvLinkEn { get; set; } = string.Empty;
    public string ImprintLink { get; set; } = string.Empty;

    public LegalLinksDocumentUploadDto? DatenschutzLinkDeDocument { get; set; }
    public LegalLinksDocumentUploadDto? DatenschutzLinkEnDocument { get; set; }
    public LegalLinksDocumentUploadDto? AgbLinkDeDocument { get; set; }
    public LegalLinksDocumentUploadDto? AgbLinkEnDocument { get; set; }
    public LegalLinksDocumentUploadDto? AvvLinkDeDocument { get; set; }
    public LegalLinksDocumentUploadDto? AvvLinkEnDocument { get; set; }
    public LegalLinksDocumentUploadDto? ImprintLinkDocument { get; set; }

    /// <summary>
    /// The base URL of the system-management API as seen by the client (e.g. https://app.example.com/designer-api/system-management-api).
    /// Required when any document is being uploaded so the serving URL can be computed.
    /// </summary>
    public string ServingBaseUrl { get; set; } = string.Empty;
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

    public LegalLinksDocumentInfoDto? DatenschutzLinkDeDocument { get; set; }
    public LegalLinksDocumentInfoDto? DatenschutzLinkEnDocument { get; set; }
    public LegalLinksDocumentInfoDto? AgbLinkDeDocument { get; set; }
    public LegalLinksDocumentInfoDto? AgbLinkEnDocument { get; set; }
    public LegalLinksDocumentInfoDto? AvvLinkDeDocument { get; set; }
    public LegalLinksDocumentInfoDto? AvvLinkEnDocument { get; set; }
    public LegalLinksDocumentInfoDto? ImprintLinkDocument { get; set; }
}

public interface ILegalLinksSettingsRuntimeService
{
    Task<LegalLinksSettingsDto> GetLegalLinksSettingsAsync(CancellationToken cancellationToken);
    Task<LegalLinksSettingsDto> UpdateLegalLinksSettingsAsync(
        UpdateLegalLinksSettingsRequest request,
        CancellationToken cancellationToken
    );
}
