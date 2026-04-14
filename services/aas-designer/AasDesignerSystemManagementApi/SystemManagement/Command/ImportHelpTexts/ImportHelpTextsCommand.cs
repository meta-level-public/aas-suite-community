using System.IO.Compression;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using AasDesignerApi.Model;
using AasDesignerCommon.Utils;
using AasDesignerModel;
using AasDesignerSystemManagementApi.SystemManagement.Model;
using AasShared.Configuration;
using AasShared.Exceptions;
using MediatR;

namespace AasDesignerDashboardApi.Dashboard.Queries.ImportHelpTexts;

public class ImportHelpTextsCommand : IRequest<bool>
{
    public AppUser AppUser { get; set; } = null!;
    public string fileAsBase64 { get; set; } = string.Empty;
}

public class ImportHelpTextsHandler : IRequestHandler<ImportHelpTextsCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly AppSettings _appsettings;

    public ImportHelpTextsHandler(IApplicationDbContext context, AppSettings appSettings)
    {
        _context = context;
        _appsettings = appSettings;
    }

    public async Task<bool> Handle(
        ImportHelpTextsCommand request,
        CancellationToken cancellationToken
    )
    {
        // daten aus base64 data url extrahieren
        var base64Data = Regex
            .Match(request.fileAsBase64, @"data:(?<type>.+?),(?<data>.+)")
            .Groups["data"]
            .Value;
        var binData = Convert.FromBase64String(base64Data);

        // Decompress the byte array using GZipStream
        using var inputStream = new MemoryStream(binData);
        using var gzipStream = new GZipStream(inputStream, CompressionMode.Decompress);
        using var reader = new StreamReader(gzipStream);
        var jsonString = await reader.ReadToEndAsync();

        // deserialize data
        var entries = JsonSerializer.Deserialize<List<GlobalHelpText>>(jsonString) ?? [];
        entries.ForEach(e => e.Id = 0);

        // clear existing entries
        _context.GlobalHelpTexts.RemoveRange(_context.GlobalHelpTexts);
        await _context.SaveChangesAsync(cancellationToken);

        // add new entries
        _context.GlobalHelpTexts.AddRange(entries);
        var result = await _context.SaveChangesAsync(cancellationToken) > 0;

        return await Task.FromResult(result);
    }
}
