using AasDesignerCommon.Model;
using AasDesignerCommon.Shells;

namespace AasDesignerAasApi.Shells.Queries.GetShellForEditing
{
    public class ShellForEditingVm
    {
        public string AasId { get; set; } = string.Empty;
        public string PlainJson { get; set; } = string.Empty;
        public List<AasFileContent> AasFiles { get; set; } = [];
        public List<ConceptDescriptionMetadata> ConceptDescriptionMetadata { get; set; } = [];
        public EditorDescriptor EditorDescriptor { get; set; } = new();
    }
}
