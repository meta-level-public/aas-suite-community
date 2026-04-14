using AasDesignerAasApi.Infrastructure.Queries;
using AasDesignerApi.Model;
using AasDesignerModel;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AasDesignerAasApi.Orga.Queries.GetAllSavedInfrastructures;

public class GetAllSavedInfrastructuresQuery : IRequest<List<AvailableInfastructure>>
{
    public AppUser AppUser { get; set; } = null!;
    public string AasIdentifier { get; set; } = string.Empty;
}

public class GetAllSavedInfrastructuresQueryHandler
    : IRequestHandler<GetAllSavedInfrastructuresQuery, List<AvailableInfastructure>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetAllSavedInfrastructuresQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<AvailableInfastructure>> Handle(
        GetAllSavedInfrastructuresQuery request,
        CancellationToken cancellationToken
    )
    {
        var result = new List<AvailableInfastructure>();
        var orga = _context
            .Organisations.Include(o => o.AasInfrastructureSettings)
            .FirstOrDefault(o => o.Id == request.AppUser.OrganisationId);

        if (orga == null)
            throw new Exception("Organisation not found");

        result = _mapper.Map<List<AvailableInfastructure>>(orga.AasInfrastructureSettings);

        return result;
    }
}
