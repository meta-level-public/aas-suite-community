namespace AasDesignerAasApi.ConceptDescriptions.Queries.GetSmList;

public class SmVm
{
    public string? Cursor { get; set; }
    public List<SmDto> SmList { get; set; } = [];
}

public class SmDto
{
    public string Id { get; set; } = string.Empty;
    public string IdShort { get; set; } = string.Empty;
    public bool HasDuplicateId { get; set; }
    public int DuplicateCount { get; set; } = 1;
    public int DuplicateIndex { get; set; } = 1;
}
