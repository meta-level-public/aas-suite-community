namespace AasDesignerAasApi.Infrastructure;

public sealed class DppAccessPolicyDto
{
    public long InfrastructureId { get; set; }
    public string Profile { get; set; } = "Public";
    public string? RawPolicyJson { get; set; }
    public List<DppAccessRuleDto> Rules { get; set; } = [];
}

public sealed class DppAccessRuleDto
{
    public string Name { get; set; } = string.Empty;
    public string Role { get; set; } = "viewer";
    public bool Enabled { get; set; } = true;
    public string DppScope { get; set; } = "All";
    public List<string> DppIds { get; set; } = [];
    public string ConditionCombination { get; set; } = "All";
    public List<DppFieldConditionDto> DppConditions { get; set; } = [];
    public List<string> VisibleSemanticIds { get; set; } = [];
    public bool GetById { get; set; } = true;
    public bool GetByProductId { get; set; } = true;
    public bool GetByIdAndDate { get; set; } = true;
    public bool GetByProductIds { get; set; } = true;
}

public sealed class DppFieldConditionDto
{
    public string Field { get; set; } = "digitalProductPassportId";
    public string Operator { get; set; } = "Equal";
    public string Value { get; set; } = string.Empty;
}
