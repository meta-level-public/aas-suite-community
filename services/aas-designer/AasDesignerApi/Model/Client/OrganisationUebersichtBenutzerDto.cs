namespace AasDesignerApi.Model.Client
{
    public class OrganisationUebersichtBenutzerDto
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Vorname { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Telefon { get; set; } = string.Empty;
        public bool Geloescht { get; set; }
        public bool IsSystemUser { get; set; }
        public bool AccountAktiv { get; set; }
        public bool CreatedBySso { get; set; }
        public List<string> BenutzerRollen { get; set; } = new List<string>();
    }
}
