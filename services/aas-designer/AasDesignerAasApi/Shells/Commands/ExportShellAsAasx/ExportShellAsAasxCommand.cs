using AasCore.Aas3_1;
using AasDesignerApi.Model;
using AasDesignerCommon.Shells;
using AasDesignerCommon.Utils;
using AasDesignerModel;
using AutoMapper;
using MediatR;
using Microsoft.Extensions.Logging;

namespace AasDesignerAasApi.Shells.Commands.ExportShellAsAasx;

public class ExportShellAsAasxCommand : IRequest<Stream>
{
    public AppUser AppUser { get; set; } = null!;
    public ShellExportOptions ExportOptions { get; set; } = new ShellExportOptions();
}

public class ExportShellAsAasxHandler : IRequestHandler<ExportShellAsAasxCommand, Stream>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<ExportShellAsAasxHandler> _logger;

    public ExportShellAsAasxHandler(
        IApplicationDbContext context,
        IMapper mapper,
        ILogger<ExportShellAsAasxHandler> logger
    )
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<Stream> Handle(
        ExportShellAsAasxCommand request,
        CancellationToken cancellationToken
    )
    {
        var sourceInfrastructure = request.AppUser.CurrentInfrastructureSettings;

        var shellLoadResult = await ShellLoader.LoadAsync(
            sourceInfrastructure,
            request.ExportOptions.AasIdentifier,
            cancellationToken,
            request.AppUser
        );

        var environment = shellLoadResult.Environment ?? throw new Exception("AAS not found");

        // remove submodels not included in the export

        if (request.ExportOptions.SubmodelIds != null && request.ExportOptions.SubmodelIds.Any())
        {
            environment.Submodels = environment
                .Submodels?.Where(s => request.ExportOptions.SubmodelIds.Contains(s.Id))
                .ToList();

            foreach (var aas in environment.AssetAdministrationShells ?? [])
            {
                var smToRemove = new List<IReference>();
                foreach (var sm in aas.Submodels ?? [])
                {
                    var smId = sm.Keys.FirstOrDefault()?.Value;
                    if (smId != null && !request.ExportOptions.SubmodelIds.Contains(smId))
                    {
                        smToRemove.Add(sm);
                    }
                }
                aas.Submodels?.RemoveAll(sm => smToRemove.Contains(sm));
            }
        }
        FilePathForExportModifier.ModifyFilePathForExport(environment);
        var files = FilesFromAasResolver.GetAllAasFiles(
            shellLoadResult.Environment,
            request.AppUser.CurrentInfrastructureSettings.SubmodelRepositoryUrl.AppendSlash(),
            request.AppUser.CurrentInfrastructureSettings.AasRepositoryUrl.AppendSlash()
        );

        if (environment == null)
            throw new Exception("AAS not found");

        return AasxPackager.CreateAasxPackage(
            environment,
            files,
            request.ExportOptions.ExportMode,
            request.ExportOptions.MetamodelVersion,
            request.AppUser,
            _logger
        );
    }
}
