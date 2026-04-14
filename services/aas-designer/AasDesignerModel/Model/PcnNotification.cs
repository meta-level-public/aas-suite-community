using AasDesignerApi.Model;

namespace AasDesignerModel.Model
{
    public class PcnNotification : IMetadata, IHardDeletable
    {
        public long Id { get; set; }
        public PcnListener PcnListener { get; set; } = null!;
        public long PcnListenerId { get; set; }

        public string PcnSubmodelUrl { get; set; } = string.Empty;

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
