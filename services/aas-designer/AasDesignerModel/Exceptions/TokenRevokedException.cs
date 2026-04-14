namespace AasDesignerApi.Exceptions;

public class TokenRevokedException : Exception
{
    public TokenRevokedException() { }

    public TokenRevokedException(string message)
        : base(message) { }

    public TokenRevokedException(string message, Exception inner)
        : base(message, inner) { }
}
