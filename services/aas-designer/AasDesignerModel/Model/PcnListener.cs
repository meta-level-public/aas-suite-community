using AasDesignerApi.Model;

namespace AasDesignerModel.Model
{
    public class PcnListener : IMetadata, IHardDeletable
    {
        public long Id { get; set; }
        public string AasIdentifier { get; set; } = string.Empty;
        public string BrokerUrl { get; set; } = string.Empty;
        public string Topic { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty; // sollte vielleicht encodiert abgespeichert werden
        public bool IsActive { get; set; }
        public long OrganizationId { get; set; }
        public long InfrastructureId { get; set; }

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
