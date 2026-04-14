using AasDesignerApi.Model;
using AasDesignerModel;
using AasShared.Configuration;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AasDesignerAasApi.Infrastructure.Commands.EnableInfrastructure;

public class EnableInternalInfrastructureCommand : IRequest<bool>
{
    public AppUser AppUser { get; set; } = null!;
    public long InfrastructureId { get; set; }
}

public class EnableInternalInfrastructureHandler
    : IRequestHandler<EnableInternalInfrastructureCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly AppSettings _appsettings;

    public EnableInternalInfrastructureHandler(
        IApplicationDbContext context,
        AppSettings appSettings
    )
    {
        _context = context;
        _appsettings = appSettings;
    }

    public async Task<bool> Handle(
        EnableInternalInfrastructureCommand request,
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

        infrastructure.IsActive = true;
        _context.SaveChanges();

        InfrastructureChangeRequester.RequestInfrastructureEnabling(
            request.AppUser.Organisation.InternalAasInfrastructureGuid,
            _appsettings.ContainerManagerInboxDirectory
        );

        return true;
    }
}
