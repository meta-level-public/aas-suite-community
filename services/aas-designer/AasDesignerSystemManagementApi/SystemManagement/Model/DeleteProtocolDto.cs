using AasDesignerModel.Model;

namespace AasDesignerSystemManagementApi.SystemManagement.Model;

public class DeleteProtocolDto
{
    public long Id { get; set; }
    public DeleteType DeleteType { get; set; } = DeleteType.Unknown;
    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public string AdditionalData { get; set; } = string.Empty;
    public OrganisationDeleteProtocolDto? Organisation { get; set; }
    public UserAccountDeleteProtocolDto? UserAccount { get; set; }
    public InfrastructureDeleteProtocolDto? Infrastructure { get; set; }
}

public class OrganisationDeleteProtocolDto
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}

public class UserAccountDeleteProtocolDto
{
    public string Email { get; set; } = string.Empty;
}

public class InfrastructureDeleteProtocolDto
{
    public string InfraName { get; set; } = string.Empty;
    public string InfraGuid { get; set; } = string.Empty;
}
