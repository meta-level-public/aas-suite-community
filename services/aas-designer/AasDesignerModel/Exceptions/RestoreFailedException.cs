namespace AasDesignerApi.Exceptions;

public class RestoreFailedException : Exception
{
    public RestoreFailedException() { }

    public RestoreFailedException(string message)
        : base(message) { }

    public RestoreFailedException(string message, Exception inner)
        : base(message, inner) { }
}
