using AasDesignerSystemManagementApi.SystemManagement.LegalLinks;
using AasDesignerSystemManagementApi.SystemManagement.Model;
using MediatR;

namespace AasDesignerSystemManagementApi.SystemManagement.Command.UpdateLegalLinksSettings;

public class UpdateLegalLinksSettingsCommand : IRequest<LegalLinksSettingsDto>
{
    public UpdateLegalLinksSettingsRequest Request { get; set; } = new();
}

public class UpdateLegalLinksSettingsHandler
    : IRequestHandler<UpdateLegalLinksSettingsCommand, LegalLinksSettingsDto>
{
    private readonly ILegalLinksSettingsRuntimeService _legalLinksSettingsRuntimeService;

    public UpdateLegalLinksSettingsHandler(
        ILegalLinksSettingsRuntimeService legalLinksSettingsRuntimeService
    )
    {
        _legalLinksSettingsRuntimeService = legalLinksSettingsRuntimeService;
    }

    public async Task<LegalLinksSettingsDto> Handle(
        UpdateLegalLinksSettingsCommand command,
        CancellationToken cancellationToken
    )
    {
        LegalLinksSettingsValidation.ValidateForUpdate(command.Request);
        return await _legalLinksSettingsRuntimeService.UpdateLegalLinksSettingsAsync(
            command.Request,
            cancellationToken
        );
    }
}
