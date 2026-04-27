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
        var settings = await LegalLinksSettingsStore.LoadAsync(
            context,
            CreateFallbackSettings(),
            cancellationToken
        );
        await PopulateDocumentInfosAsync(context, settings, cancellationToken);
        return settings;
    }

    public async Task<LegalLinksSettingsDto> UpdateLegalLinksSettingsAsync(
        UpdateLegalLinksSettingsRequest request,
        CancellationToken cancellationToken
    )
    {
        using var scope = _serviceScopeFactory.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();
        var urlSettings = await ApplyDocumentChangesAsync(context, request, cancellationToken);
        var normalized = LegalLinksSettingsStore.Normalize(urlSettings);
        await LegalLinksSettingsStore.SaveAsync(context, normalized, cancellationToken);
        return await GetLegalLinksSettingsAsync(cancellationToken);
    }

    private static async Task<LegalLinksSettingsDto> ApplyDocumentChangesAsync(
        IApplicationDbContext context,
        UpdateLegalLinksSettingsRequest request,
        CancellationToken cancellationToken
    )
    {
        var servingBase = request.ServingBaseUrl.TrimEnd('/');

        return new LegalLinksSettingsDto
        {
            DatenschutzLinkDe = await ResolveFieldAsync(
                context,
                nameof(LegalLinksSettingsDto.DatenschutzLinkDe),
                request.DatenschutzLinkDe,
                request.DatenschutzLinkDeDocument,
                servingBase,
                cancellationToken
            ),
            DatenschutzLinkEn = await ResolveFieldAsync(
                context,
                nameof(LegalLinksSettingsDto.DatenschutzLinkEn),
                request.DatenschutzLinkEn,
                request.DatenschutzLinkEnDocument,
                servingBase,
                cancellationToken
            ),
            AgbLinkDe = await ResolveFieldAsync(
                context,
                nameof(LegalLinksSettingsDto.AgbLinkDe),
                request.AgbLinkDe,
                request.AgbLinkDeDocument,
                servingBase,
                cancellationToken
            ),
            AgbLinkEn = await ResolveFieldAsync(
                context,
                nameof(LegalLinksSettingsDto.AgbLinkEn),
                request.AgbLinkEn,
                request.AgbLinkEnDocument,
                servingBase,
                cancellationToken
            ),
            AvvLinkDe = await ResolveFieldAsync(
                context,
                nameof(LegalLinksSettingsDto.AvvLinkDe),
                request.AvvLinkDe,
                request.AvvLinkDeDocument,
                servingBase,
                cancellationToken
            ),
            AvvLinkEn = await ResolveFieldAsync(
                context,
                nameof(LegalLinksSettingsDto.AvvLinkEn),
                request.AvvLinkEn,
                request.AvvLinkEnDocument,
                servingBase,
                cancellationToken
            ),
            ImprintLink = await ResolveFieldAsync(
                context,
                nameof(LegalLinksSettingsDto.ImprintLink),
                request.ImprintLink,
                request.ImprintLinkDocument,
                servingBase,
                cancellationToken
            ),
        };
    }

    private static async Task<string> ResolveFieldAsync(
        IApplicationDbContext context,
        string fieldName,
        string urlValue,
        LegalLinksDocumentUploadDto? documentUpload,
        string servingBase,
        CancellationToken cancellationToken
    )
    {
        if (documentUpload == null)
        {
            return urlValue;
        }

        if (string.IsNullOrEmpty(documentUpload.ContentBase64))
        {
            await LegalLinksDocumentStore.DeleteAsync(context, fieldName, cancellationToken);
            return urlValue;
        }

        await LegalLinksDocumentStore.SaveAsync(
            context,
            fieldName,
            new LegalLinksDocumentStore.LegalLinksDocumentData(
                documentUpload.FileName,
                documentUpload.ContentType,
                documentUpload.ContentBase64
            ),
            cancellationToken
        );

        return $"{servingBase}/SystemManagement/GetLegalDocument/{fieldName}";
    }

    private static async Task PopulateDocumentInfosAsync(
        IApplicationDbContext context,
        LegalLinksSettingsDto settings,
        CancellationToken cancellationToken
    )
    {
        settings.DatenschutzLinkDeDocument = await LegalLinksDocumentStore.LoadInfoAsync(
            context,
            nameof(LegalLinksSettingsDto.DatenschutzLinkDe),
            cancellationToken
        );
        settings.DatenschutzLinkEnDocument = await LegalLinksDocumentStore.LoadInfoAsync(
            context,
            nameof(LegalLinksSettingsDto.DatenschutzLinkEn),
            cancellationToken
        );
        settings.AgbLinkDeDocument = await LegalLinksDocumentStore.LoadInfoAsync(
            context,
            nameof(LegalLinksSettingsDto.AgbLinkDe),
            cancellationToken
        );
        settings.AgbLinkEnDocument = await LegalLinksDocumentStore.LoadInfoAsync(
            context,
            nameof(LegalLinksSettingsDto.AgbLinkEn),
            cancellationToken
        );
        settings.AvvLinkDeDocument = await LegalLinksDocumentStore.LoadInfoAsync(
            context,
            nameof(LegalLinksSettingsDto.AvvLinkDe),
            cancellationToken
        );
        settings.AvvLinkEnDocument = await LegalLinksDocumentStore.LoadInfoAsync(
            context,
            nameof(LegalLinksSettingsDto.AvvLinkEn),
            cancellationToken
        );
        settings.ImprintLinkDocument = await LegalLinksDocumentStore.LoadInfoAsync(
            context,
            nameof(LegalLinksSettingsDto.ImprintLink),
            cancellationToken
        );
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
