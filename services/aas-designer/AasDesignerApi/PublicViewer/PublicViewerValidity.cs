namespace AasDesignerApi.PublicViewer
{
    public class PublicViewerValidity
    {
        public bool LoginRequired { get; set; }
        public ViewerResultCode ResultCode { get; set; } = ViewerResultCode.UNKNOWN;
        public string AasIdentifier { get; set; } = string.Empty;
        public long? AasInfrastrukturId { get; set; }
    }

    public enum ViewerResultCode
    {
        UNKNOWN,
        OK,
        NOTFOUND,
        EXPIRED,
    }
}
