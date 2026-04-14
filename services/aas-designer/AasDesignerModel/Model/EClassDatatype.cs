namespace AasDesignerModel.Model
{
    public class EClassDatatype
    {
        public long? Id { get; set; }
        public Guid Guid { get; set; }
        public string Irdi { get; set; } = string.Empty;
        public Dictionary<string, string> PreferredName { get; set; } = [];
        public Dictionary<string, string> Definition { get; set; } = [];

        public DateTime? DateOfOriginalDefinition { get; set; }
        public DateTime? DateOfCurrentVersion { get; set; }
        public DateTime? DateOfCurrentRevision { get; set; }

        public int Revision { get; set; }
        public int Status { get; set; }

        public EClassTypeDefinition TypeDefinition { get; set; } = null!;
        public long TypeDefinitionId { get; set; }

        public string NameScope { get; set; } = string.Empty;
        public string ImportFilename { get; set; } = string.Empty;

        public EClassMetadata EClassMetadata { get; set; } = null!;
        public long EClassMetadataId { get; set; }
    }

    public class EClassTypeDefinition
    {
        public long? Id { get; set; }
        public string Type { get; set; } = string.Empty;
        public List<EClassConstraint> Constraints { get; set; } = [];
        public EClassDatatype Datatype { get; set; } = null!;
    }

    public class EClassConstraint
    {
        public long? Id { get; set; }

        public string Type { get; set; } = string.Empty;
        public List<string> Subset { get; set; } = [];
        public List<EClassValueMeaning> ValueMeanings { get; set; } = [];
        public EClassTypeDefinition TypeDefinition { get; set; } = null!;
        public long TypeDefinitionId { get; set; }
    }

    public class EClassValueMeaning
    {
        public long? Id { get; set; }

        public string Type { get; set; } = string.Empty;
        public Guid Guid { get; set; }
        public string Irdi { get; set; } = string.Empty;
        public int OrderNumber { get; set; }
        public Dictionary<string, string> PreferredName { get; set; } = [];
        public Dictionary<string, string> ShortName { get; set; } = [];
        public Dictionary<string, string> Definition { get; set; } = [];
        public string ValueCode { get; set; } = string.Empty;
        public EClassConstraint Constraint { get; set; } = null!;
    }
}
