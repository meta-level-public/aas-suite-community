using AasDesignerSystemManagementApi.SystemManagement.Model;

namespace AasDesignerSystemManagementApi.SystemManagement.MailSettings;

/// <summary>
/// SMTP passwords never leave the server: responses only tell whether a password is stored,
/// and an empty password in a request keeps the stored one.
/// </summary>
public static class MailSettingsSecrets
{
    public static MailSettingsDto WithoutPasswords(MailSettingsDto settings)
    {
        settings.Application.HasSenderPassword = !string.IsNullOrEmpty(
            settings.Application.SenderPassword
        );
        settings.Application.SenderPassword = string.Empty;
        settings.Keycloak.HasPassword = !string.IsNullOrEmpty(settings.Keycloak.Password);
        settings.Keycloak.Password = string.Empty;
        return settings;
    }

    public static MailSettingsDto KeepStoredPasswords(
        MailSettingsDto incoming,
        MailSettingsDto stored
    )
    {
        KeepStoredPassword(incoming.Application, stored.Application);
        KeepStoredPassword(incoming.Keycloak, stored.Keycloak);
        return incoming;
    }

    public static ApplicationMailSettingsDto KeepStoredPassword(
        ApplicationMailSettingsDto incoming,
        ApplicationMailSettingsDto stored
    )
    {
        if (string.IsNullOrEmpty(incoming.SenderPassword))
        {
            incoming.SenderPassword = stored.SenderPassword;
        }
        return incoming;
    }

    public static KeycloakMailSettingsDto KeepStoredPassword(
        KeycloakMailSettingsDto incoming,
        KeycloakMailSettingsDto stored
    )
    {
        if (string.IsNullOrEmpty(incoming.Password))
        {
            incoming.Password = stored.Password;
        }
        return incoming;
    }
}
