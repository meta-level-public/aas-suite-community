using AasDesignerApi.Authorization;
using AasDesignerApi.Authorization.Model;
using AasDesignerApi.Model.Client;
using AasDesignerApi.Statistics;
using AasDesignerCommon.Statistics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Primitives;

namespace AasDesignerApi.Controllers.Internal;

[ApiController]
[Route("bff-internal/auth")]
[ApiExplorerSettings(IgnoreApi = true)]
public class BffAuthController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly StatisticsLogger _statisticsLogger;

    public BffAuthController(IUserService userService, StatisticsLogger statisticsLogger)
    {
        _userService = userService;
        _statisticsLogger = statisticsLogger;
    }

    public sealed class ExternalSessionRequest
    {
        public string AccessToken { get; set; } = string.Empty;
    }

    [HttpPost("external-session")]
    public async Task<ActionResult<AuthenticateResponse>> CreateExternalSession(
        ExternalSessionRequest request
    )
    {
        if (string.IsNullOrWhiteSpace(request.AccessToken))
        {
            return BadRequest(new { message = "AccessToken is required" });
        }

        var response = await _userService.AuthenticateExternalSession(
            request.AccessToken,
            IpAddress()
        );
        if (response.ResultCode == ResultCode.OK && response.OrgaSettings?.Count == 1)
        {
            _statisticsLogger.LogAction(StatisticActionType.LOGIN, response.OrgaSettings[0].OrgaId);
        }

        return Ok(response);
    }

    private string IpAddress()
    {
        if (Request.Headers.ContainsKey("X-Forwarded-For"))
        {
            return StringValues.IsNullOrEmpty(Request.Headers["X-Forwarded-For"])
                ? string.Empty
                : Request.Headers["X-Forwarded-For"].ToString();
        }

        return HttpContext.Connection?.RemoteIpAddress?.MapToIPv4().ToString() ?? string.Empty;
    }
}
