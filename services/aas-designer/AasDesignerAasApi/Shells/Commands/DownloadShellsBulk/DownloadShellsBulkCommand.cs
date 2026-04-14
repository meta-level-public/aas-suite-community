using System.IO.Compression;
using AasDesignerAasApi.Shells.Commands.ExportShellAsAasx;
using AasDesignerApi.Model;
using AasDesignerCommon.Shells;
using AasDesignerCommon.Utils;
using AasDesignerModel;
using AutoMapper;
using MediatR;
using Microsoft.Extensions.Logging;

namespace AasDesignerAasApi.Shells.Command.DownloadShellsBulk;

public class DownloadShellsBulkCommand : IRequest<Stream>
{
    public AppUser AppUser { get; set; } = null!;
    public List<string> AasIdentifiers { get; set; } = [];
}

public class DownloadShellsBulkHandler : IRequestHandler<DownloadShellsBulkCommand, Stream>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<DownloadShellsBulkHandler> _logger;

    public DownloadShellsBulkHandler(
        IApplicationDbContext context,
        IMapper mapper,
        ILogger<DownloadShellsBulkHandler> logger
    )
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<Stream> Handle(
        DownloadShellsBulkCommand request,
        CancellationToken cancellationToken
    )
    {
        // alle Dateien besorgen und dann packen
        var zipFileMemoryStream = new MemoryStream();
        using (
            ZipArchive archive = new ZipArchive(
                zipFileMemoryStream,
                ZipArchiveMode.Update,
                leaveOpen: true
            )
        )
        {
            foreach (var id in request.AasIdentifiers)
            {
                var filename = (id + ".aasx").MakeValidFileName();
                var entry = archive.CreateEntry(filename);

                var sourceInfrastructure = request.AppUser.CurrentInfrastructureSettings;
                var shellLoadResult = await ShellLoader.LoadAsync(
                    sourceInfrastructure,
                    id,
                    cancellationToken,
                    request.AppUser
                );
                var environment =
                    shellLoadResult.Environment ?? throw new Exception("AAS not found");

                FilePathForExportModifier.ModifyFilePathForExport(environment);
                var files = FilesFromAasResolver.GetAllAasFiles(
                    shellLoadResult.Environment,
                    request.AppUser.CurrentInfrastructureSettings.SubmodelRepositoryUrl.AppendSlash(),
                    request.AppUser.CurrentInfrastructureSettings.AasRepositoryUrl.AppendSlash()
                );

                if (environment == null)
                    throw new Exception("AAS not found");

                using (
                    var stream = AasxPackager.CreateAasxPackage(
                        environment,
                        files,
                        "XML",
                        "3.1",
                        request.AppUser,
                        _logger
                    )
                )
                using (var entryStream = entry.Open())
                using (var paketStream = stream)
                {
                    paketStream.Seek(0, SeekOrigin.Begin);
                    await paketStream.CopyToAsync(entryStream);
                }
            }
        }

        zipFileMemoryStream.Seek(0, SeekOrigin.Begin);
        return zipFileMemoryStream;
    }
}
