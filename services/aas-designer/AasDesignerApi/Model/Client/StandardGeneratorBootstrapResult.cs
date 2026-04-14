namespace AasDesignerApi.Model.Client;

public class StandardGeneratorBootstrapResult
{
    public string Mode { get; set; } = string.Empty;
    public string V3ShellPlain { get; set; } = string.Empty;
    public List<string> V3SubmodelsPlain { get; set; } = [];
    public List<string> V3ConceptDescriptionsPlain { get; set; } = [];
    public List<StandardGeneratorTemplateRoleResult> TemplateRoles { get; set; } = [];
    public StandardGeneratorUiRules UiRules { get; set; } = new();
}

public class StandardGeneratorTemplateRoleResult
{
    public string Role { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public string SemanticId { get; set; } = string.Empty;
    public string TemplateId { get; set; } = string.Empty;
    public string SourceUrl { get; set; } = string.Empty;
    public string SubmodelId { get; set; } = string.Empty;
    public string SubmodelIdShort { get; set; } = string.Empty;
    public string SubmodelPlain { get; set; } = string.Empty;
}

public class StandardGeneratorUiRules
{
    public bool ShowSerialNumber { get; set; }
    public bool ShowManufacturingDate { get; set; }
}
