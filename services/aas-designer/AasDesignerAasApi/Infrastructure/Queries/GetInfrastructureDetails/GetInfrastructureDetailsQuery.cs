using AasDesignerApi.Model;
using AasDesignerCommon.Utils;
using AasDesignerModel;
using AasDesignerModel.Model;
using AasShared.Configuration;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AasDesignerAasApi.Infrastructure.Queries.GetInfrastructureDetails;

public class GetInfrastructureDetailsQuery : IRequest<AasInfrastructureSettingsDto?>
{
    public AppUser AppUser { get; set; } = null!;
    public long Id { get; set; }
}

public class GetInfrastructureDetailsQueryHandler
    : IRequestHandler<GetInfrastructureDetailsQuery, AasInfrastructureSettingsDto?>
{
    private readonly IApplicationDbContext _context;
    private readonly AppSettings _appSettings;
    private readonly IMapper _mapper;

    public GetInfrastructureDetailsQueryHandler(
        IApplicationDbContext context,
        AppSettings appSettings,
        IMapper mapper
    )
    {
        _context = context;
        _appSettings = appSettings;
        _mapper = mapper;
    }

    public async Task<AasInfrastructureSettingsDto?> Handle(
        GetInfrastructureDetailsQuery request,
        CancellationToken cancellationToken
    )
    {
        var loaded = _context
            .AasInfrastructureSettings.AsNoTracking()
            .FirstOrDefault(x => x.Id == request.Id);
        if (loaded == null)
        {
            return null;
        }

        var dto = _mapper.Map<AasInfrastructureSettingsDto>(loaded);
        dto.OriginalAasDiscoveryUrl = loaded.AasDiscoveryUrl;
        dto.OriginalAasRegistryUrl = loaded.AasRegistryUrl;
        dto.OriginalAasRepositoryUrl = loaded.AasRepositoryUrl;
        dto.OriginalSubmodelRegistryUrl = loaded.SubmodelRegistryUrl;
        dto.OriginalSubmodelRepositoryUrl = loaded.SubmodelRepositoryUrl;
        dto.OriginalConceptDescriptionRepositoryUrl = loaded.ConceptDescriptionRepositoryUrl;
        if (loaded.IsInternal)
        {
            var baseUrl = _appSettings.BaseUrl.AppendSlash() + "aas-proxy/" + loaded.Id + "/";
            dto.AasRepositoryUrl = baseUrl + "aas-repo";
            dto.AasRegistryUrl = baseUrl + "aas-reg";
            dto.SubmodelRepositoryUrl = baseUrl + "sm-repo";
            dto.SubmodelRegistryUrl = baseUrl + "sm-reg";
            dto.ConceptDescriptionRepositoryUrl = baseUrl + "cd-repo";
            dto.AasDiscoveryUrl = baseUrl + "discovery";
        }

        return await Task.FromResult(dto);
    }
}
