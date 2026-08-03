using AasDesignerApi.Model;
using AasDesignerModel;
using AasDesignerModel.Model;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AasDesignerAasApi.Infrastructure.Commands.CreateInfrastructure;

public class CreateInfrastructureCommand : IRequest<long>
{
    public AppUser AppUser { get; set; } = null!;
    public AasInfrastructureSettingsDto AasInfrastructureSettings { get; set; } = null!;
}

public class CreateInfrastructureHandler : IRequestHandler<CreateInfrastructureCommand, long>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public CreateInfrastructureHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<long> Handle(
        CreateInfrastructureCommand request,
        CancellationToken cancellationToken
    )
    {
        var orga = await _context
            .Organisations.Where(o => o.Id == request.AppUser.OrganisationId)
            .FirstOrDefaultAsync(cancellationToken);

        if (orga == null)
            throw new Exception("Organisation not found");

        var newInfra = _mapper.Map<AasInfrastructureSettings>(request.AasInfrastructureSettings);
        newInfra.OrganisationId = orga.Id;

        orga.AasInfrastructureSettings.Add(newInfra);
        _context.SaveChanges();

        return newInfra.Id;
    }
}
