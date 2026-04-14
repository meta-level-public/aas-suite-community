namespace AasDesignerApi.Model
{
    public class BenutzerEinstellungen
    {
        public Dictionary<string, string> HilfeInaktiv { get; set; } = [];
        public List<SnippetVerwendung> LetzteSnippets { get; set; } = [];
        public List<long> ViewedNewsIds { get; set; } = [];
    }
}
