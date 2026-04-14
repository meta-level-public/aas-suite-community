namespace AasDesignerCommon.Model
{
    public class AasFileContent
    {
        public string Filename { get; set; } = string.Empty;
        public string Path { get; set; } = string.Empty;
        public string Endpoint { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;
        public string idShortPath { get; set; } = string.Empty;
        public bool IsThumbnail { get; set; }
        public string SubmodelId { get; set; } = string.Empty;
    }
}
