using System.Text.Json.Serialization;

namespace AasDesignerApi.Model
{
    public class RequestForOffer : IMetadata, IHardDeletable
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Vorname { get; set; } = string.Empty;
        public string? Email { get; set; } = string.Empty;
        public string? PaymentPeriod { get; set; } = string.Empty;
        public string? NumberOfLicences { get; set; } = string.Empty;
        public string Price { get; set; } = string.Empty;
        public Organisation? Organisation { get; set; }
        public long? OrganisationId { get; set; }

        #region Verwaltungsdaten
        public DateTime AnlageDatum { get; set; } = DateTime.Now;
        public string AnlageBenutzer { get; set; } = string.Empty;
        public DateTime AenderungsDatum { get; set; } = DateTime.Now;
        public string AenderungsBenutzer { get; set; } = string.Empty;
        public bool Geloescht { get; set; } = false;
        public int AenderungsZaehler { get; set; } = 0;

        public long? BesitzerId { get; set; }

        [JsonIgnore]
        public Benutzer? Besitzer { get; set; }
        #endregion

        public OfferStatus Status { get; set; } = OfferStatus.New;
    }

    public enum OfferStatus
    {
        New,
        InProgress,
        SentToCustomer,
        Ordered,
        Rejected,
    }
}
