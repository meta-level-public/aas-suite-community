namespace AasDesignerApi.Model
{
    public class SnippetVerwendung
    {
        public DateTime Datum { get; set; }
        public string SnippetName { get; set; } = string.Empty;
        public string SnippetTyp { get; set; } = string.Empty;
        public long? SnippetId { get; set; }
    }
}
