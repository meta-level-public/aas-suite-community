using AasDesignerApi.Model;
using AasDesignerModel;
using AasShared.Configuration;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AasDesignerAasApi.Infrastructure.Commands.EnableInfrastructure;

public class DisableInternalInfrastructureCommand : IRequest<bool>
{
    public AppUser AppUser { get; set; } = null!;
    public long InfrastructureId { get; set; }
}

public class DisableInternalInfrastructureHandler
    : IRequestHandler<DisableInternalInfrastructureCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly AppSettings _appsettings;

    public DisableInternalInfrastructureHandler(
        IApplicationDbContext context,
        AppSettings appSettings
    )
    {
        _context = context;
        _appsettings = appSettings;
    }

    public async Task<bool> Handle(
        DisableInternalInfrastructureCommand request,
        CancellationToken cancellationToken
    )
    {
        var infrastructure = await _context
            .Organisations.Include(o =>
                o.AasInfrastructureSettings.Where(s =>
                    s.Id == request.InfrastructureId && s.IsInternal == true
                )
            )
            .Where(o => o.Id == request.AppUser.OrganisationId)
            .Select(x =>
                x.AasInfrastructureSettings.FirstOrDefault(x => x.Id == request.InfrastructureId)
            )
            .FirstOrDefaultAsync();

        if (infrastructure == null)
            throw new Exception("Setting not found");

        infrastructure.IsActive = false;

        _context.SaveChanges();
        InfrastructureChangeRequester.RequestInfrastructureDisabling(
            request.AppUser.Organisation.InternalAasInfrastructureGuid,
            _appsettings.ContainerManagerInboxDirectory
        );

        return true;
    }
}
