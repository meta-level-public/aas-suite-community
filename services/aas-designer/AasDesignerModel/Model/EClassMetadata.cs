using AasDesignerApi.Model;

namespace AasDesignerModel.Model
{
    public class EClassMetadata
    {
        public long? Id { get; set; }
        public string SchemaVersion { get; set; } = string.Empty;
        public string GeneratorVersion { get; set; } = string.Empty;
        public DateTime? GenerationDate { get; set; }
        public string Creator { get; set; } = string.Empty;
        public string Authorisation { get; set; } = string.Empty;
        public DateTime? ContentDate { get; set; }
        public string ContentIdentification { get; set; } = string.Empty;
        public string ContentDescription { get; set; } = string.Empty;
        public string ContentLanguage { get; set; } = string.Empty;
        public string OriginatingSystem { get; set; } = string.Empty;

        public ICollection<Organisation> Organisations { get; set; } = [];
        public List<string> Languages { get; set; } = [];
    }
}
