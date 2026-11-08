namespace AasShared.Exceptions;

/// <summary>
/// A connected repository, registry or discovery service answered a request with an error.
/// </summary>
public class UpstreamRequestFailedException : Exception
{
    public UpstreamRequestFailedException() { }

    public UpstreamRequestFailedException(string message)
        : base(message) { }

    public UpstreamRequestFailedException(string message, Exception inner)
        : base(message, inner) { }
}
