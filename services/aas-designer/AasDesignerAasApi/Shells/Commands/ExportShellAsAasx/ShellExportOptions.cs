namespace AasDesignerAasApi.Shells.Commands.ExportShellAsAasx
{
    public class ShellExportOptions
    {
        public string AasIdentifier { get; set; } = string.Empty;
        public List<string> SubmodelIds { get; set; } = [];
        public string ExportMode { get; set; } = "XML"; // oder JSON
        public string MetamodelVersion { get; set; } = "3.1";
    }
}
