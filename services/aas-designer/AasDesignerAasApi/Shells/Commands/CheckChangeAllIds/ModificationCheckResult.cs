namespace AasDesignerAasApi.Shells.Commands.Model;

public class ModificationCheckResult
{
    public string Type { get; set; } = string.Empty;
    public string OldId { get; set; } = string.Empty;
    public string NewId { get; set; } = string.Empty;

    public bool isUnique { get; set; } = false;
}
