using AasDesignerModel.Model;
using Newtonsoft.Json;

namespace AasDesignerApi.Model
{
    public class Apikey : IMetadata, IHardDeletable
    {
        public long Id { get; set; }
        public Guid Key { get; set; } = Guid.Empty;
        public DateTime? ValidUntil { get; set; }
        public bool Active { get; set; }
        public string Notice { get; set; } = string.Empty;

        public List<string> Scopes { get; set; } = [];

        public long? OrganisationId { get; set; }

        [JsonIgnore]
        public Organisation? Organisation { get; set; }

        public long? AasInfrastructureSettingsId { get; set; }

        [JsonIgnore]
        public AasInfrastructureSettings? AasInfrastructureSettings { get; set; }

        public long? BenutzerId { get; set; }

        [JsonIgnore]
        public Benutzer? Benutzer { get; set; }

        #region Verwaltungsdaten
        public DateTime AnlageDatum { get; set; } = DateTime.Now;
        public string AnlageBenutzer { get; set; } = string.Empty;
        public DateTime AenderungsDatum { get; set; } = DateTime.Now;
        public string AenderungsBenutzer { get; set; } = string.Empty;
        public bool Geloescht { get; set; } = false;
        public int AenderungsZaehler { get; set; } = 0;

        #endregion
    }
}
