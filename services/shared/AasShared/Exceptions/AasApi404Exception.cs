namespace AasShared.Exceptions;

public class AasApi404Exception : Exception
{
    public AasApi404Exception(string message)
        : base(message) { }

    public AasApi404Exception(string message, Exception inner)
        : base(message, inner) { }
}
