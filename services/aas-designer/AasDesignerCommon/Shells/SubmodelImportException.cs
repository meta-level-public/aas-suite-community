using System.Net;

namespace AasDesignerCommon.Shells;

public class SubmodelImportException : Exception
{
    public SubmodelImportException(
        string submodelId,
        string idShort,
        HttpStatusCode statusCode,
        string message,
        Exception? innerException = null
    )
        : base(message, innerException)
    {
        SubmodelId = submodelId;
        IdShort = idShort;
        StatusCode = statusCode;
    }

    public string SubmodelId { get; }

    public string IdShort { get; }

    public HttpStatusCode StatusCode { get; }
}
