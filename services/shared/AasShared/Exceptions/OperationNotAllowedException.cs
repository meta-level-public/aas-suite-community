namespace AasShared.Exceptions;

public class OperationNotAllowedException : Exception
{
    public OperationNotAllowedException() { }

    public OperationNotAllowedException(string message)
        : base(message) { }

    public OperationNotAllowedException(string message, Exception inner)
        : base(message, inner) { }
}
