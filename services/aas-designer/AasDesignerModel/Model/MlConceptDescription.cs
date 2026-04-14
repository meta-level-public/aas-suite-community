namespace AasDesignerApi.Model
{
    public class MlConceptDescription : IMetadata
    {
        public long Id { get; set; }

        public string ConceptDescriptionPlain { get; set; } = string.Empty;
        public string IdShort { get; set; } = string.Empty;
        public string CdId { get; set; } = string.Empty;

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
