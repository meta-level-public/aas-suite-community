using AasDesignerApi.Model;
using AasDesignerModel.Model;
using AutoMapper;

namespace AasDesignerSystemManagementApi.SystemManagement.Model;

public class SystemConfigurationDto
{
    public bool SingleTenantMode { get; set; }
    public bool IsSsoAvailableSingleTenant { get; set; }
    public string SsoConfigName { get; set; } = string.Empty;
    public string SingleTenantTheme { get; set; } = string.Empty;
    public string DatenschutzLinkDe { get; set; } = string.Empty;
    public string DatenschutzLinkEn { get; set; } = string.Empty;
    public string AgbLinkDe { get; set; } = string.Empty;
    public string AgbLinkEn { get; set; } = string.Empty;
    public string AvvLinkDe { get; set; } = string.Empty;
    public string AvvLinkEn { get; set; } = string.Empty;
    public string ImprintLink { get; set; } = string.Empty;
}
