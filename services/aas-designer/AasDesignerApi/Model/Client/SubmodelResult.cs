using BaSyx.Models.Core.AssetAdministrationShell.Implementations;

namespace AasDesignerApi.Model.Client
{
    public class SubmodelResult
    {
        public List<Submodel> Submodels { get; set; } = new List<Submodel>();
        public List<BaSyx.Models.Core.AssetAdministrationShell.Semantics.ConceptDescription> ConceptDescriptions { get; set; } =
        [];

        public List<string> V3SubmodelsPlain { get; set; } = new List<string>();
        public List<string> V3ConceptDescriptionsPlain { get; set; } = new List<string>();
    }
}
