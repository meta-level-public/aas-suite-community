using AasDesignerSystemManagementApi.SystemManagement.MailSettings;
using AasDesignerSystemManagementApi.SystemManagement.Model;
using MediatR;

namespace AasDesignerSystemManagementApi.SystemManagement.Command.UpdateMailSettings;

public class UpdateMailSettingsCommand : IRequest<MailSettingsDto>
{
    public MailSettingsDto Settings { get; set; } = new();
}

public class UpdateMailSettingsHandler : IRequestHandler<UpdateMailSettingsCommand, MailSettingsDto>
{
    private readonly IMailSettingsRuntimeService _mailSettingsRuntimeService;

    public UpdateMailSettingsHandler(IMailSettingsRuntimeService mailSettingsRuntimeService)
    {
        _mailSettingsRuntimeService = mailSettingsRuntimeService;
    }

    public async Task<MailSettingsDto> Handle(
        UpdateMailSettingsCommand request,
        CancellationToken cancellationToken
    )
    {
        MailSettingsValidation.ValidateForUpdate(request.Settings);
        var stored = await _mailSettingsRuntimeService.GetMailSettingsAsync(cancellationToken);
        var settings = MailSettingsSecrets.KeepStoredPasswords(
            MailSettingsStore.Normalize(request.Settings),
            stored
        );
        return MailSettingsSecrets.WithoutPasswords(
            await _mailSettingsRuntimeService.UpdateMailSettingsAsync(settings, cancellationToken)
        );
    }
}
