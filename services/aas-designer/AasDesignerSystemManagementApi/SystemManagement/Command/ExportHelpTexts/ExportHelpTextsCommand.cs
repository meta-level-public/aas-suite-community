using System.IO.Compression;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using AasDesignerApi.Model;
using AasDesignerCommon.Utils;
using AasDesignerModel;
using AasDesignerSystemManagementApi.SystemManagement.Model;
using AasShared.Configuration;
using AasShared.Exceptions;
using MediatR;

namespace AasDesignerDashboardApi.Dashboard.Queries.ExportHelpTexts;

public class ExportHelpTextsCommand : IRequest<Stream>
{
    public AppUser AppUser { get; set; } = null!;
    public string LicenseAsBase64 { get; set; } = string.Empty;
}

public class ExportHelpTextsHandler : IRequestHandler<ExportHelpTextsCommand, Stream>
{
    private readonly IApplicationDbContext _context;
    private readonly AppSettings _appsettings;

    public ExportHelpTextsHandler(IApplicationDbContext context, AppSettings appSettings)
    {
        _context = context;
        _appsettings = appSettings;
    }

    public async Task<Stream> Handle(
        ExportHelpTextsCommand request,
        CancellationToken cancellationToken
    )
    {
        var ms = new MemoryStream();

        var entries = _context.GlobalHelpTexts.ToList();

        // Serialize entries to JSON
        var json = JsonSerializer.Serialize(entries);

        // Compress JSON using GZip
        using (var gzipStream = new GZipStream(ms, CompressionMode.Compress, leaveOpen: true))
        using (var writer = new StreamWriter(gzipStream))
        {
            await writer.WriteAsync(json);
        }

        // Reset the position of the MemoryStream to the beginning
        ms.Position = 0;

        return ms;
    }
}
