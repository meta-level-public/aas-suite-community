namespace AasDesignerApi.Model.Client;

public class FileResult
{
    public string FilePath { get; set; } = String.Empty;
    public string ContentType { get; set; } = String.Empty;
    public string Size { get; set; } = String.Empty;
    public bool IsThumbnail { get; set; }
}
