using Newtonsoft.Json;

namespace AasShared.Model;

public class Mapping
{
    public long Id { get; set; }
    public long? AasInfrastructureSettingsId { get; set; }
    public string MappingJson { get; set; } = string.Empty;
    public string AasIdentifier { get; set; } = string.Empty;
    public string IdShort { get; set; } = string.Empty;
    public string AssetType { get; set; } = string.Empty;
    public long? BesitzerOrgaId { get; set; }

    // Metadata
    public DateTime AnlageDatum { get; set; } = DateTime.Now;
    public string AnlageBenutzer { get; set; } = string.Empty;
    public DateTime AenderungsDatum { get; set; } = DateTime.Now;
    public string AenderungsBenutzer { get; set; } = string.Empty;
    public bool Geloescht { get; set; } = false;
    public int AenderungsZaehler { get; set; } = 0;
}
