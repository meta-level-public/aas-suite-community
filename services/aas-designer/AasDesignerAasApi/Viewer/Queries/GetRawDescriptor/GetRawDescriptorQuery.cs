using AasDesignerApi.Model;
using AasDesignerCommon.Shells;
using AasDesignerModel;
using AutoMapper;
using MediatR;

namespace AasDesignerAasApi.Viewer.Queries.GetRawDescriptor;

public class GetRawDescriptorQuery : IRequest<RawDescriptor>
{
    public AppUser AppUser { get; set; } = null!;
    public string AasIdentifier { get; set; } = string.Empty;
}

public class GetRawDescriptorHandler : IRequestHandler<GetRawDescriptorQuery, RawDescriptor>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetRawDescriptorHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<RawDescriptor> Handle(
        GetRawDescriptorQuery request,
        CancellationToken cancellationToken
    )
    {
        var result = new RawDescriptor
        {
            AasInfrastrukturId = request.AppUser.CurrentInfrastructureSettings.Id,
        };

        var loadResult = await ShellLoader.LoadAsync(
            request.AppUser.CurrentInfrastructureSettings,
            request.AasIdentifier,
            cancellationToken,
            request.AppUser
        );

        result.AasEndpoint = loadResult.EditorDescriptor.AasDescriptorEntry.Endpoint;

        var shell = loadResult.Environment?.AssetAdministrationShells?.FirstOrDefault();
        result.GlobalAssetId = shell?.AssetInformation?.GlobalAssetId;
        foreach (var specificId in shell?.AssetInformation?.SpecificAssetIds ?? [])
        {
            if (
                !string.IsNullOrWhiteSpace(specificId.Name)
                && !string.IsNullOrWhiteSpace(specificId.Value)
            )
            {
                result.SpecificAssetIds.Add(
                    new SpecificAssetIdEntry { Name = specificId.Name, Value = specificId.Value }
                );
            }
        }

        foreach (var sm in shell?.Submodels ?? [])
        {
            var descriptorEntry =
                loadResult.EditorDescriptor.SubmodelDescriptorEntries.FirstOrDefault(entry =>
                    entry.NewId == sm.Keys[0].Value || entry.OldId == sm.Keys[0].Value
                );
            if (!string.IsNullOrWhiteSpace(descriptorEntry?.Endpoint))
            {
                result.SubmodelEndpoints.Add(descriptorEntry.Endpoint);
            }
        }

        return result;
    }
}
