using AasDesignerApi.Model;
using AasDesignerModel;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AasDesignerAasApi.ProductFamily.Queries.GetAllProductFamilies;

public class GetAllProductFamiliesQuery : IRequest<List<ProductFamilyDto>>
{
    public AppUser AppUser { get; set; } = null!;
    public string AasIdentifier { get; set; } = string.Empty;
}

public class GetAllProductFamilysHandler
    : IRequestHandler<GetAllProductFamiliesQuery, List<ProductFamilyDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetAllProductFamilysHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<ProductFamilyDto>> Handle(
        GetAllProductFamiliesQuery request,
        CancellationToken cancellationToken
    )
    {
        var ProductFamilys = await _context
            .ProductFamilys.Where(p =>
                p.BesitzerOrganisationId == request.AppUser.OrganisationId && !p.Geloescht
            )
            .ToListAsync(cancellationToken);

        var result = _mapper.Map<List<ProductFamilyDto>>(ProductFamilys);

        return result;
    }
}
