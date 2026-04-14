namespace AasDesignerCommon.Packaging.Model
{
    public class AasxFile
    {
        public string Filename { get; set; } = string.Empty;
        public string MimeType { get; set; } = string.Empty;
        public string AasxPath { get; set; } = string.Empty;

        public byte[]? Content { get; set; }
        public long Id { get; set; }
    }
}
