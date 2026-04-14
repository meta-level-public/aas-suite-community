using AasDesignerApi.Authorization;
using AasDesignerApi.Model.Configuration;
using AasDesignerModel;
using AasDesignerSystemManagementApi.SystemManagement.MailSettings;
using AasDesignerSystemManagementApi.SystemManagement.Model;
using AasShared.Configuration;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace AasDesignerApi.Mail
{
    public class MailService
    {
        private readonly IMailSettingsRuntimeService _mailSettingsRuntimeService;

        public MailService(IMailSettingsRuntimeService mailSettingsRuntimeService)
        {
            _mailSettingsRuntimeService = mailSettingsRuntimeService;
        }

        public void SendMail(string email, string subject, string body, bool isHtml = false)
        {
            var emailConfig = _mailSettingsRuntimeService.GetApplicationMailSettings();

            MailDelivery.SendMail(emailConfig, email, subject, body, isHtml);
        }
    }

    internal static class MailDelivery
    {
        public static void SendMail(
            ApplicationMailSettingsDto emailConfig,
            string email,
            string subject,
            string body,
            bool isHtml = false
        )
        {
            using var client = new SmtpClient();
            Connect(client, emailConfig);

            if (emailConfig.SmtpNeedsAuthentication)
            {
                client.Authenticate(emailConfig.SenderUsername, emailConfig.SenderPassword);
            }

            var message = CreateMessage(emailConfig, email, subject, body, isHtml);
            client.Send(message);
            client.Disconnect(true);
        }

        public static async Task SendMailAsync(
            ApplicationMailSettingsDto emailConfig,
            string email,
            string subject,
            string body,
            CancellationToken cancellationToken,
            bool isHtml = false
        )
        {
            using var client = new SmtpClient();
            await ConnectAsync(client, emailConfig, cancellationToken);

            if (emailConfig.SmtpNeedsAuthentication)
            {
                await client.AuthenticateAsync(
                    emailConfig.SenderUsername,
                    emailConfig.SenderPassword,
                    cancellationToken
                );
            }

            var message = CreateMessage(emailConfig, email, subject, body, isHtml);
            await client.SendAsync(message, cancellationToken);
            await client.DisconnectAsync(true, cancellationToken);
        }

        private static MimeMessage CreateMessage(
            ApplicationMailSettingsDto emailConfig,
            string email,
            string subject,
            string body,
            bool isHtml
        )
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress("[AAS Designer]", emailConfig.SenderAddress));
            message.To.Add(new MailboxAddress(email, email));
            message.Subject = emailConfig.SubjectPrefix + subject;

            if (isHtml)
            {
                message.Body = new TextPart(MimeKit.Text.TextFormat.Html) { Text = body };
            }
            else
            {
                message.Body = new TextPart(MimeKit.Text.TextFormat.Text) { Text = body };
            }

            return message;
        }

        private static void Connect(SmtpClient client, ApplicationMailSettingsDto emailConfig)
        {
            if (emailConfig.SmtpUseSsl)
            {
                client.Connect(
                    emailConfig.SmtpServer,
                    emailConfig.SmtpPort,
                    SecureSocketOptions.SslOnConnect
                );
            }
            else if (emailConfig.SmtpUseTls)
            {
                client.Connect(
                    emailConfig.SmtpServer,
                    emailConfig.SmtpPort,
                    SecureSocketOptions.StartTls
                );
            }
            else
            {
                client.Connect(
                    emailConfig.SmtpServer,
                    emailConfig.SmtpPort,
                    SecureSocketOptions.None
                );
            }
        }

        private static async Task ConnectAsync(
            SmtpClient client,
            ApplicationMailSettingsDto emailConfig,
            CancellationToken cancellationToken
        )
        {
            if (emailConfig.SmtpUseSsl)
            {
                await client.ConnectAsync(
                    emailConfig.SmtpServer,
                    emailConfig.SmtpPort,
                    SecureSocketOptions.SslOnConnect,
                    cancellationToken
                );
            }
            else if (emailConfig.SmtpUseTls)
            {
                await client.ConnectAsync(
                    emailConfig.SmtpServer,
                    emailConfig.SmtpPort,
                    SecureSocketOptions.StartTls,
                    cancellationToken
                );
            }
            else
            {
                await client.ConnectAsync(
                    emailConfig.SmtpServer,
                    emailConfig.SmtpPort,
                    SecureSocketOptions.None,
                    cancellationToken
                );
            }
        }
    }

    public class MailSettingsRuntimeService : IMailSettingsRuntimeService
    {
        private readonly IServiceScopeFactory _serviceScopeFactory;
        private readonly EmailConfiguration _baseEmailConfiguration;
        private readonly AppSettings _appSettings;

        public MailSettingsRuntimeService(
            IServiceScopeFactory serviceScopeFactory,
            EmailConfiguration baseEmailConfiguration,
            AppSettings appSettings
        )
        {
            _serviceScopeFactory = serviceScopeFactory;
            _baseEmailConfiguration = baseEmailConfiguration;
            _appSettings = appSettings;
        }

        public ApplicationMailSettingsDto GetApplicationMailSettings()
        {
            using var scope = _serviceScopeFactory.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();

            var settings = MailSettingsStore.Load(context, CreateFallbackSettings(null));

            ApplyCapabilityFlags(
                settings,
                scope.ServiceProvider.GetRequiredService<KeycloakAdminService>()
            );
            return settings.Application;
        }

        public async Task<MailSettingsDto> GetMailSettingsAsync(CancellationToken cancellationToken)
        {
            using var scope = _serviceScopeFactory.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();
            var keycloakAdminService =
                scope.ServiceProvider.GetRequiredService<KeycloakAdminService>();
            var fallbackKeycloakSettings = await GetLiveKeycloakSettingsAsync(
                keycloakAdminService,
                cancellationToken
            );

            var settings = await MailSettingsStore.LoadAsync(
                context,
                CreateFallbackSettings(fallbackKeycloakSettings),
                cancellationToken
            );

            if (fallbackKeycloakSettings != null)
            {
                settings.Keycloak = MapKeycloakSettings(fallbackKeycloakSettings);
            }

            ApplyCapabilityFlags(settings, keycloakAdminService);
            return settings;
        }

        public async Task<MailSettingsDto> UpdateMailSettingsAsync(
            MailSettingsDto settings,
            CancellationToken cancellationToken
        )
        {
            using var scope = _serviceScopeFactory.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();
            var keycloakAdminService =
                scope.ServiceProvider.GetRequiredService<KeycloakAdminService>();

            var normalized = MailSettingsStore.Normalize(settings);
            ApplyCapabilityFlags(normalized, keycloakAdminService);

            if (normalized.CanManageKeycloakMailSettings)
            {
                await keycloakAdminService.UpdateRealmMailSettingsAsync(
                    new KeycloakRealmMailSettings
                    {
                        Host = normalized.Keycloak.Host,
                        Port = normalized.Keycloak.Port,
                        From = normalized.Keycloak.From,
                        FromDisplayName = normalized.Keycloak.FromDisplayName,
                        ReplyTo = normalized.Keycloak.ReplyTo,
                        ReplyToDisplayName = normalized.Keycloak.ReplyToDisplayName,
                        User = normalized.Keycloak.User,
                        Password = normalized.Keycloak.Password,
                        Auth = normalized.Keycloak.Auth,
                        StartTls = normalized.Keycloak.StartTls,
                        Ssl = normalized.Keycloak.Ssl,
                    },
                    cancellationToken
                );
            }

            await MailSettingsStore.SaveAsync(context, normalized, cancellationToken);
            return await GetMailSettingsAsync(cancellationToken);
        }

        public async Task SendApplicationTestMailAsync(
            ApplicationMailSettingsDto settings,
            string targetEmail,
            CancellationToken cancellationToken
        )
        {
            var normalizedSettings = MailSettingsStore
                .Normalize(new MailSettingsDto { Application = settings })
                .Application;

            var body =
                $"Dies ist eine Testmail des VWS-Portals.\n\nZeitpunkt: {DateTimeOffset.Now:u}\nEmpfänger: {targetEmail}";

            await MailDelivery.SendMailAsync(
                normalizedSettings,
                targetEmail,
                "Testmail",
                body,
                cancellationToken
            );
        }

        public async Task SendKeycloakTestMailAsync(
            KeycloakMailSettingsDto settings,
            string targetEmail,
            CancellationToken cancellationToken
        )
        {
            using var scope = _serviceScopeFactory.CreateScope();
            var keycloakAdminService =
                scope.ServiceProvider.GetRequiredService<KeycloakAdminService>();

            if (!keycloakAdminService.IsProvisioningEnabled)
            {
                throw new InvalidOperationException(
                    "Keycloak provisioning is not enabled in this environment."
                );
            }

            var normalizedSettings = MailSettingsStore
                .Normalize(new MailSettingsDto { Keycloak = settings })
                .Keycloak;

            await keycloakAdminService.UpdateRealmMailSettingsAsync(
                new KeycloakRealmMailSettings
                {
                    Host = normalizedSettings.Host,
                    Port = normalizedSettings.Port,
                    From = normalizedSettings.From,
                    FromDisplayName = normalizedSettings.FromDisplayName,
                    ReplyTo = normalizedSettings.ReplyTo,
                    ReplyToDisplayName = normalizedSettings.ReplyToDisplayName,
                    User = normalizedSettings.User,
                    Password = normalizedSettings.Password,
                    Auth = normalizedSettings.Auth,
                    StartTls = normalizedSettings.StartTls,
                    Ssl = normalizedSettings.Ssl,
                },
                cancellationToken
            );

            await keycloakAdminService.SendUpdatePasswordTestEmailAsync(
                targetEmail,
                cancellationToken
            );
        }

        private MailSettingsDto CreateFallbackSettings(KeycloakRealmMailSettings? keycloakSettings)
        {
            return new MailSettingsDto
            {
                Application = new ApplicationMailSettingsDto
                {
                    SmtpServer = _baseEmailConfiguration.SmtpServer,
                    SmtpPort = _baseEmailConfiguration.SmtpPort,
                    SmtpUseSsl = _baseEmailConfiguration.SmtpUseSSL,
                    SmtpUseTls = _baseEmailConfiguration.SmtpUseTLS,
                    SmtpNeedsAuthentication = _baseEmailConfiguration.SmtpNeedsAuthentication,
                    SenderAddress = _baseEmailConfiguration.SenderAddress,
                    SenderUsername = _baseEmailConfiguration.SenderUsername,
                    SenderPassword = _baseEmailConfiguration.SenderPassword,
                    NewOrgaNotificationAddress = _baseEmailConfiguration.NewOrgaNotificationAddress,
                    SubjectPrefix = _baseEmailConfiguration.SubjectPrefix,
                },
                Keycloak =
                    keycloakSettings == null
                        ? new KeycloakMailSettingsDto()
                        : MapKeycloakSettings(keycloakSettings),
            };
        }

        private async Task<KeycloakRealmMailSettings?> GetLiveKeycloakSettingsAsync(
            KeycloakAdminService keycloakAdminService,
            CancellationToken cancellationToken
        )
        {
            if (!keycloakAdminService.IsProvisioningEnabled)
            {
                return null;
            }

            return await keycloakAdminService.GetRealmMailSettingsAsync(cancellationToken);
        }

        private void ApplyCapabilityFlags(
            MailSettingsDto settings,
            KeycloakAdminService keycloakAdminService
        )
        {
            settings.KeycloakEnabled = _appSettings.KeycloakEnabled;
            settings.CanManageKeycloakMailSettings = keycloakAdminService.IsProvisioningEnabled;
        }

        private static KeycloakMailSettingsDto MapKeycloakSettings(
            KeycloakRealmMailSettings settings
        )
        {
            return new KeycloakMailSettingsDto
            {
                Host = settings.Host,
                Port = settings.Port,
                From = settings.From,
                FromDisplayName = settings.FromDisplayName,
                ReplyTo = settings.ReplyTo,
                ReplyToDisplayName = settings.ReplyToDisplayName,
                User = settings.User,
                Password = settings.Password,
                Auth = settings.Auth,
                StartTls = settings.StartTls,
                Ssl = settings.Ssl,
            };
        }
    }
}
