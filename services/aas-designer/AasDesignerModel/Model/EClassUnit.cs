namespace AasDesignerModel.Model
{
    public class EClassUnit
    {
        public long? Id { get; set; }
        public string Irdi { get; set; } = string.Empty;
        public Dictionary<string, string> Name { get; set; } = [];
        public Dictionary<string, string> PreferredName { get; set; } = [];
        public Dictionary<string, string> ShortName { get; set; } = [];
        public Dictionary<string, string> Definition { get; set; } = [];
        public Dictionary<string, string> CodeListValue { get; set; } = [];

        // TODO: Conversions
        // TODO: QuantityReference

        public EClassMetadata EClassMetadata { get; set; } = null!;
        public long EClassMetadataId { get; set; }
        public string Symbol { get; set; } = string.Empty;
    }
}
