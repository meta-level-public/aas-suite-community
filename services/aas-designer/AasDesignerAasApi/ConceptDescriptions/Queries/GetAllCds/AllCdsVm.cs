using AasCore.Aas3_1;

namespace AasDesignerAasApi.ConceptDescriptions.Queries.GetAllCds;

public class AllCdsVm
{
    public string? Cursor { get; set; }
    public List<string> CdAsJsonStrings { get; set; } = [];
}
