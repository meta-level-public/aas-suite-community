namespace AasDesignerAasApi.Shells.Queries.GetContainedSubmodels
{
    public class ContainedSubmodelsVm
    {
        public string AasId { get; set; } = string.Empty;
        public List<SubmodelMetadata> ContainedSubmodels { get; set; } = [];
    }
}
