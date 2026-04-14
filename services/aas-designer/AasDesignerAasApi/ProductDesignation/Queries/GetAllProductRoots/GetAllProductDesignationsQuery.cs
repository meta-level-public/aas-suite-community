using AasDesignerApi.Model;
using AasDesignerModel;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AasDesignerAasApi.ProductDesignation.Queries.GetAllProductDesignations;

public class GetAllProductDesignationsQuery : IRequest<List<ProductDesignationDto>>
{
    public AppUser AppUser { get; set; } = null!;
    public string AasIdentifier { get; set; } = string.Empty;
}

public class GetAllProductDesignationsHandler
    : IRequestHandler<GetAllProductDesignationsQuery, List<ProductDesignationDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetAllProductDesignationsHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<ProductDesignationDto>> Handle(
        GetAllProductDesignationsQuery request,
        CancellationToken cancellationToken
    )
    {
        var ProductDesignations = await _context
            .ProductDesignations.Where(p =>
                p.BesitzerOrganisationId == request.AppUser.OrganisationId && !p.Geloescht
            )
            .ToListAsync(cancellationToken);

        var result = _mapper.Map<List<ProductDesignationDto>>(ProductDesignations);

        return result;
    }
}
