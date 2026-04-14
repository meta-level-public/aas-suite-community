using AasDesignerApi.Model;
using AasDesignerModel;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AasDesignerAasApi.Infrastructure.Commands.DeleteInfrastructure;

public class DeleteInfrastructureCommand : IRequest<bool>
{
    public AppUser AppUser { get; set; } = null!;
    public long SettingId { get; set; }
}

public class DeleteInfrastructureHandler : IRequestHandler<DeleteInfrastructureCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public DeleteInfrastructureHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(
        DeleteInfrastructureCommand request,
        CancellationToken cancellationToken
    )
    {
        var setting = await _context
            .Organisations.Include(o =>
                o.AasInfrastructureSettings.Where(s => s.Id == request.SettingId)
            )
            .Where(o => o.Id == request.AppUser.OrganisationId)
            .Select(x => x.AasInfrastructureSettings.FirstOrDefault(x => x.Id == request.SettingId))
            .FirstOrDefaultAsync();

        if (setting == null)
            throw new Exception("Setting not found");

        _context.Remove(setting);
        _context.SaveChanges();

        return true;
    }
}
