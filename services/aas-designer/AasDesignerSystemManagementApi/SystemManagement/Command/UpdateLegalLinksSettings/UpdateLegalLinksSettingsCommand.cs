using AasDesignerSystemManagementApi.SystemManagement.LegalLinks;
using AasDesignerSystemManagementApi.SystemManagement.Model;
using MediatR;

namespace AasDesignerSystemManagementApi.SystemManagement.Command.UpdateLegalLinksSettings;

public class UpdateLegalLinksSettingsCommand : IRequest<LegalLinksSettingsDto>
{
    public LegalLinksSettingsDto Settings { get; set; } = new();
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
        UpdateLegalLinksSettingsCommand request,
        CancellationToken cancellationToken
    )
    {
        LegalLinksSettingsValidation.ValidateForUpdate(request.Settings);
        return await _legalLinksSettingsRuntimeService.UpdateLegalLinksSettingsAsync(
            LegalLinksSettingsStore.Normalize(request.Settings),
            cancellationToken
        );
    }
}
