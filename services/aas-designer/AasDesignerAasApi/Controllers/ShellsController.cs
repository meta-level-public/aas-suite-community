using AasDesignerAasApi.Shells;
using AasDesignerAasApi.Shells.Command.DeleteShell;
using AasDesignerAasApi.Shells.Command.DeleteShellsBulk;
using AasDesignerAasApi.Shells.Command.DownloadShellsBulk;
using AasDesignerAasApi.Shells.Commands.ChangeAasIdentifier;
using AasDesignerAasApi.Shells.Commands.ChangeAllIds;
using AasDesignerAasApi.Shells.Commands.CheckChangeAllIds;
using AasDesignerAasApi.Shells.Commands.CreateInstance;
using AasDesignerAasApi.Shells.Commands.CreateShell;
using AasDesignerAasApi.Shells.Commands.CreateShellFromAssistant;
using AasDesignerAasApi.Shells.Commands.ExportShellAsAasx;
using AasDesignerAasApi.Shells.Commands.Model;
using AasDesignerAasApi.Shells.Commands.SaveShell;
using AasDesignerAasApi.Shells.Commands.TransferShell;
using AasDesignerAasApi.Shells.Queries;
using AasDesignerAasApi.Shells.Queries.DiscoverShells;
using AasDesignerAasApi.Shells.Queries.GetContainedSubmodels;
using AasDesignerAasApi.Shells.Queries.GetNameplateInfos;
using AasDesignerAasApi.Shells.Queries.GetShellForEditing;
using AasDesignerAasApi.Shells.Queries.GetShellList;
using AasDesignerAasApi.Shells.Queries.GetShellPlain;
using AasDesignerAasApi.Shells.Queries.GetThumbnail;
using AasDesignerAasApi.Shells.Queries.SearchShells;
using AasDesignerApi.Model;
using AasDesignerApi.Statistics;
using AasDesignerAuthorization;
using AasDesignerCommon.Model;
using AasDesignerCommon.Shells;
using AasDesignerCommon.Statistics;
using AasDesignerCommon.Utils;
using AasShared.Controllers;
using AasShared.Exceptions;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;
using Newtonsoft.Json;

namespace AasDesignerAasApi.Controllers;

[ApiController]
[Route("aas-api/[controller]/[action]")]
[ApiExplorerSettings(GroupName = "internal-aas")]
public class ShellsController : InternalApiBaseController
{
    private readonly IServiceProvider _serviceProvider;
    private readonly StatisticsLogger _statisticsLogger;

    public ShellsController(IServiceProvider serviceProvider, StatisticsLogger statisticsLogger)
    {
        _serviceProvider = serviceProvider;
        _statisticsLogger = statisticsLogger;
    }

    [HttpGet]
    [AasDesignerAuthorize(
        RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
    )]
    public async Task<ShellListVm> GetAllShells(
        int count = 10,
        string? cursor = null,
        string filterIdShort = "",
        string filterAssetId = "",
        string filterAssetKind = ""
    )
    {
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
            throw new UserNotFoundException();

        var mediator = new Mediator(_serviceProvider);

        var query = new GetShellListQuery
        {
            AppUser = benutzer,
            Count = count,
            Cursor = cursor,
            FilterIdShort = filterIdShort,
            FilterAssetId = filterAssetId,
            FilterAssetKind = filterAssetKind,
        };

        return await mediator.Send(query);
    }

    [HttpGet]
    [AasDesignerAuthorize(
        RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
    )]
    public async Task<ShellForEditingVm> GetShell(string aasIdentifier)
    {
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
            throw new UserNotFoundException();

        var mediator = new Mediator(_serviceProvider);

        var query = new GetShellForEditingQuery()
        {
            AppUser = benutzer,
            AasIdentifier = aasIdentifier,
        };

        return await mediator.Send(query);
    }

    [HttpGet]
    [AasDesignerAuthorize(
        RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
    )]
    public async Task<ShellPlainVm> GetShellPlain(string aasIdentifier)
    {
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
            throw new UserNotFoundException();

        var mediator = new Mediator(_serviceProvider);

        var query = new GetShellPlainQuery() { AppUser = benutzer, AasIdentifier = aasIdentifier };

        return await mediator.Send(query);
    }

    [HttpDelete]
    [AasDesignerAuthorize(
        RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
    )]
    public async Task<bool> Delete(string aasIdentifier)
    {
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
            throw new UserNotFoundException();

        var mediator = new Mediator(_serviceProvider);

        var query = new DeleteShellCommand { AppUser = benutzer, AasIdentifier = aasIdentifier };

        return await mediator.Send(query);
    }

    [HttpPost]
    [HttpPost, DisableRequestSizeLimit]
    [RequestFormLimits(ValueLengthLimit = int.MaxValue, MultipartBodyLengthLimit = long.MaxValue)]
    [AasDesignerAuthorize(
        RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
    )]
    public async Task<SaveShellResult> Save(IFormCollection data)
    {
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
            throw new UserNotFoundException();

        var mediator = new Mediator(_serviceProvider);
        var files = ShellMultipartRequestParser.ParseProvidedFiles(data);

        var editorDescriptorString = data["editorDescriptor"].ToString();
        var editorDescriptor = JsonConvert.DeserializeObject<EditorDescriptor>(
            editorDescriptorString
        );

        var command = new SaveShellCommand
        {
            AppUser = benutzer,
            PlainJson = data["plainJson"].ToString(),
            ProvidedFileStreams = files,
            CreateChangelogEntry =
                data["createChangelogEntry"].ToString().ToLower() == "false" ? false : true,
            EditorDescriptor = editorDescriptor ?? new EditorDescriptor(),
            DeletedSubmodels =
                JsonConvert.DeserializeObject<List<string>>(data["deletedSubmodels"].ToString())
                ?? [],
        };

        var result = await mediator.Send(command);

        var additionalData = RecentAasDataFactory.CreateFromPlainJson(
            command.PlainJson,
            result.AasId,
            benutzer.CurrentInfrastructureSettings.Id,
            StatisticActionType.SAVE_SHELL
        );
        _statisticsLogger.LogAction(
            StatisticActionType.SAVE_SHELL,
            benutzer.OrganisationId,
            benutzer.BenutzerId,
            JsonConvert.SerializeObject(additionalData)
        );

        result.Environment = null;

        return result;
    }

    [HttpPost]
    [AasDesignerAuthorize(
        RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
    )]
    public async Task<SaveShellResult> Create()
    {
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
            throw new UserNotFoundException();

        var mediator = new Mediator(_serviceProvider);

        var command = new CreateShellCommand { AppUser = benutzer };

        var result = await mediator.Send(command);

        var additionalData = RecentAasDataFactory.CreateFromEnvironment(
            result.Environment,
            result.AasId,
            benutzer.CurrentInfrastructureSettings.Id,
            StatisticActionType.CREATE_SHELL
        );
        _statisticsLogger.LogAction(
            StatisticActionType.CREATE_SHELL,
            benutzer.OrganisationId,
            benutzer.BenutzerId,
            JsonConvert.SerializeObject(additionalData)
        );

        result.Environment = null;

        return result;
    }

    [HttpPost]
    [AasDesignerAuthorize(
        RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
    )]
    public async Task<TransferShellResponse> Transfer([FromBody] TransferShellRequest request)
    {
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
            throw new UserNotFoundException();

        var mediator = new Mediator(_serviceProvider);

        var command = new TransferShellCommand
        {
            AppUser = benutzer,
            TransferShellRequest = request,
        };
        var result = await mediator.Send(command);

        var additionalData = RecentAasDataFactory.Create(
            result.AasIdentifier,
            benutzer.CurrentInfrastructureSettings.Id,
            string.Empty,
            StatisticActionType.CREATE_SHELL
        );
        _statisticsLogger.LogAction(
            StatisticActionType.CREATE_SHELL,
            benutzer.OrganisationId,
            benutzer.BenutzerId,
            JsonConvert.SerializeObject(additionalData)
        );

        return result;
    }

    [HttpPost]
    [AasDesignerAuthorize(
        RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
    )]
    public async Task<FileStreamResult> ExportAasx([FromBody] ShellExportOptions exportOpts)
    {
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
            throw new UserNotFoundException();

        var mediator = new Mediator(_serviceProvider);

        var command = new ExportShellAsAasxCommand
        {
            AppUser = benutzer,
            ExportOptions = exportOpts,
        };

        var stream = await mediator.Send(command);

        var filename = "export.aasx";
        var provider = new FileExtensionContentTypeProvider();
        if (!provider.TryGetContentType(filename, out var contentType))
        {
            contentType = "application/octet-stream";
        }

        stream.Seek(0, SeekOrigin.Begin);

        return await Task.FromResult(File(stream, contentType, filename));
    }

    [HttpDelete]
    [AasDesignerAuthorize(
        RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
    )]
    public async Task<bool> DeleteShellsBulk(List<string> aasIdentifiers)
    {
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
            throw new UserNotFoundException();

        var mediator = new Mediator(_serviceProvider);

        var query = new DeleteShellsBulkCommand
        {
            AppUser = benutzer,
            AasIdentifiers = aasIdentifiers,
        };

        return await mediator.Send(query);
    }

    [HttpPost]
    [AasDesignerAuthorize(
        RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
    )]
    public async Task<FileStreamResult> DownloadShellsBulk(List<string> aasIdentifiers)
    {
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
            throw new UserNotFoundException();

        var mediator = new Mediator(_serviceProvider);

        var query = new DownloadShellsBulkCommand
        {
            AppUser = benutzer,
            AasIdentifiers = aasIdentifiers,
        };

        var zipStream = await mediator.Send(query);

        var filename = "export.zip";
        var provider = new FileExtensionContentTypeProvider();
        if (!provider.TryGetContentType(filename, out var contentType))
        {
            contentType = "application/octet-stream";
        }

        zipStream.Seek(0, SeekOrigin.Begin);

        return await Task.FromResult(File(zipStream, contentType, filename));
    }

    [HttpPost]
    [HttpPost, DisableRequestSizeLimit]
    [RequestFormLimits(ValueLengthLimit = int.MaxValue, MultipartBodyLengthLimit = long.MaxValue)]
    [AasDesignerAuthorize(
        RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
    )]
    public async Task<SaveShellResult> CreateFromAssistant(IFormCollection data)
    {
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
            throw new UserNotFoundException();

        var mediator = new Mediator(_serviceProvider);
        var files = ShellMultipartRequestParser.ParseProvidedFiles(
            data,
            allowUnprefixedFilesAsAdded: true
        );
        var command = new CreateShellFromAssistantCommand
        {
            AppUser = benutzer,
            PlainJson = data["plainJson"].ToString(),
            ProvidedFiles = files,
        };

        var result = await mediator.Send(command);

        var additionalData = RecentAasDataFactory.CreateFromPlainJson(
            command.PlainJson,
            result.AasId,
            benutzer.CurrentInfrastructureSettings.Id,
            StatisticActionType.CREATE_SHELL
        );
        _statisticsLogger.LogAction(
            StatisticActionType.CREATE_SHELL,
            benutzer.OrganisationId,
            benutzer.BenutzerId,
            JsonConvert.SerializeObject(additionalData)
        );

        result.Environment = null;

        return result;
    }

    [HttpPost]
    [AasDesignerAuthorize(
        RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
    )]
    public async Task<ShellListVm> Discover(string globalAssetId)
    {
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
            throw new UserNotFoundException();

        var mediator = new Mediator(_serviceProvider);

        var query = new DiscoverShellsQuery { AppUser = benutzer, GlobalAssetId = globalAssetId };

        return await mediator.Send(query);
    }

    [HttpPost]
    [AasDesignerAuthorize(
        RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
    )]
    public async Task<ShellListVm> Search(ShellSearchParams shellSearchParams)
    {
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
            throw new UserNotFoundException();

        var mediator = new Mediator(_serviceProvider);

        var query = new SearchShellsQuery { AppUser = benutzer, SearchParams = shellSearchParams };

        return await mediator.Send(query);
    }

    [HttpPost]
    [AasDesignerAuthorize(
        RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
    )]
    public async Task<TransferShellResponse> Duplicate([FromBody] string shellId)
    {
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
            throw new UserNotFoundException();

        var mediator = new Mediator(_serviceProvider);

        var command = new TransferShellCommand
        {
            AppUser = benutzer,
            TransferShellRequest = new TransferShellRequest
            {
                AasIdentifier = shellId,
                TargetRepoId = benutzer.CurrentInfrastructureSettings.Id,
            },
        };

        var result = await mediator.Send(command);

        var additionalData = RecentAasDataFactory.Create(
            result.AasIdentifier,
            benutzer.CurrentInfrastructureSettings.Id,
            string.Empty,
            StatisticActionType.CREATE_SHELL
        );
        _statisticsLogger.LogAction(
            StatisticActionType.CREATE_SHELL,
            benutzer.OrganisationId,
            benutzer.BenutzerId,
            JsonConvert.SerializeObject(additionalData)
        );

        return result;
    }

    [HttpPost]
    [AasDesignerAuthorize(
        RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
    )]
    public async Task<string> CreateInstance(CreateInstanceRequest createInstanceRequest)
    {
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
            throw new UserNotFoundException();

        var mediator = new Mediator(_serviceProvider);

        var command = new CreateInstanceCommand
        {
            AppUser = benutzer,
            CreateInstanceRequest = createInstanceRequest,
        };

        var result = await mediator.Send(command);

        var additionalData = RecentAasDataFactory.Create(
            result,
            benutzer.CurrentInfrastructureSettings.Id,
            string.Empty,
            StatisticActionType.CREATE_SHELL
        );
        _statisticsLogger.LogAction(
            StatisticActionType.CREATE_SHELL,
            benutzer.OrganisationId,
            benutzer.BenutzerId,
            JsonConvert.SerializeObject(additionalData)
        );

        return result;
    }

    [HttpGet]
    [AasDesignerAuthorize(
        RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
    )]
    public async Task<ContainedSubmodelsVm> GetContainedSubmdels(string shellId)
    {
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
            throw new UserNotFoundException();

        var mediator = new Mediator(_serviceProvider);

        var query = new GetContainedSubmodelsQuery { AppUser = benutzer, AasIdentifier = shellId };

        return await mediator.Send(query);
    }

    [HttpGet]
    [AasDesignerAuthorize(
        RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
    )]
    public async Task<FileStreamResult> GetThumbnail(string shellId)
    {
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
            throw new UserNotFoundException();

        var mediator = new Mediator(_serviceProvider);

        var query = new GetThumbnailQuery { AppUser = benutzer, AasIdentifier = shellId };

        var stream = await mediator.Send(query);

        if (stream == null || stream.Length == 0)
        {
            var notFoundStream = GetThumbnailQuery.GetNoThumbSvgStream();
            return await Task.FromResult(
                File(notFoundStream, "image/svg+xml", "no-thumbnail-set.svg")
            );
            // throw new ResourceNotFoundException("Thumbnail not found");
        }

        var filename = "thumbnail";
        var provider = new FileExtensionContentTypeProvider();
        if (!provider.TryGetContentType(filename, out var contentType))
        {
            contentType = "application/octet-stream";
        }

        stream.Seek(0, SeekOrigin.Begin);

        return await Task.FromResult(File(stream, contentType, filename));
    }

    [HttpGet]
    [AasDesignerAuthorize(
        RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
    )]
    public async Task<NameplateInfosVm> GetNameplateInfos(string shellId)
    {
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
            throw new UserNotFoundException();

        var mediator = new Mediator(_serviceProvider);

        var query = new GetNameplateInfosQuery { AppUser = benutzer, AasIdentifier = shellId };

        return await mediator.Send(query);
    }

    [HttpPost]
    [AasDesignerAuthorize(
        RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
    )]
    public async Task<string> ChangeAasIdentifier(
        [FromBody] string shellId,
        string newAasIdentifier
    )
    {
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
            throw new UserNotFoundException();

        var mediator = new Mediator(_serviceProvider);

        var command = new ChangeAasIdentifierCommand
        {
            AppUser = benutzer,
            AasIdentifier = shellId,
            NewAasIdentifier = newAasIdentifier,
        };

        return await mediator.Send(command);
    }

    public class ChangeIdsRequest
    {
        public List<IdModification> modifications { get; set; } = [];
        public EditorDescriptor editorDescriptor { get; set; } = new();
    }

    [HttpPost]
    [AasDesignerAuthorize(
        RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
    )]
    public async Task<string> ChangeAllIds(ChangeIdsRequest request)
    {
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
            throw new UserNotFoundException();

        var mediator = new Mediator(_serviceProvider);

        var command = new ChangeAllIdsCommand
        {
            AppUser = benutzer,
            Modifications = request.modifications,
            EditorDescriptor = request.editorDescriptor,
        };

        return await mediator.Send(command);
    }

    [HttpPost]
    [AasDesignerAuthorize(
        RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
    )]
    public async Task<List<ModificationCheckResult>> CheckChangeAllIds(
        List<IdModification> modifications
    )
    {
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
            throw new UserNotFoundException();

        var mediator = new Mediator(_serviceProvider);

        var command = new CheckChangeAllIdsCommand
        {
            AppUser = benutzer,
            Modifications = modifications,
        };

        return await mediator.Send(command);
    }
}
