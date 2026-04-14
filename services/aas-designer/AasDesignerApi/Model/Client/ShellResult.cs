using BaSyx.Models.Export;

namespace AasDesignerApi.Model.Client;

public class ShellResult
{
    public AssetAdministrationShellEnvironment_V2_0? Shell { get; set; }
    public AasCore.Aas3_1.Environment? V3Shell { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string Beschreibung { get; set; } = string.Empty;
    public FreigabeLevel FreigabeLevel { get; set; } = FreigabeLevel.PRIVATE;
    public string PlainJson { get; set; } = string.Empty;

    public List<SupplementalFile> SupplementalFiles { get; set; } = new List<SupplementalFile>();
}

public class SupplementalFile
{
    public string Path { get; set; } = string.Empty;
    public string Filename { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long Id { get; set; }
    public bool IsThumbnail { get; set; }
}
