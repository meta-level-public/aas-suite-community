namespace AasDesignerAasApi.Infrastructure.Queries.GetOrphanedInfrastructures;

public class OrphanedInfrastructureDto
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ContainerGuid { get; set; } = string.Empty;
    public bool IsGoInfrastructure { get; set; }
    public long OrganisationId { get; set; }
}
