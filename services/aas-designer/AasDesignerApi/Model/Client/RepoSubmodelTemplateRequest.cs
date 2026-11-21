namespace AasDesignerApi.Model.Client
{
    public class RepoSubmodelTemplateRequest
    {
        public string Url { get; set; } = string.Empty;

        public List<string>? KnownConceptDescriptionIds { get; set; }

        /// <summary>Template-Qualifier wie SMT/Cardinality behalten (nur lesen, nicht einfügen).</summary>
        public bool KeepTemplateQualifiers { get; set; }
    }
}
