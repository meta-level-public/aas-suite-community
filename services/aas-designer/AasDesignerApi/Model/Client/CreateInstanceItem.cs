namespace AasDesignerApi.Model.Client
{
    public class CreateInstanceItem
    {
        public string SerialNumber { get; set; } = string.Empty;
        public int YearOfConstruction { get; set; }
        public long PaketId { get; set; }
        public string FileName { get; set; } = string.Empty;
    }
}
