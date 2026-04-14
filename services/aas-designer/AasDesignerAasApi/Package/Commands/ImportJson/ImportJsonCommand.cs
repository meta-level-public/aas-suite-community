using System.Text.Json.Nodes;
using AasDesignerAasApi.Package.Commands;
using AasDesignerAasApi.ServerSentEvent;
using AasDesignerApi.Model;
using AasDesignerCommon.Enum;
using AasDesignerCommon.Shells;
using AasDesignerCommon.Utils;
using AasDesignerModel;
using AasShared.Configuration;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AasDesignerAasApi.Package.Commands.ImportJson;

public class ImportJsonCommand : IRequest<ImportPackageResult>
{
    public AppUser AppUser { get; set; } = null!;
    public List<MemoryStream> MemoryStreams { get; set; } = null!;
    public List<string> SourceFileNames { get; set; } = [];
    public ImportMode ImportMode { get; set; }
    public bool Overwrite { get; set; }
    public Guid? ProgressClientId { get; set; }
    public string ImportOperationId { get; set; } = string.Empty;
}

public class ImportJsonCommandHandler : IRequestHandler<ImportJsonCommand, ImportPackageResult>
{
    private readonly IApplicationDbContext _context;
    private readonly ImportProgressMessageStore _importProgressMessageStore;
    private readonly AppSettings _appSettings;

    public ImportJsonCommandHandler(
        IApplicationDbContext context,
        ImportProgressMessageStore importProgressMessageStore,
        AppSettings appSettings
    )
    {
        _context = context;
        _importProgressMessageStore = importProgressMessageStore;
        _appSettings = appSettings;
    }

    public async Task<ImportPackageResult> Handle(
        ImportJsonCommand request,
        CancellationToken cancellationToken
    )
    {
        var result = new ImportPackageResult();

        var orga = await _context
            .Organisations.Where(o => o.Id == request.AppUser.OrganisationId)
            .FirstOrDefaultAsync(cancellationToken);
        if (orga == null)
            throw new Exception("Organisation not found");

        var totalFiles = request.MemoryStreams.Count;
        var progressReporter = new ImportProgressReporter(
            request.ProgressClientId,
            request.AppUser.CurrentInfrastructureSettings.Id,
            request.ImportOperationId,
            _importProgressMessageStore
        );

        progressReporter.Report(5, "preparing", "Preparing import", 0, totalFiles);

        foreach (
            var (stream, index) in request.MemoryStreams.Select((stream, index) => (stream, index))
        )
        {
            var processedFiles = index;
            var currentFileNumber = index + 1;
            var currentFileName =
                request.SourceFileNames.ElementAtOrDefault(index) ?? $"File {currentFileNumber}";

            try
            {
                progressReporter.Report(
                    CalculateProgress(totalFiles, processedFiles, 0.1),
                    "reading",
                    $"Reading file {currentFileNumber} of {totalFiles}",
                    processedFiles,
                    totalFiles,
                    currentFileName
                );

                stream.Seek(0, SeekOrigin.Begin);
                var plainJson = new StreamReader(stream).ReadToEnd();
                var jsonNode =
                    JsonNode.Parse(plainJson) ?? throw new Exception("Could not parse JSON");
                AasContentTypeNormalizer.NormalizeJsonContentTypes(jsonNode);
                var environment = AasCore.Aas3_1.Jsonization.Deserialize.EnvironmentFrom(jsonNode);
                plainJson = jsonNode.ToJsonString();

                if (request.Overwrite)
                {
                    progressReporter.Report(
                        CalculateProgress(totalFiles, processedFiles, 0.35),
                        "overwriting",
                        $"Checking existing AAS for file {currentFileNumber} of {totalFiles}",
                        processedFiles,
                        totalFiles,
                        currentFileName
                    );

                    foreach (var aas in environment.AssetAdministrationShells ?? [])
                    {
                        if (aas == null)
                            continue;

                        try
                        {
                            var editorDescriptor = (
                                await ShellLoader.LoadAsync(
                                    request.AppUser.CurrentInfrastructureSettings,
                                    aas.Id,
                                    cancellationToken,
                                    request.AppUser
                                )
                            ).EditorDescriptor;

                            await ShellDeleter.DeleteShell(
                                editorDescriptor,
                                request.AppUser.CurrentInfrastructureSettings,
                                cancellationToken,
                                request.AppUser
                            );
                        }
                        catch (Exception)
                        {
                            // Ignore missing shell and proceed with import.
                        }
                    }
                }

                if (request.ImportMode == ImportMode.Derived)
                {
                    progressReporter.Report(
                        CalculateProgress(totalFiles, processedFiles, 0.6),
                        "transforming",
                        $"Transforming imported data for file {currentFileNumber} of {totalFiles}",
                        processedFiles,
                        totalFiles,
                        currentFileName
                    );

                    EnvironmentTransferModifier.ModifyEnvironment(environment, orga.IriPrefix);

                    var environmentJson = AasCore.Aas3_1.Jsonization.Serialize.ToJsonObject(
                        environment
                    );
                    AasContentTypeNormalizer.NormalizeJsonContentTypes(environmentJson);
                    plainJson = environmentJson.ToJsonString();
                }

                progressReporter.Report(
                    CalculateProgress(totalFiles, processedFiles, 0.8),
                    "saving",
                    $"Saving file {currentFileNumber} of {totalFiles}",
                    processedFiles,
                    totalFiles,
                    currentFileName
                );

                var saveResult = await SaveShellInInfrastructure.SaveSingle(
                    plainJson,
                    request.AppUser,
                    orga,
                    _appSettings.BaseUrl,
                    [],
                    _context,
                    cancellationToken
                );

                result.OkImport.Add(
                    new SingleImportResult
                    {
                        SourceFileName = currentFileName,
                        AasId = saveResult.AasId,
                        Success = true,
                    }
                );

                progressReporter.Report(
                    CalculateProgress(totalFiles, currentFileNumber, 0.0),
                    "saving",
                    $"Imported file {currentFileNumber} of {totalFiles}",
                    currentFileNumber,
                    totalFiles,
                    currentFileName
                );
            }
            catch (Exception exception)
            {
                result.NokImport.Add(
                    new SingleImportResult
                    {
                        SourceFileName = currentFileName,
                        ErrorMessage = $"Error saving Json. ({exception.Message})",
                    }
                );

                progressReporter.Report(
                    CalculateProgress(totalFiles, currentFileNumber, 0.0),
                    "saving",
                    $"File {currentFileNumber} of {totalFiles} could not be imported",
                    currentFileNumber,
                    totalFiles,
                    currentFileName
                );
            }
        }

        progressReporter.Report(
            100,
            "completed",
            "Import finished",
            totalFiles,
            totalFiles,
            completed: true,
            failed: result.NokImport.Count > 0
        );

        return result;
    }

    private static int CalculateProgress(
        int totalFiles,
        int processedFiles,
        double currentFileWeight
    )
    {
        if (totalFiles <= 0)
        {
            return 100;
        }

        var progress = 5 + ((processedFiles + currentFileWeight) / totalFiles) * 95;
        return (int)Math.Clamp(Math.Round(progress), 5, 99);
    }
}
