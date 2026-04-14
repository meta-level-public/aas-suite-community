using Aas = AasCore.Aas3_1;

namespace AasDesignerCommon.Packaging.Model
{
    public class AasxPackage
    {
        public Aas.Environment? Environment { get; set; }
        public List<AasxFile> Files { get; set; } = new List<AasxFile>();
        public AasxFile? Thumbnail { get; set; }
    }
}
