using AasDesignerAasApi.Package.Commands;
using AasDesignerAasApi.ServerSentEvent;
using AasDesignerApi.Model;
using AasDesignerCommon.Enum;
using AasDesignerCommon.Model;
using AasDesignerCommon.Packaging;
using AasDesignerCommon.Shells;
using AasDesignerCommon.Utils;
using AasDesignerModel;
using AasShared.Configuration;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AasDesignerAasApi.Package.Commands.ImportPackage;

public class ImportPackageCommand : IRequest<ImportPackageResult>
{
    public AppUser AppUser { get; set; } = null!;
    public List<MemoryStream> MemoryStreams { get; set; } = null!;
    public List<string> SourceFileNames { get; set; } = [];
    public ImportMode ImportMode { get; set; }
    public bool Overwrite { get; set; }
    public List<string> ExcludedSubmodelIds { get; set; } = [];
    public Guid? ProgressClientId { get; set; }
    public string ImportOperationId { get; set; } = string.Empty;
}

public class ImportPackageCommandHandler
    : IRequestHandler<ImportPackageCommand, ImportPackageResult>
{
    private readonly IApplicationDbContext _context;
    private readonly ImportProgressMessageStore _importProgressMessageStore;
    private readonly AppSettings _appSettings;

    public ImportPackageCommandHandler(
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
        ImportPackageCommand request,
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
                var package = PackagingUtil.ReadPackage(stream);

                progressReporter.Report(
                    CalculateProgress(totalFiles, processedFiles, 0.35),
                    request.Overwrite ? "overwriting" : "processing",
                    request.Overwrite
                        ? $"Checking existing AAS for file {currentFileNumber} of {totalFiles}"
                        : $"Preparing import for file {currentFileNumber} of {totalFiles}",
                    processedFiles,
                    totalFiles,
                    currentFileName
                );

                foreach (var aas in package.Environment?.AssetAdministrationShells ?? [])
                {
                    if (aas == null)
                        continue;

                    var aasId = aas.Id;
                    if (!request.Overwrite)
                    {
                        continue;
                    }

                    try
                    {
                        var editorDescriptor = (
                            await ShellLoader.LoadAsync(
                                request.AppUser.CurrentInfrastructureSettings,
                                aasId,
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

                if (request.ImportMode == ImportMode.Derived && package.Environment != null)
                {
                    progressReporter.Report(
                        CalculateProgress(totalFiles, processedFiles, 0.55),
                        "transforming",
                        $"Transforming imported data for file {currentFileNumber} of {totalFiles}",
                        processedFiles,
                        totalFiles,
                        currentFileName
                    );

                    EnvironmentTransferModifier.ModifyEnvironment(
                        package.Environment,
                        request.AppUser.Organisation.IriPrefix
                    );
                }

                if (package.Environment == null)
                {
                    throw new Exception("Package environment not found");
                }

                var packageSubmodels = GetPackageSubmodels(package.Environment);
                var packageJson = AasCore.Aas3_1.Jsonization.Serialize.ToJsonObject(
                    package.Environment
                );
                AasContentTypeNormalizer.NormalizeJsonContentTypes(packageJson);
                var plainJson = packageJson.ToJsonString();

                var files = new List<ProvidedFile>();
                foreach (var file in package.Files)
                {
                    files.Add(
                        new ProvidedFile
                        {
                            Filename = file.Filename,
                            Stream = new MemoryStream(file.Content ?? []),
                        }
                    );
                }

                if (package.Thumbnail != null)
                {
                    files.Add(
                        new ProvidedFile
                        {
                            Filename = package.Thumbnail.Filename,
                            Stream = new MemoryStream(package.Thumbnail.Content ?? []),
                        }
                    );
                }

                progressReporter.Report(
                    CalculateProgress(totalFiles, processedFiles, 0.8),
                    "saving",
                    $"Saving file {currentFileNumber} of {totalFiles}",
                    processedFiles,
                    totalFiles,
                    currentFileName
                );

                try
                {
                    var saveResult = await SaveShellInInfrastructure.SaveSingle(
                        plainJson,
                        request.AppUser,
                        orga,
                        _appSettings.BaseUrl,
                        files,
                        _context,
                        cancellationToken,
                        request.ExcludedSubmodelIds
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
                catch (SubmodelImportBatchException exception)
                {
                    var failedSubmodels = exception
                        .Failures.Select(failure =>
                        {
                            var failedSubmodel =
                                packageSubmodels.FirstOrDefault(sm =>
                                    sm.SubmodelId == failure.SubmodelId
                                )
                                ?? new SubmodelImportCandidateResult
                                {
                                    SubmodelId = failure.SubmodelId,
                                    IdShort = failure.IdShort,
                                };

                            return new FailedSubmodelImportResult
                            {
                                SubmodelId = failedSubmodel.SubmodelId,
                                IdShort = failedSubmodel.IdShort,
                                ErrorMessage = failure.Message,
                            };
                        })
                        .ToList();

                    var excludedSubmodelIds = request
                        .ExcludedSubmodelIds.Concat(failedSubmodels.Select(sm => sm.SubmodelId))
                        .Where(id => !string.IsNullOrWhiteSpace(id))
                        .Distinct(StringComparer.Ordinal)
                        .ToList();

                    result.NokImport.Add(
                        new SingleImportResult
                        {
                            SourceFileName = currentFileName,
                            ErrorMessage =
                                failedSubmodels.FirstOrDefault()?.ErrorMessage ?? exception.Message,
                            RequiresConfirmation = true,
                            CanImportPartially = true,
                            ExcludedSubmodelIds = excludedSubmodelIds,
                            FailedSubmodels = failedSubmodels,
                            ImportableSubmodels = packageSubmodels
                                .Where(sm => !excludedSubmodelIds.Contains(sm.SubmodelId))
                                .ToList(),
                        }
                    );

                    progressReporter.Report(
                        CalculateProgress(totalFiles, currentFileNumber, 0.0),
                        "saving",
                        $"Imported file {currentFileNumber} of {totalFiles} with skipped submodels",
                        currentFileNumber,
                        totalFiles,
                        currentFileName
                    );
                }
                catch (SubmodelImportException exception)
                {
                    var excludedSubmodelIds = request
                        .ExcludedSubmodelIds.Append(exception.SubmodelId)
                        .Where(id => !string.IsNullOrWhiteSpace(id))
                        .Distinct(StringComparer.Ordinal)
                        .ToList();

                    result.NokImport.Add(
                        new SingleImportResult
                        {
                            SourceFileName = currentFileName,
                            ErrorMessage = exception.Message,
                            RequiresConfirmation = true,
                            CanImportPartially = true,
                            ExcludedSubmodelIds = excludedSubmodelIds,
                            FailedSubmodels =
                            [
                                new FailedSubmodelImportResult
                                {
                                    SubmodelId = exception.SubmodelId,
                                    IdShort = exception.IdShort,
                                    ErrorMessage = exception.Message,
                                },
                            ],
                            ImportableSubmodels = packageSubmodels
                                .Where(sm => !excludedSubmodelIds.Contains(sm.SubmodelId))
                                .ToList(),
                        }
                    );

                    progressReporter.Report(
                        CalculateProgress(totalFiles, currentFileNumber, 0.0),
                        "saving",
                        $"Imported file {currentFileNumber} of {totalFiles} with skipped submodels",
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
                            ErrorMessage = exception.Message,
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
            catch (Exception exception)
            {
                result.NokImport.Add(
                    new SingleImportResult
                    {
                        SourceFileName = currentFileName,
                        ErrorMessage = $"Error reading AASX. ({exception.Message})",
                    }
                );

                progressReporter.Report(
                    CalculateProgress(totalFiles, currentFileNumber, 0.0),
                    "reading",
                    $"File {currentFileNumber} of {totalFiles} could not be read",
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

    private static List<SubmodelImportCandidateResult> GetPackageSubmodels(
        AasCore.Aas3_1.Environment environment
    )
    {
        var result = new List<SubmodelImportCandidateResult>();

        foreach (var aas in environment.AssetAdministrationShells ?? [])
        {
            foreach (var smRef in aas.Submodels ?? [])
            {
                var submodelId = smRef.Keys.FirstOrDefault()?.Value ?? string.Empty;
                if (
                    string.IsNullOrWhiteSpace(submodelId)
                    || result.Any(sm => sm.SubmodelId == submodelId)
                )
                {
                    continue;
                }

                var submodel = environment.Submodels?.FirstOrDefault(sm => sm.Id == submodelId);
                result.Add(
                    new SubmodelImportCandidateResult
                    {
                        SubmodelId = submodelId,
                        IdShort = submodel?.IdShort ?? string.Empty,
                    }
                );
            }
        }

        return result;
    }
}
