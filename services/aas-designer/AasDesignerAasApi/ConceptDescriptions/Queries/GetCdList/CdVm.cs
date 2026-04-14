namespace AasDesignerAasApi.ConceptDescriptions.Queries.GetCdList;

public class CdVm
{
    public string? Cursor { get; set; }
    public List<string> CdList { get; set; } = [];
}
