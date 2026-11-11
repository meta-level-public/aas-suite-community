using AasDesignerApi.Model;
using AasDesignerModel;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AasDesignerAasApi.Package.Commands.DeletePcnUpdateNotification;

public class DeletePcnUpdateNotificationCommand : IRequest<bool>
{
    public AppUser AppUser { get; set; } = null!;
    public required long Id { get; set; }
}

public class DeletePcnUpdateNotificationCommandHandler
    : IRequestHandler<DeletePcnUpdateNotificationCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public DeletePcnUpdateNotificationCommandHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<bool> Handle(
        DeletePcnUpdateNotificationCommand request,
        CancellationToken cancellationToken
    )
    {
        // only notifications of listeners of the caller's own organisation
        var item = _context
            .PcnNotifications.Where(x =>
                x.Id == request.Id && x.PcnListener.OrganizationId == request.AppUser.OrganisationId
            )
            .FirstOrDefault();
        if (item == null)
        {
            throw new Exception($"PcnNotification with ID {request.Id} not found.");
        }

        _context.Remove(item);
        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
