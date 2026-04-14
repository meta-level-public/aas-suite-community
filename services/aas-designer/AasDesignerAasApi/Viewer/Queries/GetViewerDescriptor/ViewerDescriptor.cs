namespace AasDesignerAasApi.Shells.Queries.GetViewerDescriptor;

public class ViewerDescriptor
{
    public string AasId { get; set; } = string.Empty;
    public string CdEndpoint { get; set; } = string.Empty;
    public string AasEndpoint { get; set; } = string.Empty;
    public List<string> SubmodelEndpoints { get; set; } = [];
}
