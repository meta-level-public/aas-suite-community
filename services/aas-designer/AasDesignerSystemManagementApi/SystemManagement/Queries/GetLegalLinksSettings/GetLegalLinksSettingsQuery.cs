using AasDesignerSystemManagementApi.SystemManagement.Model;
using MediatR;

namespace AasDesignerSystemManagementApi.SystemManagement.Queries.GetLegalLinksSettings;

public class GetLegalLinksSettingsQuery : IRequest<LegalLinksSettingsDto> { }

public class GetLegalLinksSettingsHandler
    : IRequestHandler<GetLegalLinksSettingsQuery, LegalLinksSettingsDto>
{
    private readonly ILegalLinksSettingsRuntimeService _legalLinksSettingsRuntimeService;

    public GetLegalLinksSettingsHandler(
        ILegalLinksSettingsRuntimeService legalLinksSettingsRuntimeService
    )
    {
        _legalLinksSettingsRuntimeService = legalLinksSettingsRuntimeService;
    }

    public async Task<LegalLinksSettingsDto> Handle(
        GetLegalLinksSettingsQuery request,
        CancellationToken cancellationToken
    )
    {
        return await _legalLinksSettingsRuntimeService.GetLegalLinksSettingsAsync(
            cancellationToken
        );
    }
}
