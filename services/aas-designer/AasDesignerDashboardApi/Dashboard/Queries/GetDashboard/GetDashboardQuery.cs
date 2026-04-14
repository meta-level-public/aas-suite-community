using AasDesignerApi.Model;
using AasDesignerDashboardApi.Dashboard.Model;
using AasDesignerModel;
using AasShared.Configuration;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AasDesignerDashboardApi.Dashboard.Queries.GetDashboard;

public class GetDashboardQuery : IRequest<DashboardLayoutDto>
{
    public AppUser AppUser { get; set; } = null!;
    public long MappingId { get; set; }
}

public class GetDashboardHandler : IRequestHandler<GetDashboardQuery, DashboardLayoutDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly AppSettings _appSettings;

    public GetDashboardHandler(
        IApplicationDbContext context,
        IMapper mapper,
        AppSettings appSettings
    )
    {
        _context = context;
        _mapper = mapper;
        _appSettings = appSettings;
    }

    public async Task<DashboardLayoutDto> Handle(
        GetDashboardQuery request,
        CancellationToken cancellationToken
    )
    {
        var mapping = await _context
            .DashboardLayouts.Include(d => d.Pages)
                .ThenInclude(p => p.Rows)
                    .ThenInclude(r => r.Columns)
            .Where(d =>
                d.BenutzerId == request.AppUser.BenutzerId
                && d.OrganisationId == request.AppUser.OrganisationId
            ) // nur das Dashboard aus der aktuellen Organisation!
            .FirstOrDefaultAsync();

        if (mapping == null)
            return new DashboardLayoutDto();

        return _mapper.Map<DashboardLayoutDto>(mapping);
    }
}
