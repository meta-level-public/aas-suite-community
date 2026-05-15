namespace AasDesignerAasApi.Infrastructure.Queries.GetContainerOnlyOrphans;

public class ContainerOnlyOrphanDto
{
    public string ContainerGuid { get; set; } = string.Empty;
    public List<string> ContainerNames { get; set; } = [];
    public bool IsGoInfrastructure { get; set; }
}
