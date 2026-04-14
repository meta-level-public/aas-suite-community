namespace AasDesignerModel.Model
{
    public class EClassClass
    {
        public long? Id { get; set; }
        public Guid Guid { get; set; }
        public string Irdi { get; set; } = string.Empty;
        public string SourceLanguage { get; set; } = string.Empty;
        public Dictionary<string, string> PreferredName { get; set; } = [];
        public Dictionary<string, string> Definition { get; set; } = [];
        public Dictionary<string, string> ShortName { get; set; } = [];
        public Dictionary<string, string> Keywords { get; set; } = [];
        public string CreatedView { get; set; } = string.Empty; // Klassenreferenz

        public DateTime? DateOfOriginalDefinition { get; set; }
        public DateTime? DateOfCurrentVersion { get; set; }
        public DateTime? DateOfCurrentRevision { get; set; }

        public int Revision { get; set; }
        public int Status { get; set; }

        public string Superclass { get; set; } = string.Empty;
        public string HierarchicalPosition { get; set; } = string.Empty;

        public List<EClassDescribedBy> DescribedBy { get; set; } = [];

        public string IsCaseOf { get; set; } = string.Empty;

        public string ObjectType { get; set; } = string.Empty;

        public string ImportFilename { get; set; } = string.Empty;

        public EClassMetadata EClassMetadata { get; set; } = null!;
        public long EClassMetadataId { get; set; }
    }
}
