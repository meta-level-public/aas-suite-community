namespace AasDesignerSystemManagementApi.SystemManagement.Model;

public class SendApplicationTestMailRequestDto
{
    public string TargetEmail { get; set; } = string.Empty;
    public ApplicationMailSettingsDto Settings { get; set; } = new();
}

public class SendKeycloakTestMailRequestDto
{
    public string TargetEmail { get; set; } = string.Empty;
    public KeycloakMailSettingsDto Settings { get; set; } = new();
}
