using System.ComponentModel.DataAnnotations.Schema;

namespace AasDesignerApi.Model
{
    public class EclassCertificateBlob : IMetadata, IHardDeletable
    {
        public long Id { get; set; }
        public byte[] Datei { get; set; } = null!;
        public long CertificateId { get; set; }

        [ForeignKey("CertificateId")]
        public EclassCertificate Certificate { get; set; } = null!;

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
