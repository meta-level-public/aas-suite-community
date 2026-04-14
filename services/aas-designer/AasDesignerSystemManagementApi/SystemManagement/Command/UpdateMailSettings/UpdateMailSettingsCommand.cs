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
        return await _mailSettingsRuntimeService.UpdateMailSettingsAsync(
            MailSettingsStore.Normalize(request.Settings),
            cancellationToken
        );
    }
}
