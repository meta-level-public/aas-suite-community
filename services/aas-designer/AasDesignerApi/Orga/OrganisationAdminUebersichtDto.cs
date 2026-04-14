using AasDesignerApi.Model;
using AasDesignerModel;

namespace AasDesignerApi.Orga
{
    public class OrganisationAdminUebersichtDto
    {
        public long Id { get; set; }
        public string OrgaName { get; set; }
        public string Strasse { get; set; } = string.Empty;
        public string Plz { get; set; } = string.Empty;
        public string Ort { get; set; } = string.Empty;
        public bool Aktiv { get; set; }
        public bool Wartung { get; set; }
        public bool HatGueltigesAbo { get; set; }
        public bool HatInfrastruktur { get; set; }
        public bool InfrastrukturAktiv { get; set; }
        public int AnzahlInfrastrukturen { get; set; }
        public int AnzahlNutzer { get; set; }
        public DateTime? AnlageDatum { get; set; }
        public DateTime? AenderungsDatum { get; set; }
        public string OrgaEmail { get; set; } = string.Empty;

        public OrganisationAdminUebersichtDto(
            Organisation orga,
            IApplicationDbContext context,
            bool singleTenantMode
        )
        {
            Id = orga.Id;
            OrgaName = orga.Name;
            Strasse = orga.Strasse ?? string.Empty;
            Plz = orga.Plz ?? string.Empty;
            Ort = orga.Ort ?? string.Empty;
            Aktiv = orga.AccountAktiv;
            Wartung = orga.MaintenanceActive;
            HatGueltigesAbo = singleTenantMode || orga.HasValidPaymentModel(context);
            AnzahlNutzer = orga.GetCurrentUsersCount(context);
            AnlageDatum = orga.AnlageDatum;
            AenderungsDatum = orga.AenderungsDatum;
            OrgaEmail = orga.Email ?? string.Empty;
            HatInfrastruktur = orga.AasInfrastructureSettings.Any(i =>
                i.IsInternal && !i.Geloescht
            );
            AnzahlInfrastrukturen = orga.AasInfrastructureSettings.Count(i => !i.Geloescht);
            InfrastrukturAktiv = orga.AasInfrastructureSettings.Any(i =>
                i.IsInternal && !i.Geloescht && i.IsActive
            );
        }
    }
}
