using AasShared.Exceptions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AasDesignerAasApi.Controllers;

/// <summary>
/// Maps failures of the connected repositories to HTTP answers for controllers that are not
/// covered by an exception filter: unknown resources become 404, other repository errors 502.
/// </summary>
public static class UpstreamActionResult
{
    public static async Task<ActionResult<T>> ExecuteAsync<T>(Func<Task<T>> action)
    {
        try
        {
            return await action();
        }
        catch (ResourceNotFoundException ex)
        {
            return new NotFoundObjectResult(ex.Message);
        }
        catch (UpstreamRequestFailedException ex)
        {
            return new ObjectResult(ex.Message) { StatusCode = StatusCodes.Status502BadGateway };
        }
    }
}
