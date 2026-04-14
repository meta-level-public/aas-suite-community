namespace AasDesignerApi.Exceptions;

public class OrgaNotFoundException : Exception
{
    public OrgaNotFoundException() { }

    public OrgaNotFoundException(string message)
        : base(message) { }

    public OrgaNotFoundException(string message, Exception inner)
        : base(message, inner) { }
}
