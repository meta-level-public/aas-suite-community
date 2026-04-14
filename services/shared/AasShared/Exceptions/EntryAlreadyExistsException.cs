namespace AasShared.Exceptions;

public class EntryAlreadyExistsException : Exception
{
    public EntryAlreadyExistsException() { }

    public EntryAlreadyExistsException(string message)
        : base(message) { }

    public EntryAlreadyExistsException(string message, Exception inner)
        : base(message, inner) { }
}
