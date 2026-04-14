using AasDesignerAasApi.Pcn;
using AasDesignerAasApi.Pcn.Queries.GetPcnUpdates;
using AasDesignerApi.Model;
using AasDesignerModel;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AasDesignerAasApi.Pcn.Queries.GetPcnUpdates;

public class GetPcnUpdatesQuery : IRequest<List<PcnNotificationDto>>
{
    public AppUser AppUser { get; set; } = null!;
}

public class GetPcnUpdatesHandler : IRequestHandler<GetPcnUpdatesQuery, List<PcnNotificationDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetPcnUpdatesHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<PcnNotificationDto>> Handle(
        GetPcnUpdatesQuery request,
        CancellationToken cancellationToken
    )
    {
        var result = new List<PcnNotificationDto>();
        var updates = await _context
            .PcnNotifications.Include(u => u.PcnListener)
            .Where(update => update.PcnListener.OrganizationId == request.AppUser.OrganisationId)
            .ToListAsync(cancellationToken);

        foreach (var update in updates)
        {
            var entry = new PcnNotificationDto()
            {
                Id = update.Id,
                AasIdentifier = update.PcnListener.AasIdentifier,
                Content = update.PcnSubmodelUrl,
            };
            result.Add(entry);
        }
        return result;
    }
}
