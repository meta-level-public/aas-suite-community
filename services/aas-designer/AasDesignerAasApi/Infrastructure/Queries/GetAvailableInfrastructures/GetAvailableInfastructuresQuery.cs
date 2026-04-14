using AasDesignerApi.Model;
using AasDesignerCommon.Utils;
using AasDesignerModel;
using AasShared.Configuration;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AasDesignerAasApi.Infrastructure.Queries.GetAvailableInfrastructures;

public class GetAvailableInfastructuresQuery : IRequest<List<AvailableInfastructure>>
{
    public AppUser AppUser { get; set; } = null!;
    public string AasIdentifier { get; set; } = string.Empty;
}

public class GetAvailableInfastructuresHandler
    : IRequestHandler<GetAvailableInfastructuresQuery, List<AvailableInfastructure>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly AppSettings _appSettings;

    public GetAvailableInfastructuresHandler(
        IApplicationDbContext context,
        IMapper mapper,
        AppSettings appSettings
    )
    {
        _context = context;
        _mapper = mapper;
        _appSettings = appSettings;
    }

    public async Task<List<AvailableInfastructure>> Handle(
        GetAvailableInfastructuresQuery request,
        CancellationToken cancellationToken
    )
    {
        var result = new List<AvailableInfastructure>();
        var orga = _context
            .Organisations.Include(o => o.AasInfrastructureSettings.Where(s => s.IsActive))
            .FirstOrDefault(o => o.Id == request.AppUser.OrganisationId);

        if (orga == null)
            throw new Exception("Organisation not found");

        var allLoaded = orga.AasInfrastructureSettings.Where(i => i.IsActive).ToList();
        result = _mapper.Map<List<AvailableInfastructure>>(allLoaded);

        result.ForEach(loaded =>
        {
            if (loaded.IsInternal)
            {
                var baseUrl = _appSettings.BaseUrl.AppendSlash() + "aas-proxy/" + loaded.Id + "/";
                loaded.AasRepositoryUrl = baseUrl + "aas-repo";
                loaded.AasRegistryUrl = baseUrl + "aas-reg";
                loaded.SmRepositoryUrl = baseUrl + "sm-repo";
                loaded.SmRegistryUrl = baseUrl + "sm-reg";
                loaded.CdRepositoryUrl = baseUrl + "cd-repo";
            }
        });

        return result;
    }
}
