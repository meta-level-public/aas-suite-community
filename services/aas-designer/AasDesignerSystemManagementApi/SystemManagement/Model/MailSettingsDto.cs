namespace AasDesignerSystemManagementApi.SystemManagement.Model;

public class MailSettingsDto
{
    public bool KeycloakEnabled { get; set; }
    public bool CanManageKeycloakMailSettings { get; set; }
    public ApplicationMailSettingsDto Application { get; set; } = new();
    public KeycloakMailSettingsDto Keycloak { get; set; } = new();
}

public class ApplicationMailSettingsDto
{
    public string SmtpServer { get; set; } = string.Empty;
    public int SmtpPort { get; set; } = 587;
    public bool SmtpUseSsl { get; set; }
    public bool SmtpUseTls { get; set; }
    public bool SmtpNeedsAuthentication { get; set; }
    public string SenderAddress { get; set; } = string.Empty;
    public string SenderUsername { get; set; } = string.Empty;
    public string SenderPassword { get; set; } = string.Empty;
    public string NewOrgaNotificationAddress { get; set; } = string.Empty;
    public string SubjectPrefix { get; set; } = string.Empty;
}

public class KeycloakMailSettingsDto
{
    public string Host { get; set; } = string.Empty;
    public string Port { get; set; } = string.Empty;
    public string From { get; set; } = string.Empty;
    public string FromDisplayName { get; set; } = string.Empty;
    public string ReplyTo { get; set; } = string.Empty;
    public string ReplyToDisplayName { get; set; } = string.Empty;
    public string User { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public bool Auth { get; set; }
    public bool StartTls { get; set; }
    public bool Ssl { get; set; }
}

public interface IMailSettingsRuntimeService
{
    ApplicationMailSettingsDto GetApplicationMailSettings();
    Task<MailSettingsDto> GetMailSettingsAsync(CancellationToken cancellationToken);
    Task<MailSettingsDto> UpdateMailSettingsAsync(
        MailSettingsDto settings,
        CancellationToken cancellationToken
    );
    Task SendApplicationTestMailAsync(
        ApplicationMailSettingsDto settings,
        string targetEmail,
        CancellationToken cancellationToken
    );
    Task SendKeycloakTestMailAsync(
        KeycloakMailSettingsDto settings,
        string targetEmail,
        CancellationToken cancellationToken
    );
}
