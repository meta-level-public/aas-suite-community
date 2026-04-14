using AasDesignerApi.Model;
using AasDesignerCommon.Shells;
using AasDesignerCommon.Utils;
using AasDesignerModel;
using AasShared.Configuration;
using AutoMapper;
using MediatR;

namespace AasDesignerAasApi.Shells.Queries.GetViewerDescriptor;

public class GetViewerDescriptorQuery : IRequest<ViewerDescriptor>
{
    public AppUser AppUser { get; set; } = null!;
    public string AasIdentifier { get; set; } = string.Empty;
}

public class GetViewerDescriptorHandler
    : IRequestHandler<GetViewerDescriptorQuery, ViewerDescriptor>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly AppSettings _appSettings;

    public GetViewerDescriptorHandler(
        IApplicationDbContext context,
        IMapper mapper,
        AppSettings appSettings
    )
    {
        _context = context;
        _mapper = mapper;
        _appSettings = appSettings;
    }

    public async Task<ViewerDescriptor> Handle(
        GetViewerDescriptorQuery request,
        CancellationToken cancellationToken
    )
    {
        var result = new ViewerDescriptor();

        var loadResult = await ShellLoader.LoadAsync(
            request.AppUser.CurrentInfrastructureSettings,
            request.AasIdentifier,
            cancellationToken,
            request.AppUser
        );
        result.AasEndpoint = ToViewerProxyUrl(
            loadResult.EditorDescriptor.AasDescriptorEntry.Endpoint
        );

        var shell = loadResult.Environment?.AssetAdministrationShells?.FirstOrDefault();
        foreach (var sm in shell?.Submodels ?? [])
        {
            var descriptorEntry =
                loadResult.EditorDescriptor.SubmodelDescriptorEntries.FirstOrDefault(entry =>
                    entry.NewId == sm.Keys[0].Value || entry.OldId == sm.Keys[0].Value
                );
            if (!string.IsNullOrWhiteSpace(descriptorEntry?.Endpoint))
            {
                result.SubmodelEndpoints.Add(ToViewerProxyUrl(descriptorEntry.Endpoint));
            }
        }

        result.CdEndpoint = ToViewerProxyUrl(
            request.AppUser.CurrentInfrastructureSettings.ConceptDescriptionRepositoryUrl
        );

        return result;
    }

    private string ToViewerProxyUrl(string targetUrl)
    {
        var baseUrl = _appSettings.BaseUrl.TrimEnd('/');
        if (!baseUrl.EndsWith("/designer-api", StringComparison.OrdinalIgnoreCase))
        {
            baseUrl += "/designer-api";
        }
        return $"{baseUrl}/aas-viewer-proxy/call?target={targetUrl.ToUrlEncoded()}";
    }
}
