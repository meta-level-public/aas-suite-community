using AasDesignerApi.Model;

namespace AasDesignerModel.Model
{
    public class BenutzerOrganisation : IMetadata, IHardDeletable
    {
        public long Id { get; set; }
        public long BenutzerId { get; set; }
        public long OrganisationId { get; set; }
        public Benutzer Benutzer { get; set; } = null!;
        public Organisation Organisation { get; set; } = null!;

        public DateTime AnlageDatum { get; set; } = DateTime.Now;
        public string AnlageBenutzer { get; set; } = string.Empty;
        public DateTime AenderungsDatum { get; set; } = DateTime.Now;
        public string AenderungsBenutzer { get; set; } = string.Empty;
        public bool Geloescht { get; set; } = false;
        public bool CreatedBySso { get; set; } = false;
        public int AenderungsZaehler { get; set; } = 0;

        public List<string> BenutzerRollen { get; set; } = [];
        public bool AccountAktiv { get; set; }
        public bool IsStammOrga { get; set; }
        public DateTime LastLogin { get; set; } = DateTime.Now;

        public string PersonalAccessToken { get; set; } = string.Empty;
        public DateTime PersonalAccessTokenValidUntil { get; set; }
    }
}
