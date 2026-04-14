using AasDesignerApi.Authorization;
using AasDesignerApi.Authorization.Model;
using AasDesignerApi.Model;
using AasDesignerApi.Model.Client;
using AasDesignerApi.Statistics;
using AasDesignerAuthorization;
using AasDesignerCommon.Statistics;
using AasDesignerCommon.Utils;
using AasShared.Controllers;
using AasShared.Exceptions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Primitives;

namespace AasDesignerApi.Controllers.Internal;

[AasDesignerAuthorize]
[ApiController]
[Route("api/[controller]")]
[ApiExplorerSettings(GroupName = "internal")]
public class AuthController : InternalApiBaseController
{
    private readonly IUserService _userService;
    private readonly StatisticsLogger _statisticsLogger;

    public AuthController(IUserService userService, StatisticsLogger statisticsLogger)
    {
        _userService = userService;
        _statisticsLogger = statisticsLogger;
    }

    [AllowAnonymous]
    [HttpPost("authenticate")]
    public async Task<ActionResult<AuthenticateResponse>> Authenticate(AuthenticateRequest model)
    {
        var response = _userService.Authenticate(model, IpAddress());
        if (response.OrgaSettings.Count == 1)
        {
            _statisticsLogger.LogAction(StatisticActionType.LOGIN, response.OrgaSettings[0].OrgaId);
        }
        return await Task.FromResult(response);
    }

    [HttpPost("RegisterOrgaSwitch")]
    public async Task RegisterOrgaSwitch(long orgaId)
    {
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser user)
            throw new UserNotFoundException();

        _userService.RegisterOrgaSwitch(user, orgaId);

        _statisticsLogger.LogAction(StatisticActionType.LOGIN, orgaId);
        await Task.CompletedTask;
    }

    [HttpPost("AcceptPrivacy")]
    [AasDesignerAuthorize(
        RequiredRoles = [AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN, AuthRoles.ORGA_ADMIN]
    )]
    public async Task AcceptPrivacy()
    {
        if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser user)
            throw new UserNotFoundException();

        _userService.AcceptPrivacy(user);

        await Task.CompletedTask;
    }

    public class RefreshTokenReq
    {
        public string RefreshToken { get; set; } = string.Empty;
    }

    [AllowAnonymous]
    [HttpPost("refresh-token")]
    public async Task<ActionResult<AuthenticateResponse>> RefreshToken(RefreshTokenReq data)
    {
        var response = _userService.RefreshToken(data.RefreshToken, IpAddress());

        return await Task.FromResult(response);
    }

    [HttpPost("revoke-token")]
    [AllowAnonymous]
    public async Task<ActionResult> RevokeToken(RevokeTokenRequest model)
    {
        var token = model.Token;

        if (string.IsNullOrEmpty(token))
            return BadRequest(new { message = "Token is required" });

        _userService.RevokeToken(token, IpAddress());

        return Ok(await Task.FromResult(new { message = "Token revoked" }));
    }

    [HttpGet("{id}/refresh-tokens")]
    public async Task<ActionResult<List<RefreshToken>>> GetRefreshTokens(int id)
    {
        var user = _userService.GetById(id);

        return await Task.FromResult(user.RefreshTokens);
    }

    [HttpGet("check-user")]
    [AllowAnonymous]
    public async Task<ActionResult<Model.Benutzer?>> CheckUser()
    {
        var result = HttpContext.Items[AasDesignerConstants.CURRENT_USER] as Model.Benutzer;
        return await Task.FromResult(result);
    }

    private string IpAddress()
    {
        // get source ip address for the current request
        if (Request.Headers.ContainsKey("X-Forwarded-For"))
            return StringValues.IsNullOrEmpty(Request.Headers["X-Forwarded-For"])
                ? string.Empty
                : Request.Headers["X-Forwarded-For"].ToString();
        else
            return HttpContext.Connection?.RemoteIpAddress?.MapToIPv4().ToString() ?? string.Empty;
    }

    [HttpPost("LoginPublicViewer")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthenticateResponse>> LoginPublicViewer(ViewerLogin loginData)
    {
        return await Task.FromResult(_userService.AuthenticateViewer(loginData));
    }
}
