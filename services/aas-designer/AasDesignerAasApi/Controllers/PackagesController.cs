using AasDesignerAasApi.Package.Commands;
using AasDesignerAasApi.Package.Commands.ImportJson;
using AasDesignerAasApi.Package.Commands.ImportPackage;
using AasDesignerApi.Model;
using AasDesignerAuthorization;
using AasDesignerCommon.Enum;
using AasDesignerCommon.Utils;
using AasShared.Controllers;
using AasShared.Exceptions;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AasDesignerAasApi.Controllers;

public class ImportPackagesFormData
{
    [FromForm(Name = "file[]")]
    public List<IFormFile> Files { get; set; } = [];

    [FromForm(Name = "operationId")]
    public string? OperationId { get; set; }

    [FromForm(Name = "sseClientId")]
    public string? SseClientId { get; set; }

    [FromForm(Name = "importMode")]
    public string? ImportMode { get; set; }

    [FromForm(Name = "importType")]
    public string? ImportType { get; set; }

    [FromForm(Name = "overwrite")]
    public bool Overwrite { get; set; }

    [FromForm(Name = "excludedSubmodelIds")]
    public List<string> ExcludedSubmodelIds { get; set; } = [];
}

[ApiController]
[Route("aas-api/[controller]/[action]")]
[ApiExplorerSettings(GroupName = "internal-aas")]
public class PackagesController : InternalApiBaseController
{
    private readonly IServiceProvider _serviceProvider;

    public PackagesController(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    [HttpPost, DisableRequestSizeLimit]
    [Consumes("multipart/form-data")]
    [RequestFormLimits(ValueLengthLimit = int.MaxValue, MultipartBodyLengthLimit = long.MaxValue)]
    [AasDesignerAuthorize(
        RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
    )]
    public async Task<ImportPackageResult> Import([FromForm] ImportPackagesFormData formData)
    {
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
            throw new UserNotFoundException();

        var mediator = new Mediator(_serviceProvider);

        var importModeString = formData.ImportMode ?? "original";
        if (!Enum.TryParse(importModeString, true, out ImportMode importMode))
        {
            importMode = ImportMode.Original;
        }

        var importTypeString = formData.ImportType ?? "aasx";
        if (!Enum.TryParse(importTypeString, true, out ImportType importType))
        {
            importType = ImportType.AASX;
        }

        var excludedSubmodelIds = formData
            .ExcludedSubmodelIds.SelectMany(v =>
                (v ?? string.Empty).Split(
                    ',',
                    StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries
                )
            )
            .Distinct(StringComparer.Ordinal)
            .ToList();

        Guid? progressClientId = null;
        if (Guid.TryParse(formData.SseClientId, out var parsedClientId))
        {
            progressClientId = parsedClientId;
        }

        var operationId = string.IsNullOrWhiteSpace(formData.OperationId)
            ? Guid.NewGuid().ToString("N")
            : formData.OperationId;

        var memoryStreams = new List<MemoryStream>();
        var sourceFileNames = new List<string>();

        IRequest<ImportPackageResult> query;
        if (importType == ImportType.AASX)
        {
            foreach (var file in formData.Files)
            {
                if (file.Length <= 0)
                {
                    continue;
                }

                var ms = new MemoryStream();
                file.CopyTo(ms);
                var fixedMs = OriginFixUtil.CheckAndFixPackageOrigin(ms);
                if (fixedMs != null)
                {
                    memoryStreams.Add(fixedMs);
                    sourceFileNames.Add(file.FileName);
                }
            }

            query = new ImportPackageCommand
            {
                AppUser = benutzer,
                MemoryStreams = memoryStreams,
                ImportMode = importMode,
                Overwrite = formData.Overwrite,
                ExcludedSubmodelIds = excludedSubmodelIds,
                SourceFileNames = sourceFileNames,
                ProgressClientId = progressClientId,
                ImportOperationId = operationId,
            };
        }
        else
        {
            foreach (var file in formData.Files)
            {
                if (file.Length <= 0)
                {
                    continue;
                }

                var ms = new MemoryStream();
                file.CopyTo(ms);
                memoryStreams.Add(ms);
                sourceFileNames.Add(file.FileName);
            }

            query = new ImportJsonCommand
            {
                AppUser = benutzer,
                MemoryStreams = memoryStreams,
                ImportMode = importMode,
                Overwrite = formData.Overwrite,
                SourceFileNames = sourceFileNames,
                ProgressClientId = progressClientId,
                ImportOperationId = operationId,
            };
        }

        return await mediator.Send(query);
    }
}
