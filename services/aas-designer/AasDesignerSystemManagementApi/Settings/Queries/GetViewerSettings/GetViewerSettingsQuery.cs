using AasDesignerAasApi.Settings.Queries.GetViewerSettings;
using AasDesignerApi.Model;
using AasDesignerModel;
using AasShared.Configuration;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AasDesignerSystemManagementApi.Settings.Queries.GetViewerSettings;

public class GetViewerSettingsQuery : IRequest<ViewerSettingsDto>
{
    public AppUser AppUser { get; set; } = null!;
    public long InfrastructureId { get; set; }
}

public class GetViewerSettingsHandler : IRequestHandler<GetViewerSettingsQuery, ViewerSettingsDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly AppSettings _appSettings;

    public GetViewerSettingsHandler(
        IApplicationDbContext context,
        IMapper mapper,
        AppSettings appSettings
    )
    {
        _context = context;
        _mapper = mapper;
        _appSettings = appSettings;
    }

    public async Task<ViewerSettingsDto> Handle(
        GetViewerSettingsQuery request,
        CancellationToken cancellationToken
    )
    {
        var infrastructure = await _context
            .AasInfrastructureSettings.AsNoTracking()
            .FirstOrDefaultAsync(i => i.Id == request.InfrastructureId, cancellationToken);

        if (infrastructure == null)
        {
            throw new Exception($"Infrastructure with ID {request.InfrastructureId} not found.");
        }

        var personalAccessToken = await GetOrCreateViewerAppTokenAsync(request, cancellationToken);

        return new ViewerSettingsDto
        {
            SmRepoUrl = infrastructure.SubmodelRepositoryUrl,
            AasRepoUrl = infrastructure.AasRepositoryUrl,
            AasRegistryUrl = infrastructure.AasRegistryUrl,
            CdRepoUrl = infrastructure.ConceptDescriptionRepositoryUrl,
            DiscoveryUrl = infrastructure.AasDiscoveryUrl,
            ViewerAppUrl = _appSettings.ViewerAppUrl,
            SmRegistryUrl = infrastructure.SubmodelRegistryUrl,
            PersonalAccessToken = personalAccessToken,
        };
    }

    /// <summary>
    /// Liefert den API-Schlüssel für den QR-Code der ViewerApp. Der Schlüssel hat nur Leserecht,
    /// ist an Benutzer und Infrastruktur gebunden und erscheint unter Organisation › Token,
    /// wo er deaktiviert oder gelöscht werden kann.
    /// </summary>
    private async Task<string> GetOrCreateViewerAppTokenAsync(
        GetViewerSettingsQuery request,
        CancellationToken cancellationToken
    )
    {
        var today = DateTime.Today;
        var existing = await _context
            .Apikeys.Where(a =>
                a.BenutzerId == request.AppUser.BenutzerId
                && a.OrganisationId == request.AppUser.OrganisationId
                && a.AasInfrastructureSettingsId == request.InfrastructureId
                && a.Notice.StartsWith(ViewerAppTokenNoticePrefix)
                && a.Active
                && !a.Geloescht
                && (a.ValidUntil == null || a.ValidUntil >= today)
            )
            .ToListAsync(cancellationToken);

        var readOnlyToken = existing.FirstOrDefault(a =>
            a.Scopes.Count == 1 && a.Scopes[0] == ApiScopes.AASX_READ_API
        );
        if (readOnlyToken != null)
        {
            return readOnlyToken.Key.ToString();
        }

        var email = request.AppUser.Benutzer?.Email;
        var apikey = new Apikey
        {
            Key = Guid.NewGuid(),
            ValidUntil = today.AddYears(1),
            Active = true,
            Notice = string.IsNullOrWhiteSpace(email)
                ? ViewerAppTokenNoticePrefix
                : $"{ViewerAppTokenNoticePrefix}: {email}",
            Scopes = [ApiScopes.AASX_READ_API],
            OrganisationId = request.AppUser.OrganisationId,
            AasInfrastructureSettingsId = request.InfrastructureId,
            BenutzerId = request.AppUser.BenutzerId,
        };
        _context.Apikeys.Add(apikey);
        await _context.SaveChangesAsync(cancellationToken);

        return apikey.Key.ToString();
    }

    public const string ViewerAppTokenNoticePrefix = "ViewerApp-QR-Code (nur Lesen)";
}
