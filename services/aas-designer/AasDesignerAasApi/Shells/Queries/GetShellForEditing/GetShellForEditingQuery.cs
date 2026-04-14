using AasCore.Aas3_1;
using AasDesignerApi.Model;
using AasDesignerCommon.Shells;
using AasDesignerCommon.Utils;
using AasDesignerModel;
using AasShared.Configuration;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AasDesignerAasApi.Shells.Queries.GetShellForEditing;

public class GetShellForEditingQuery : IRequest<ShellForEditingVm>
{
    public AppUser AppUser { get; set; } = null!;
    public string AasIdentifier { get; set; } = string.Empty;
}

public class GetShellForEditingHandler : IRequestHandler<GetShellForEditingQuery, ShellForEditingVm>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly AppSettings _appSettings;

    public GetShellForEditingHandler(
        IApplicationDbContext context,
        IMapper mapper,
        AppSettings appSettings
    )
    {
        _context = context;
        _mapper = mapper;
        _appSettings = appSettings;
    }

    public async Task<ShellForEditingVm> Handle(
        GetShellForEditingQuery request,
        CancellationToken cancellationToken
    )
    {
        var result = new ShellForEditingVm();
        var orga = await _context
            .Organisations.Where(o => o.Id == request.AppUser.OrganisationId)
            .FirstOrDefaultAsync();

        if (orga == null)
            throw new Exception("Organisation not found");

        var shellLoadResult = await ShellLoader.LoadAsync(
            request.AppUser.CurrentInfrastructureSettings,
            request.AasIdentifier,
            cancellationToken,
            request.AppUser
        );

        result.EditorDescriptor = shellLoadResult.EditorDescriptor;
        if (shellLoadResult.Environment == null)
            throw new Exception("AAS not found");
        var infrastructureId = request.AppUser.CurrentInfrastructureSettings.Id;
        var baseProxyUrl = $"/aas-proxy/{infrastructureId}/";
        var smUrl = baseProxyUrl + "sm-repo";
        var aasUrl = baseProxyUrl + "aas-repo";

        result.AasFiles = FilesFromAasResolver.GetAllAasFiles(
            shellLoadResult.Environment,
            smUrl,
            aasUrl
        );

        result.AasId =
            shellLoadResult.Environment.AssetAdministrationShells?[0]?.Id ?? string.Empty;
        result.ConceptDescriptionMetadata = shellLoadResult.ConceptDescriptionMetadata;

        result.PlainJson = Jsonization
            .Serialize.ToJsonObject(shellLoadResult.Environment)
            .ToJsonString();

        return result;
    }
}
