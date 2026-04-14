using AasDesignerApi.Model;
using AasDesignerModel;
using AasDesignerSystemManagementApi.SystemManagement.Model;
using AasShared.Configuration;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AasDesignerSystemManagementApi.SystemManagement.Queries.GetConfiguration;

public class GetConfigurationQuery : IRequest<SystemConfigurationDto>
{
    public long MappingId { get; set; }
}

public class GetConfigurationHandler
    : IRequestHandler<GetConfigurationQuery, SystemConfigurationDto>
{
    private readonly IApplicationDbContext _context;
    private readonly AppSettings _appSettings;
    private readonly ILegalLinksSettingsRuntimeService _legalLinksSettingsRuntimeService;

    public GetConfigurationHandler(
        AppSettings appSettings,
        IApplicationDbContext context,
        ILegalLinksSettingsRuntimeService legalLinksSettingsRuntimeService
    )
    {
        _context = context;
        _appSettings = appSettings;
        _legalLinksSettingsRuntimeService = legalLinksSettingsRuntimeService;
    }

    public async Task<SystemConfigurationDto> Handle(
        GetConfigurationQuery request,
        CancellationToken cancellationToken
    )
    {
        var countOrgas = await _context.Organisations.Where(o => !o.Geloescht).CountAsync();
        var isSingleTenantMode = _appSettings.SingleTenantMode && countOrgas == 1;
        var singleTenantTheme = string.Empty;
        var legalLinksSettings = await _legalLinksSettingsRuntimeService.GetLegalLinksSettingsAsync(
            cancellationToken
        );

        if (isSingleTenantMode)
        {
            singleTenantTheme =
                await _context
                    .Organisations.Where(o => !o.Geloescht)
                    .Select(o => o.ThemeUrl ?? string.Empty)
                    .FirstOrDefaultAsync(cancellationToken)
                ?? string.Empty;
        }

        var isSsoAvailableSingleTenant = _appSettings.KeycloakEnabled;
        var ssoConfigName = _appSettings.KeycloakEnabled
            ? _appSettings.KeycloakSsoSourceName
            : string.Empty;

        return await Task.FromResult(
            new SystemConfigurationDto()
            {
                SingleTenantMode = isSingleTenantMode,
                IsSsoAvailableSingleTenant = isSsoAvailableSingleTenant,
                SsoConfigName = ssoConfigName,
                SingleTenantTheme = singleTenantTheme,
                DatenschutzLinkDe = legalLinksSettings.DatenschutzLinkDe,
                DatenschutzLinkEn = legalLinksSettings.DatenschutzLinkEn,
                AgbLinkDe = legalLinksSettings.AgbLinkDe,
                AgbLinkEn = legalLinksSettings.AgbLinkEn,
                AvvLinkDe = legalLinksSettings.AvvLinkDe,
                AvvLinkEn = legalLinksSettings.AvvLinkEn,
                ImprintLink = legalLinksSettings.ImprintLink,
            }
        );
    }
}
