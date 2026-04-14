using AasDesignerApi.Model;
using AasDesignerCommon.Utils;
using AasDesignerModel;
using AasShared.Configuration;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AasDesignerSharedLinksApi.SharedLinks.Commands.CreateSharedLink;

public class ShareAasCommand : IRequest<string>
{
    public AppUser AppUser { get; set; } = null!;
    public CreateSharedLink CreateSharedLink { get; set; } = null!;
}

public class ShareAasHandler : IRequestHandler<ShareAasCommand, string>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly AppSettings _appSettings;

    public ShareAasHandler(IApplicationDbContext context, IMapper mapper, AppSettings appSettings)
    {
        _context = context;
        _mapper = mapper;
        _appSettings = appSettings;
    }

    public async Task<string> Handle(ShareAasCommand request, CancellationToken cancellationToken)
    {
        var orga = await _context
            .Organisations.Where(o => o.Id == request.AppUser.OrganisationId)
            .FirstOrDefaultAsync();

        if (orga == null)
            throw new Exception("Organisation not found");

        var guid = Guid.NewGuid();

        var sharedLink = new SharedLink
        {
            Besitzer = request.AppUser.Benutzer,
            BesitzerId = request.AppUser.BenutzerId,
            AasIdentifier = request.CreateSharedLink.AasIdentifier,
            BesitzerOrganisationId = request.AppUser.OrganisationId,
            AasInfrastrukturId = request.AppUser.CurrentInfrastructureSettings.Id,
            Ablaufdatum = request.CreateSharedLink.Ablaufdatum,
            Passwort = string.IsNullOrWhiteSpace(request.CreateSharedLink.Passwort)
                ? string.Empty
                : PasswordHelper.GenerateHash(request.CreateSharedLink.Passwort, _appSettings.Salt),
            Guid = guid,
            GeneratedLink = $"{_appSettings.BaseUrl}/public-viewer?accesscode={guid}",
            Notiz = request.CreateSharedLink.Notiz,
        };

        _context.SharedLinks.Add(sharedLink);
        await _context.SaveChangesAsync(cancellationToken);

        return sharedLink.GeneratedLink;
    }
}
