using AasDesignerApi.Model;
using AasDesignerAuthorization;
using AasDesignerCommon.Utils;
using AasDesignerHelpApi.HelpTexts.Commands.UpdateHelpEntry;
using AasDesignerHelpApi.HelpTexts.Queries;
using AasDesignerHelpApi.HelpTexts.Queries.GetAllHelpTexts;
using AasShared.Controllers;
using AasShared.Exceptions;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Org.BouncyCastle.Ocsp;

namespace AasDesignerHelpApi.Controllers;

[ApiController]
[Route("help-api/[controller]/[action]")]
[ApiExplorerSettings(GroupName = "help")]
public class HelpInternalController : InternalApiBaseController
{
    private readonly IServiceProvider _serviceProvider;

    public HelpInternalController(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<List<HelpTextDto>> GetHelpTexts()
    {
        var user = HttpContext.Items[AasDesignerConstants.APP_USER] as AppUser ?? null;

        var mediator = new Mediator(_serviceProvider);

        var query = new GetAllHelpTextsQuery { AppUser = user };

        return await mediator.Send(query);
    }

    [HttpPost]
    [AasDesignerAuthorize(
        RequiredRoles = new[] { AuthRoles.SYSTEM_HELP_EDITOR, AuthRoles.ORGA_HELP_EDITOR }
    )]
    public async Task<bool> UpdateHelpEntry([FromBody] HelpTextDto helpText)
    {
        var user =
            HttpContext.Items[AasDesignerConstants.APP_USER] as AppUser
            ?? throw new UserNotFoundException("User not found");

        var mediator = new Mediator(_serviceProvider);

        var command = new UpdateHelpEntryCommand { AppUser = user, HelpText = helpText };

        return await mediator.Send(command);
    }
}
