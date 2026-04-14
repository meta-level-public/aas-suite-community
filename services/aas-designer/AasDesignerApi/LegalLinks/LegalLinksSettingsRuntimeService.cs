using AasDesignerModel;
using AasDesignerSystemManagementApi.SystemManagement.LegalLinks;
using AasDesignerSystemManagementApi.SystemManagement.Model;

namespace AasDesignerApi.LegalLinks;

public class LegalLinksSettingsRuntimeService : ILegalLinksSettingsRuntimeService
{
    private readonly IServiceScopeFactory _serviceScopeFactory;
    private readonly LegalLinksConfiguration _baseConfiguration;

    public LegalLinksSettingsRuntimeService(
        IServiceScopeFactory serviceScopeFactory,
        LegalLinksConfiguration? baseConfiguration = null
    )
    {
        _serviceScopeFactory = serviceScopeFactory;
        _baseConfiguration = baseConfiguration ?? new LegalLinksConfiguration();
    }

    public async Task<LegalLinksSettingsDto> GetLegalLinksSettingsAsync(
        CancellationToken cancellationToken
    )
    {
        using var scope = _serviceScopeFactory.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();
        return await LegalLinksSettingsStore.LoadAsync(
            context,
            CreateFallbackSettings(),
            cancellationToken
        );
    }

    public async Task<LegalLinksSettingsDto> UpdateLegalLinksSettingsAsync(
        LegalLinksSettingsDto settings,
        CancellationToken cancellationToken
    )
    {
        using var scope = _serviceScopeFactory.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();
        var normalized = LegalLinksSettingsStore.Normalize(settings);
        await LegalLinksSettingsStore.SaveAsync(context, normalized, cancellationToken);
        return await GetLegalLinksSettingsAsync(cancellationToken);
    }

    private LegalLinksSettingsDto CreateFallbackSettings()
    {
        return new LegalLinksSettingsDto
        {
            DatenschutzLinkDe = _baseConfiguration.DatenschutzLinkDe,
            DatenschutzLinkEn = _baseConfiguration.DatenschutzLinkEn,
            AgbLinkDe = _baseConfiguration.AgbLinkDe,
            AgbLinkEn = _baseConfiguration.AgbLinkEn,
            AvvLinkDe = _baseConfiguration.AvvLinkDe,
            AvvLinkEn = _baseConfiguration.AvvLinkEn,
            ImprintLink = _baseConfiguration.ImprintLink,
        };
    }
}
