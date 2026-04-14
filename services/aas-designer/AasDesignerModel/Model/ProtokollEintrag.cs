namespace AasDesignerApi.Model
{
    public class ProtokollEintrag
    {
        public long Id { get; set; }
        public long? AendererId { get; set; }
        public string AendererName { get; set; } = string.Empty;
        public string Tabellenname { get; set; } = null!;
        public Dictionary<string, object?> KeyValues { get; } = [];
        public Dictionary<string, object?> OldValues { get; } = [];
        public Dictionary<string, object?> NewValues { get; } = [];
        public List<string> ChangedColumns { get; } = [];
        public DateTime AenderungsDatum { get; set; }
        public string AenderungsTyp { get; set; } = "UNVERAENDERT";
    }

    public enum AenderungsTyp
    {
        UNVERAENDERT = 0,
        HINZUGEFUEGT = 1,
        GELOESCHT = 2,
        GEAENDERT = 3,
    }
}
