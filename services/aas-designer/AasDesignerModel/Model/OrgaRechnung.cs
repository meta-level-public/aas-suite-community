namespace AasDesignerApi.Model
{
    public class OrgaRechnung : IMetadata, IHardDeletable, IProtokollierbar
    {
        public long Id { get; set; }

        public string Daten { get; set; } = string.Empty; // als JsonObjekt?
        public double Summe { get; set; }
        public DateTime Rechnungsdatum { get; set; }

        public Rechnungsmonat Rechnungsmonat { get; set; } = null!;
        public long RechnungsmonatId { get; set; }
        public Organisation Organisation { get; set; } = null!;
        public long OrganisationId { get; set; }

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
