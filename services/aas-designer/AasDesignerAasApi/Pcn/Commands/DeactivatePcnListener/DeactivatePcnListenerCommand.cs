using AasDesignerApi.Model;
using AasDesignerModel;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AasDesignerAasApi.Package.Commands.DeactivatePcnListener;

public class DeactivatePcnListenerCommand : IRequest<bool>
{
    public AppUser AppUser { get; set; } = null!;
    public required long Id { get; set; }
}

public class DeactivatePcnListenerCommandHandler
    : IRequestHandler<DeactivatePcnListenerCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public DeactivatePcnListenerCommandHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<bool> Handle(
        DeactivatePcnListenerCommand request,
        CancellationToken cancellationToken
    )
    {
        var registration = await _context.PcnListeners.FirstOrDefaultAsync(
            x =>
                x.Id == request.Id
                && x.OrganizationId == request.AppUser.OrganisationId
                && !x.Geloescht,
            cancellationToken
        );

        if (registration == null)
            throw new Exception("Registration not found");

        registration.IsActive = false;
        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
