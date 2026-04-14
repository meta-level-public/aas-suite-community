namespace AasDesignerApi.Model.Client
{
    public class RepoSubmodelTemplateRequest
    {
        public string Url { get; set; } = string.Empty;

        public List<string>? KnownConceptDescriptionIds { get; set; }
    }
}
