namespace AasDesignerApi.Import
{
    public class ImportResult
    {
        public long Id { get; set; }
        public string ModelVersion { get; set; } = "V3";
        public List<string> AasIds { get; set; } = new List<string>();
        public string Filename { get; set; } = string.Empty;
        public string ErrorMessage { get; set; } = string.Empty;
    }

    public class BulkImportResult
    {
        public List<ImportResult> OkImport { get; set; } = [];
        public List<ImportResult> NokImport { get; set; } = [];
    }
}
