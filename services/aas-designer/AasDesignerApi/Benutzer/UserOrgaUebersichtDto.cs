namespace AasDesignerApi.Benutzer
{
    public class UserOrgaUebersichtDto
    {
        public string OrgaName { get; set; } = string.Empty;
        public List<string> BenutzerRollen { get; set; } = [];
        public bool Aktiv { get; set; }
    }
}
