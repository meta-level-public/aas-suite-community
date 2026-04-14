using System.IO.Compression;
using System.Text.Json;
using AasDesignerModel;
using AasDesignerSystemManagementApi.SystemManagement.ThemeConfiguration;
using MediatR;

namespace AasDesignerSystemManagementApi.SystemManagement.Command.ExportThemeDefinitions;

public class ExportThemeDefinitionsCommand : IRequest<Stream> { }

public class ExportThemeDefinitionsHandler : IRequestHandler<ExportThemeDefinitionsCommand, Stream>
{
    private readonly IApplicationDbContext _context;

    public ExportThemeDefinitionsHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Stream> Handle(
        ExportThemeDefinitionsCommand request,
        CancellationToken cancellationToken
    )
    {
        var entries = await ThemeDefinitionStore.LoadAsync(_context, cancellationToken);
        var json = JsonSerializer.Serialize(entries);

        var ms = new MemoryStream();
        using (var gzipStream = new GZipStream(ms, CompressionMode.Compress, leaveOpen: true))
        using (var writer = new StreamWriter(gzipStream))
        {
            await writer.WriteAsync(json);
        }

        ms.Position = 0;
        return ms;
    }
}
