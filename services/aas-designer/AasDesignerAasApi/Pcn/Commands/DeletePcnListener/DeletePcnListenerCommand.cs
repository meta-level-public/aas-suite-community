using AasDesignerApi.Model;
using AasDesignerModel;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AasDesignerAasApi.Package.Commands.DeletePcnListener;

public class DeletePcnListenerCommand : IRequest<bool>
{
    public AppUser AppUser { get; set; } = null!;
    public required long Id { get; set; }
}

public class DeletePcnListenerCommandHandler : IRequestHandler<DeletePcnListenerCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public DeletePcnListenerCommandHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<bool> Handle(
        DeletePcnListenerCommand request,
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
        if (registration != null)
        {
            _context.PcnListeners.Remove(registration);
            await _context.SaveChangesAsync();
        }

        return true;
    }
}
