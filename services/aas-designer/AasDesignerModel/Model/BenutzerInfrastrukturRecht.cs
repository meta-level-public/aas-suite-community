using AasDesignerApi.Model;

namespace AasDesignerModel.Model
{
    public class BenutzerInfrastrukturRecht : IMetadata, IHardDeletable
    {
        public long Id { get; set; }
        public long BenutzerId { get; set; }
        public long OrganisationId { get; set; }
        public long InfrastrukturId { get; set; }

        public Benutzer Benutzer { get; set; } = null!;
        public Organisation Organisation { get; set; } = null!;
        public AasInfrastructureSettings Infrastruktur { get; set; } = null!;

        public bool DarfLesen { get; set; }
        public bool DarfSchreiben { get; set; }
        public bool DarfMarktPublizieren { get; set; }

        public DateTime AnlageDatum { get; set; } = DateTime.Now;
        public string AnlageBenutzer { get; set; } = string.Empty;
        public DateTime AenderungsDatum { get; set; } = DateTime.Now;
        public string AenderungsBenutzer { get; set; } = string.Empty;
        public bool Geloescht { get; set; } = false;
        public int AenderungsZaehler { get; set; } = 0;
    }
}
