using System.ComponentModel.DataAnnotations.Schema;
using Newtonsoft.Json;

namespace AasDesignerApi.Model
{
    public class EclassCertificate : IMetadata, IHardDeletable
    {
        public long Id { get; set; }
        public string Filename { get; set; } = string.Empty;
        public DateTime ValidTo { get; set; }
        public DateTime ValidFrom { get; set; }
        public string SerialNumber { get; set; } = string.Empty;
        public string IssuingCertificate { get; set; } = string.Empty;
        public string IssuedBy { get; set; } = string.Empty;
        public string Signature { get; set; } = string.Empty;

        [JsonIgnore]
        public EclassCertificateBlob CertificateBlob { get; set; } = null!;

        public long OrganisationId { get; set; }

        [ForeignKey("OrganisationId"), JsonIgnore]
        public Organisation Organisation { get; set; } = null!;

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
