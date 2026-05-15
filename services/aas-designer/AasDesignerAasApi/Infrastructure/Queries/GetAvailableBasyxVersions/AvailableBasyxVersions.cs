namespace AasDesignerAasApi.Infrastructure.Queries.GetAvailableBasyxVersions
{
    public class AvailableBasyxVersions
    {
        public List<VersionEntry> AasEnvVersions { get; set; } = [];
        public List<VersionEntry> AasRegVersions { get; set; } = [];
        public List<VersionEntry> SmRegVersions { get; set; } = [];
        public List<VersionEntry> DiscoveryVersions { get; set; } = [];

        public List<VersionEntry> AasEnvGoVersions { get; set; } = [];
        public List<VersionEntry> AasRegGoVersions { get; set; } = [];
        public List<VersionEntry> SmRegGoVersions { get; set; } = [];
        public List<VersionEntry> DiscoveryGoVersions { get; set; } = [];
    }

    public class VersionEntry
    {
        public string Version { get; set; } = string.Empty;
        public string Date { get; set; } = string.Empty;
    }
}
