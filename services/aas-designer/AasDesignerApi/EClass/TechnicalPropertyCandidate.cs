namespace AasDesignerApi.EClass
{
    public class TechnicalPropertyCandidate
    {
        public string Irdi { get; set; } = string.Empty;
        public Dictionary<string, string> PreferredName { get; set; } = [];
        public Dictionary<string, string> Definition { get; set; } = [];
        public string AspectBlock { get; set; } = string.Empty;
        public int OrderNumber { get; set; }
        public bool HasValueList { get; set; }
        public string Source { get; set; } = string.Empty;
    }
}
