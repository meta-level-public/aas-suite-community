namespace AasDesignerModel.Model
{
    public class EClassProperty
    {
        public long? Id { get; set; }
        public Guid Guid { get; set; }
        public string Irdi { get; set; } = string.Empty;
        public Dictionary<string, string> PreferredName { get; set; } = [];
        public Dictionary<string, string> Definition { get; set; } = [];
        public Dictionary<string, string> ShortName { get; set; } = [];

        public DateTime? DateOfOriginalDefinition { get; set; }
        public DateTime? DateOfCurrentVersion { get; set; }
        public DateTime? DateOfCurrentRevision { get; set; }

        public int Revision { get; set; }
        public int Status { get; set; }

        public EClassDomain? Domain { get; set; }

        public string DependsOn { get; set; } = string.Empty;
        public string NameScope { get; set; } = string.Empty;
        public bool IsMultivalent { get; set; }
        public bool IsDeprecated { get; set; }

        public string ObjectType { get; set; } = string.Empty;

        public string ImportFilename { get; set; } = string.Empty;

        public EClassMetadata EClassMetadata { get; set; } = null!;
        public long EClassMetadataId { get; set; }
        public bool SuggestedValueList { get; set; }
    }
}
