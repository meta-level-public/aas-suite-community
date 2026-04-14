namespace AasDesignerApi.Model
{
    public interface IMetadata
    {
        public DateTime AnlageDatum { get; set; }
        public string AnlageBenutzer { get; set; }
        public DateTime AenderungsDatum { get; set; }
        public string AenderungsBenutzer { get; set; }
        public bool Geloescht { get; set; }
        public int AenderungsZaehler { get; set; }
    }
}
