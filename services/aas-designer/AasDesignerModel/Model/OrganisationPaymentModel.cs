using System.ComponentModel.DataAnnotations.Schema;
using Newtonsoft.Json;

namespace AasDesignerApi.Model
{
    public class OrganisationPaymentModel : IMetadata, IProtokollierbar, IMaybeHardDeletable
    {
        public long Id { get; set; }

        [JsonIgnore]
        public Organisation Organisation { get; set; } = null!;
        public long OrganisationId { get; set; }
        public PaymentModel PaymentModel { get; set; } = null!;
        public long PaymentModelId { get; set; }

        public DateTime? LoeschDatum { get; set; }
        public string LoeschBenutzer { get; set; } = string.Empty;

        public DateTime? EndDate { get; set; }

        #region Verwaltungsdaten
        public DateTime AnlageDatum { get; set; } = DateTime.Now;
        public string AnlageBenutzer { get; set; } = string.Empty;
        public DateTime AenderungsDatum { get; set; } = DateTime.Now;
        public string AenderungsBenutzer { get; set; } = string.Empty;
        public bool Geloescht { get; set; } = false;
        public int AenderungsZaehler { get; set; } = 0;

        [NotMapped]
        [JsonIgnore]
        public bool ShouldBeHardDeleted { get; set; }

        #endregion
    }
}
