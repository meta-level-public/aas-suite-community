using AasDesignerApi.Model;
using AasDesignerModel;
using AasShared.Configuration;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AasDesignerAasApi.Shells.Queries.GetContainedSubmodels;

public class GetContainedSubmodelsQuery : IRequest<ContainedSubmodelsVm>
{
    public AppUser AppUser { get; set; } = null!;
    public string AasIdentifier { get; set; } = string.Empty;
}

public class GetContainedSubmodelsHandler
    : IRequestHandler<GetContainedSubmodelsQuery, ContainedSubmodelsVm>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly AppSettings _appSettings;

    public GetContainedSubmodelsHandler(
        IApplicationDbContext context,
        IMapper mapper,
        AppSettings appSettings
    )
    {
        _context = context;
        _mapper = mapper;
        _appSettings = appSettings;
    }

    public async Task<ContainedSubmodelsVm> Handle(
        GetContainedSubmodelsQuery request,
        CancellationToken cancellationToken
    )
    {
        var result = new ContainedSubmodelsVm();
        var orga = await _context
            .Organisations.Where(o => o.Id == request.AppUser.OrganisationId)
            .FirstOrDefaultAsync();

        if (orga == null)
            throw new Exception("Organisation not found");

        result.ContainedSubmodels = await SubmodelMetadataLoader.LoadAsync(
            request.AppUser.CurrentInfrastructureSettings,
            request.AasIdentifier,
            cancellationToken,
            request.AppUser
        );

        return result;
    }
}
