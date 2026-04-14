using AasDesignerSystemManagementApi.SystemManagement.MailSettings;
using AasDesignerSystemManagementApi.SystemManagement.Model;
using MediatR;

namespace AasDesignerSystemManagementApi.SystemManagement.Command.SendApplicationTestMail;

public class SendApplicationTestMailCommand : IRequest<Unit>
{
    public SendApplicationTestMailRequestDto Request { get; set; } = new();
}

public class SendApplicationTestMailHandler : IRequestHandler<SendApplicationTestMailCommand, Unit>
{
    private readonly IMailSettingsRuntimeService _mailSettingsRuntimeService;

    public SendApplicationTestMailHandler(IMailSettingsRuntimeService mailSettingsRuntimeService)
    {
        _mailSettingsRuntimeService = mailSettingsRuntimeService;
    }

    public async Task<Unit> Handle(
        SendApplicationTestMailCommand request,
        CancellationToken cancellationToken
    )
    {
        var normalizedTargetEmail = MailSettingsValidation.ValidateTargetEmail(
            request.Request.TargetEmail
        );

        var normalizedSettings = MailSettingsStore.Normalize(
            new MailSettingsDto { Application = request.Request.Settings }
        );

        MailSettingsValidation.ValidateForUpdate(normalizedSettings);

        await _mailSettingsRuntimeService.SendApplicationTestMailAsync(
            normalizedSettings.Application,
            normalizedTargetEmail,
            cancellationToken
        );

        return Unit.Value;
    }
}
