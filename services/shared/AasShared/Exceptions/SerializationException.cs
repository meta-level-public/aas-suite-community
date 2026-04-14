namespace AasShared.Exceptions;

public class SerializationException : Exception
{
    public SerializationException() { }

    public SerializationException(List<string> messages)
        : base(string.Join("\n", messages)) { }

    public SerializationException(string message, Exception inner)
        : base(message, inner) { }
}
