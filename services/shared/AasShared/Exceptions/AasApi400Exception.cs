namespace AasShared.Exceptions;

public class AasApi400Exception : Exception
{
    public AasApi400Exception(string message)
        : base(message) { }

    public AasApi400Exception(string message, Exception inner)
        : base(message, inner) { }
}
