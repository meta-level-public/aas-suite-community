using System.Text.Json;
using AasDesignerApi.Model;
using AasDesignerModel;
using AasDesignerSystemManagementApi.SystemManagement.Model;
using Microsoft.EntityFrameworkCore;

namespace AasDesignerSystemManagementApi.SystemManagement.MailSettings;

public static class MailSettingsStore
{
    public const string SettingName = "MailSettingsV1";

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    public static MailSettingsDto Load(IApplicationDbContext context, MailSettingsDto fallback)
    {
        var stored = context
            .PersistentSettings.AsNoTracking()
            .Where(s => s.Name == SettingName)
            .Select(s => s.Value)
            .FirstOrDefault();

        return MergeWithFallback(Deserialize(stored), fallback);
    }

    public static async Task<MailSettingsDto> LoadAsync(
        IApplicationDbContext context,
        MailSettingsDto fallback,
        CancellationToken cancellationToken
    )
    {
        var stored = await context
            .PersistentSettings.AsNoTracking()
            .Where(s => s.Name == SettingName)
            .Select(s => s.Value)
            .FirstOrDefaultAsync(cancellationToken);

        return MergeWithFallback(Deserialize(stored), fallback);
    }

    public static async Task SaveAsync(
        IApplicationDbContext context,
        MailSettingsDto settings,
        CancellationToken cancellationToken
    )
    {
        var normalized = Normalize(settings);
        var json = JsonSerializer.Serialize(normalized);

        var setting = await context.PersistentSettings.FirstOrDefaultAsync(
            s => s.Name == SettingName,
            cancellationToken
        );

        if (setting == null)
        {
            setting = new PersistentSetting { Name = SettingName, Value = json };
            context.PersistentSettings.Add(setting);
        }
        else
        {
            setting.Value = json;
            context.PersistentSettings.Update(setting);
        }

        await context.SaveChangesAsync(cancellationToken);
    }

    public static MailSettingsDto Normalize(MailSettingsDto settings)
    {
        var normalized = new MailSettingsDto
        {
            Application = new ApplicationMailSettingsDto
            {
                SmtpServer = settings.Application.SmtpServer?.Trim() ?? string.Empty,
                SmtpPort = settings.Application.SmtpPort,
                SmtpUseSsl = settings.Application.SmtpUseSsl,
                SmtpUseTls = settings.Application.SmtpUseTls,
                SmtpNeedsAuthentication = settings.Application.SmtpNeedsAuthentication,
                SenderAddress = settings.Application.SenderAddress?.Trim() ?? string.Empty,
                SenderUsername = settings.Application.SenderUsername?.Trim() ?? string.Empty,
                SenderPassword = settings.Application.SenderPassword ?? string.Empty,
                NewOrgaNotificationAddress =
                    settings.Application.NewOrgaNotificationAddress?.Trim() ?? string.Empty,
                SubjectPrefix = settings.Application.SubjectPrefix ?? string.Empty,
            },
            Keycloak = new KeycloakMailSettingsDto
            {
                Host = settings.Keycloak.Host?.Trim() ?? string.Empty,
                Port = settings.Keycloak.Port?.Trim() ?? string.Empty,
                From = settings.Keycloak.From?.Trim() ?? string.Empty,
                FromDisplayName = settings.Keycloak.FromDisplayName?.Trim() ?? string.Empty,
                ReplyTo = settings.Keycloak.ReplyTo?.Trim() ?? string.Empty,
                ReplyToDisplayName = settings.Keycloak.ReplyToDisplayName?.Trim() ?? string.Empty,
                User = settings.Keycloak.User?.Trim() ?? string.Empty,
                Password = settings.Keycloak.Password ?? string.Empty,
                Auth = settings.Keycloak.Auth,
                StartTls = settings.Keycloak.StartTls,
                Ssl = settings.Keycloak.Ssl,
            },
        };

        if (normalized.Application.SmtpPort <= 0)
        {
            normalized.Application.SmtpPort = 587;
        }

        return normalized;
    }

    private static MailSettingsDto Deserialize(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
        {
            return new MailSettingsDto();
        }

        try
        {
            return JsonSerializer.Deserialize<MailSettingsDto>(json, JsonOptions)
                ?? new MailSettingsDto();
        }
        catch
        {
            return new MailSettingsDto();
        }
    }

    private static MailSettingsDto MergeWithFallback(
        MailSettingsDto stored,
        MailSettingsDto fallback
    )
    {
        var normalizedFallback = Normalize(fallback);
        var normalizedStored = Normalize(stored);

        return new MailSettingsDto
        {
            Application = new ApplicationMailSettingsDto
            {
                SmtpServer = Choose(
                    normalizedStored.Application.SmtpServer,
                    normalizedFallback.Application.SmtpServer
                ),
                SmtpPort =
                    normalizedStored.Application.SmtpPort > 0
                        ? normalizedStored.Application.SmtpPort
                        : normalizedFallback.Application.SmtpPort,
                SmtpUseSsl = normalizedStored.Application.SmtpUseSsl,
                SmtpUseTls = normalizedStored.Application.SmtpUseTls,
                SmtpNeedsAuthentication = normalizedStored.Application.SmtpNeedsAuthentication,
                SenderAddress = Choose(
                    normalizedStored.Application.SenderAddress,
                    normalizedFallback.Application.SenderAddress
                ),
                SenderUsername = Choose(
                    normalizedStored.Application.SenderUsername,
                    normalizedFallback.Application.SenderUsername
                ),
                SenderPassword = Choose(
                    normalizedStored.Application.SenderPassword,
                    normalizedFallback.Application.SenderPassword
                ),
                NewOrgaNotificationAddress = Choose(
                    normalizedStored.Application.NewOrgaNotificationAddress,
                    normalizedFallback.Application.NewOrgaNotificationAddress
                ),
                SubjectPrefix = Choose(
                    normalizedStored.Application.SubjectPrefix,
                    normalizedFallback.Application.SubjectPrefix
                ),
            },
            Keycloak = new KeycloakMailSettingsDto
            {
                Host = Choose(normalizedStored.Keycloak.Host, normalizedFallback.Keycloak.Host),
                Port = Choose(normalizedStored.Keycloak.Port, normalizedFallback.Keycloak.Port),
                From = Choose(normalizedStored.Keycloak.From, normalizedFallback.Keycloak.From),
                FromDisplayName = Choose(
                    normalizedStored.Keycloak.FromDisplayName,
                    normalizedFallback.Keycloak.FromDisplayName
                ),
                ReplyTo = Choose(
                    normalizedStored.Keycloak.ReplyTo,
                    normalizedFallback.Keycloak.ReplyTo
                ),
                ReplyToDisplayName = Choose(
                    normalizedStored.Keycloak.ReplyToDisplayName,
                    normalizedFallback.Keycloak.ReplyToDisplayName
                ),
                User = Choose(normalizedStored.Keycloak.User, normalizedFallback.Keycloak.User),
                Password = Choose(
                    normalizedStored.Keycloak.Password,
                    normalizedFallback.Keycloak.Password
                ),
                Auth = normalizedStored.Keycloak.Auth,
                StartTls = normalizedStored.Keycloak.StartTls,
                Ssl = normalizedStored.Keycloak.Ssl,
            },
        };
    }

    private static string Choose(string value, string fallback)
    {
        return string.IsNullOrWhiteSpace(value) ? fallback : value;
    }
}
