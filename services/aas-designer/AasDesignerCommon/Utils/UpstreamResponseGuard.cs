using System.Net;
using AasShared.Exceptions;

namespace AasDesignerCommon.Utils;

/// <summary>
/// Checks responses of the connected AAS repositories before their content is passed on.
/// </summary>
public static class UpstreamResponseGuard
{
    /// <summary>
    /// Throws a <see cref="ResourceNotFoundException"/> when the repository reports that the
    /// requested resource does not exist, so the API can answer with 404 instead of passing on
    /// the repository's error body or failing while parsing it.
    /// </summary>
    public static void ThrowIfNotFound(HttpResponseMessage response, string resourceDescription)
    {
        if (response.StatusCode == HttpStatusCode.NotFound)
        {
            throw new ResourceNotFoundException($"{resourceDescription} was not found.");
        }
    }

    /// <summary>
    /// Throws an <see cref="UpstreamRequestFailedException"/> when the repository did not answer
    /// with a success status code, so a failed write is not reported as success.
    /// </summary>
    public static void EnsureSuccess(HttpResponseMessage response, string operationDescription)
    {
        if (!response.IsSuccessStatusCode)
        {
            throw new UpstreamRequestFailedException(
                $"{operationDescription} failed: the repository answered {(int)response.StatusCode} {response.StatusCode}."
            );
        }
    }
}
