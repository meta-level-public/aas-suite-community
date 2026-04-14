using AasDesignerApi.Model;
using AasDesignerModel;
using AasShared.Configuration;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AasDesignerAasApi.Infrastructure.Commands.RemoveStack;

public class RemoveStackCommand : IRequest<bool>
{
    public AppUser AppUser { get; set; } = null!;
    public long InfrastructureId { get; set; }
}

public class RemoveStackCommandHandler : IRequestHandler<RemoveStackCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly AppSettings _appsettings;

    public RemoveStackCommandHandler(IApplicationDbContext context, AppSettings appSettings)
    {
        _context = context;
        _appsettings = appSettings;
    }

    public async Task<bool> Handle(RemoveStackCommand request, CancellationToken cancellationToken)
    {
        var setting = await _context
            .AasInfrastructureSettings.Where(s =>
                s.Id == request.InfrastructureId && s.IsInternal == true
            )
            .FirstOrDefaultAsync(cancellationToken);

        if (setting == null)
            throw new Exception("Setting not found");

        var orga = await _context
            .Organisations.Where(o => o.InternalAasInfrastructureGuid == setting.ContainerGuid)
            .FirstOrDefaultAsync(cancellationToken);

        if (orga != null)
            orga.InternalAasInfrastructureGuid = string.Empty;

        _context.Remove(setting);
        await _context.SaveChangesAsync(cancellationToken);

        InfrastructureChangeRequester.RequestInfrastructureRemoval(
            setting.ContainerGuid,
            _appsettings.ContainerManagerInboxDirectory
        );

        return true;
    }
}
