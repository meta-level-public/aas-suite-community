namespace AasDesignerCommon.Shells;

public class EnvironmentModifications
{
    public string Id { get; set; } = null!;
    public string NewId { get; set; } = null!;
    public ModificationType Type { get; set; } = ModificationType.Aas;
}
