namespace AasDesignerApi.Idta
{
    public class IdtaItem
    {
        public string Label { get; set; } = string.Empty;
        public string FullPath { get; set; } = string.Empty;
        public List<IdtaItem> Children { get; set; } = new List<IdtaItem>();
    }
}
