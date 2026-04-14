namespace AasDesignerApi.Exceptions;

public class UploadFailedException : Exception
{
    public UploadFailedException() { }

    public UploadFailedException(string message)
        : base(message) { }

    public UploadFailedException(string message, Exception inner)
        : base(message, inner) { }
}
