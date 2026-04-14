using AasDesignerSystemManagementApi.SystemManagement.MailSettings;
using AasDesignerSystemManagementApi.SystemManagement.Model;
using MediatR;

namespace AasDesignerSystemManagementApi.SystemManagement.Command.SendKeycloakTestMail;

public class SendKeycloakTestMailCommand : IRequest<Unit>
{
    public SendKeycloakTestMailRequestDto Request { get; set; } = new();
}

public class SendKeycloakTestMailHandler : IRequestHandler<SendKeycloakTestMailCommand, Unit>
{
    private readonly IMailSettingsRuntimeService _mailSettingsRuntimeService;

    public SendKeycloakTestMailHandler(IMailSettingsRuntimeService mailSettingsRuntimeService)
    {
        _mailSettingsRuntimeService = mailSettingsRuntimeService;
    }

    public async Task<Unit> Handle(
        SendKeycloakTestMailCommand request,
        CancellationToken cancellationToken
    )
    {
        var normalizedTargetEmail = MailSettingsValidation.ValidateTargetEmail(
            request.Request.TargetEmail
        );

        var normalizedSettings = MailSettingsStore.Normalize(
            new MailSettingsDto { Keycloak = request.Request.Settings }
        );

        MailSettingsValidation.ValidateForUpdate(normalizedSettings);

        await _mailSettingsRuntimeService.SendKeycloakTestMailAsync(
            normalizedSettings.Keycloak,
            normalizedTargetEmail,
            cancellationToken
        );

        return Unit.Value;
    }
}
