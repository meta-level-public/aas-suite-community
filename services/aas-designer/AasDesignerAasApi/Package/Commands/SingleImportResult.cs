namespace AasDesignerAasApi.Package.Commands;

public class SingleImportResult
{
    public string AasId { get; set; } = string.Empty;
    public bool Success { get; set; }
    public string ErrorMessage { get; set; } = string.Empty;
    public bool RequiresConfirmation { get; set; }
    public bool CanImportPartially { get; set; }
    public List<string> ExcludedSubmodelIds { get; set; } = [];
    public List<FailedSubmodelImportResult> FailedSubmodels { get; set; } = [];
    public List<SubmodelImportCandidateResult> ImportableSubmodels { get; set; } = [];
}
