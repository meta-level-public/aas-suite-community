using System.Net.Mail;
using AasDesignerSystemManagementApi.SystemManagement.Model;

namespace AasDesignerSystemManagementApi.SystemManagement.MailSettings;

internal static class MailSettingsValidation
{
    public static void ValidateForUpdate(MailSettingsDto settings)
    {
        if (settings.Application.SmtpUseSsl && settings.Application.SmtpUseTls)
        {
            throw new InvalidOperationException(
                "Application mail settings cannot enable SSL and TLS at the same time."
            );
        }

        if (settings.Keycloak.Ssl && settings.Keycloak.StartTls)
        {
            throw new InvalidOperationException(
                "Keycloak mail settings cannot enable SSL and StartTLS at the same time."
            );
        }
    }

    public static string ValidateTargetEmail(string? targetEmail)
    {
        var normalizedTargetEmail = targetEmail?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(normalizedTargetEmail))
        {
            throw new InvalidOperationException("A target e-mail address is required.");
        }

        try
        {
            _ = new MailAddress(normalizedTargetEmail);
            return normalizedTargetEmail;
        }
        catch (FormatException)
        {
            throw new InvalidOperationException("The target e-mail address is invalid.");
        }
    }
}
