namespace AasDesignerAasApi.Shells.Commands.Model;

public class IdModification
{
    public string Type { get; set; } = string.Empty;
    public string OldId { get; set; } = string.Empty;
    public string NewId { get; set; } = string.Empty;
    public string OldVersion { get; set; } = string.Empty;
    public string NewVersion { get; set; } = string.Empty;
    public string OldRevision { get; set; } = string.Empty;
    public string NewRevision { get; set; } = string.Empty;
}
