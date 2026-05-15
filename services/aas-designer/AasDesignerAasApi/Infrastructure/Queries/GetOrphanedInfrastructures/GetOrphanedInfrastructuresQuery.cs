using AasDesignerModel;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AasDesignerAasApi.Infrastructure.Queries.GetOrphanedInfrastructures;

public class GetOrphanedInfrastructuresQuery : IRequest<List<OrphanedInfrastructureDto>> { }

public class GetOrphanedInfrastructuresHandler
    : IRequestHandler<GetOrphanedInfrastructuresQuery, List<OrphanedInfrastructureDto>>
{
    private readonly IApplicationDbContext _context;

    public GetOrphanedInfrastructuresHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<OrphanedInfrastructureDto>> Handle(
        GetOrphanedInfrastructuresQuery request,
        CancellationToken cancellationToken
    )
    {
        var existingOrgaIds = await _context
            .Organisations.Select(o => o.Id)
            .ToListAsync(cancellationToken);

        return await _context
            .AasInfrastructureSettings.Where(s =>
                s.IsInternal
                && !string.IsNullOrWhiteSpace(s.ContainerGuid)
                && !existingOrgaIds.Contains(s.OrganisationId)
            )
            .Select(s => new OrphanedInfrastructureDto
            {
                Id = s.Id,
                Name = s.Name,
                ContainerGuid = s.ContainerGuid,
                IsGoInfrastructure = s.IsGoInfrastructure,
                OrganisationId = s.OrganisationId,
            })
            .ToListAsync(cancellationToken);
    }
}
