using AasDesignerApi.Model;
using AasDesignerModel;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AasDesignerAasApi.ProductRoot.Queries.GetAllProductRoots;

public class GetAllProductRootsQuery : IRequest<List<ProductRootDto>>
{
    public AppUser AppUser { get; set; } = null!;
    public string AasIdentifier { get; set; } = string.Empty;
}

public class GetAllProductRootsHandler
    : IRequestHandler<GetAllProductRootsQuery, List<ProductRootDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetAllProductRootsHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<ProductRootDto>> Handle(
        GetAllProductRootsQuery request,
        CancellationToken cancellationToken
    )
    {
        var productRoots = await _context
            .ProductRoots.Where(p =>
                p.BesitzerOrganisationId == request.AppUser.OrganisationId && !p.Geloescht
            )
            .ToListAsync(cancellationToken);

        var result = _mapper.Map<List<ProductRootDto>>(productRoots);

        return result;
    }
}
