namespace AasDesignerAasApi.Viewer.Queries.GetRawDescriptor;

public class SpecificAssetIdEntry
{
    public string Name { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
}

public class RawDescriptor
{
    public string AasId { get; set; } = string.Empty;
    public string AasEndpoint { get; set; } = string.Empty;
    public List<string> SubmodelEndpoints { get; set; } = [];
    public long AasInfrastrukturId { get; set; }
    public string? GlobalAssetId { get; set; }
    public List<SpecificAssetIdEntry> SpecificAssetIds { get; set; } = [];
}
