using AasDesignerApi.Model;
using AasDesignerAuthorization;
using AasDesignerCommon.Utils;
using AasDesignerDashboardApi.Dashboard.Queries.ExportHelpTexts;
using AasDesignerDashboardApi.Dashboard.Queries.ImportHelpTexts;
using AasDesignerSystemManagementApi.SystemManagement.Command.DeleteThemeDefinition;
using AasDesignerSystemManagementApi.SystemManagement.Command.ExportThemeDefinitions;
using AasDesignerSystemManagementApi.SystemManagement.Command.ImportThemeDefinitions;
using AasDesignerSystemManagementApi.SystemManagement.Command.SendApplicationTestMail;
using AasDesignerSystemManagementApi.SystemManagement.Command.SendKeycloakTestMail;
using AasDesignerSystemManagementApi.SystemManagement.Command.UpdateLegalLinksSettings;
using AasDesignerSystemManagementApi.SystemManagement.Command.UpdateMailSettings;
using AasDesignerSystemManagementApi.SystemManagement.Command.UpsertThemeDefinition;
using AasDesignerSystemManagementApi.SystemManagement.Model;
using AasDesignerSystemManagementApi.SystemManagement.Queries.GetConfiguration;
using AasDesignerSystemManagementApi.SystemManagement.Queries.GetHelpInformation;
using AasDesignerSystemManagementApi.SystemManagement.Queries.GetLegalLinksSettings;
using AasDesignerSystemManagementApi.SystemManagement.Queries.GetMailSettings;
using AasDesignerSystemManagementApi.SystemManagement.Queries.GetStatus;
using AasDesignerSystemManagementApi.SystemManagement.Queries.GetThemeDefinitions;
using AasShared.Controllers;
using AasShared.Exceptions;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;

namespace AasDesignerSystemManagementApi.Controllers;

[ApiController]
[Route("system-management-api/[controller]/[action]")]
[ApiExplorerSettings(GroupName = "internal-system-management")]
public class SystemManagementController : InternalApiBaseController
{
    private readonly IServiceProvider _serviceProvider;

    public SystemManagementController(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    [HttpGet]
    public async Task<SystemConfigurationDto> GetConfiguration()
    {
        var mediator = new Mediator(_serviceProvider);

        var query = new GetConfigurationQuery { };

        return await mediator.Send(query);
    }

    [HttpGet]
    [AasDesignerAuthorize(RequiredRoles = [AuthRoles.BENUTZER, AuthRoles.ORGA_ADMIN])]
    public async Task<SystemStatusDto> GetStatus(SystemType systemType, long infrastructureId)
    {
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser user)
            throw new UserNotFoundException();

        var mediator = new Mediator(_serviceProvider);

        var query = new GetStatusQuery
        {
            AppUser = user,
            InfrastructureId = infrastructureId,
            SystemType = systemType,
        };

        return await mediator.Send(query);
    }

    [HttpGet]
    public async Task<HelpInfoDto> GetHelpInfo()
    {
        var mediator = new Mediator(_serviceProvider);

        var command = new GetHelpInfoQuery { };

        return await mediator.Send(command);
    }

    [HttpPost]
    [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
    public async Task<FileStreamResult> ExportHelpTexts()
    {
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
            throw new UserNotFoundException();

        var mediator = new Mediator(_serviceProvider);

        var command = new ExportHelpTextsCommand { AppUser = benutzer };

        var stream = await mediator.Send(command);

        var filename = "export-help-text.zip";
        var provider = new FileExtensionContentTypeProvider();
        if (!provider.TryGetContentType(filename, out var contentType))
        {
            contentType = "application/octet-stream";
        }

        stream.Seek(0, SeekOrigin.Begin);

        return await Task.FromResult(File(stream, contentType, filename));
    }

    public class HelpUpdate
    {
        public string fileAsBase64 { get; set; } = string.Empty;
    }

    [HttpPost]
    [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
    public async Task<bool> ImportHelpTexts([FromBody] HelpUpdate helpUpdate)
    {
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser user)
            throw new UserNotFoundException();

        var mediator = new Mediator(_serviceProvider);

        var command = new ImportHelpTextsCommand
        {
            AppUser = user,
            fileAsBase64 = helpUpdate.fileAsBase64,
        };

        return await mediator.Send(command);
    }

    [HttpGet]
    public async Task<List<ThemeDefinitionDto>> GetThemeDefinitions()
    {
        var mediator = new Mediator(_serviceProvider);
        var query = new GetThemeDefinitionsQuery();
        return await mediator.Send(query);
    }

    [HttpGet]
    [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
    public async Task<MailSettingsDto> GetMailSettings()
    {
        var mediator = new Mediator(_serviceProvider);
        var query = new GetMailSettingsQuery();
        return await mediator.Send(query);
    }

    [HttpPut]
    [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
    public async Task<MailSettingsDto> UpdateMailSettings([FromBody] MailSettingsDto settings)
    {
        var mediator = new Mediator(_serviceProvider);
        var command = new UpdateMailSettingsCommand { Settings = settings };
        return await mediator.Send(command);
    }

    [HttpGet]
    [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
    public async Task<LegalLinksSettingsDto> GetLegalLinksSettings()
    {
        var mediator = new Mediator(_serviceProvider);
        var query = new GetLegalLinksSettingsQuery();
        return await mediator.Send(query);
    }

    [HttpPut]
    [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
    public async Task<LegalLinksSettingsDto> UpdateLegalLinksSettings(
        [FromBody] LegalLinksSettingsDto settings
    )
    {
        var mediator = new Mediator(_serviceProvider);
        var command = new UpdateLegalLinksSettingsCommand { Settings = settings };
        return await mediator.Send(command);
    }

    [HttpPost]
    [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
    public async Task SendApplicationTestMail([FromBody] SendApplicationTestMailRequestDto request)
    {
        var mediator = new Mediator(_serviceProvider);
        var command = new SendApplicationTestMailCommand { Request = request };
        await mediator.Send(command);
    }

    [HttpPost]
    [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
    public async Task SendKeycloakTestMail([FromBody] SendKeycloakTestMailRequestDto request)
    {
        var mediator = new Mediator(_serviceProvider);
        var command = new SendKeycloakTestMailCommand { Request = request };
        await mediator.Send(command);
    }

    [HttpPost]
    [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
    public async Task<ThemeDefinitionDto> UpsertThemeDefinition([FromBody] ThemeDefinitionDto theme)
    {
        var mediator = new Mediator(_serviceProvider);
        var command = new UpsertThemeDefinitionCommand { Theme = theme };
        return await mediator.Send(command);
    }

    [HttpDelete]
    [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
    public async Task<bool> DeleteThemeDefinition([FromQuery] string key)
    {
        var mediator = new Mediator(_serviceProvider);
        var command = new DeleteThemeDefinitionCommand { Key = key };
        return await mediator.Send(command);
    }

    [HttpPost]
    [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
    public async Task<FileStreamResult> ExportThemeDefinitions()
    {
        var mediator = new Mediator(_serviceProvider);
        var command = new ExportThemeDefinitionsCommand();
        var stream = await mediator.Send(command);

        var filename = "export-theme-definitions.zip";
        var provider = new FileExtensionContentTypeProvider();
        if (!provider.TryGetContentType(filename, out var contentType))
        {
            contentType = "application/octet-stream";
        }

        stream.Seek(0, SeekOrigin.Begin);
        return await Task.FromResult(File(stream, contentType, filename));
    }

    public class ThemeDefinitionsImport
    {
        public string FileAsBase64 { get; set; } = string.Empty;
    }

    [HttpPost]
    [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
    public async Task<bool> ImportThemeDefinitions([FromBody] ThemeDefinitionsImport themeImport)
    {
        var mediator = new Mediator(_serviceProvider);
        var command = new ImportThemeDefinitionsCommand { FileAsBase64 = themeImport.FileAsBase64 };
        return await mediator.Send(command);
    }
}
