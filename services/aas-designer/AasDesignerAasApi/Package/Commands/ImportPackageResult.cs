namespace AasDesignerAasApi.Package.Commands;

public class ImportPackageResult
{
    public List<SingleImportResult> OkImport { get; set; } = [];
    public List<SingleImportResult> NokImport { get; set; } = [];
}
