namespace AasDesignerApi.Model.Client
{
    public class BenutzerInfrastrukturRechtDto
    {
        public long InfrastrukturId { get; set; }
        public string InfrastrukturName { get; set; } = string.Empty;
        public bool DarfLesen { get; set; }
        public bool DarfSchreiben { get; set; }
        public bool DarfMarktPublizieren { get; set; }
    }

    public class InfraUserRechtDto
    {
        public long BenutzerId { get; set; }
        public string Vorname { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public bool DarfLesen { get; set; }
        public bool DarfSchreiben { get; set; }
        public bool DarfMarktPublizieren { get; set; }
    }
}
