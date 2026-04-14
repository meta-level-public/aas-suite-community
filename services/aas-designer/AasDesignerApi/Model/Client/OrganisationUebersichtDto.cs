using AasDesignerModel.Model;

namespace AasDesignerApi.Model.Client;

public class OrganisationUebersichtDto
{
    public long Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Telefon { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Fax { get; set; } = string.Empty;

    public bool AccountAktiv { get; set; } = true;

    public bool Geloescht { get; set; }

    public string Strasse { get; set; } = string.Empty;
    public string Plz { get; set; } = string.Empty;
    public string Ort { get; set; } = string.Empty;
    public string Bundesland { get; set; } = string.Empty;
    public string LaenderCode { get; set; } = string.Empty;
    public string IriPrefix { get; set; } = string.Empty;
    public string ThemeUrl { get; set; } = string.Empty;
    public string LogoBase64 { get; set; } = string.Empty;

    public bool UseInternalInfrastructure { get; set; } = false;
    public string AasDiscoveryUrl { get; set; } = string.Empty;
    public string AasRegistryUrl { get; set; } = string.Empty;
    public string AasRepositoryUrl { get; set; } = string.Empty;
    public string SubmodelRegistryUrl { get; set; } = string.Empty;
    public string SubmodelRepositoryUrl { get; set; } = string.Empty;
    public string ConceptDescriptionRepositoryUrl { get; set; } = string.Empty;
    public string ExternalAasDiscoveryUrl { get; set; } = string.Empty;
    public string ExternalAasRegistryUrl { get; set; } = string.Empty;
    public string ExternalAasRepositoryUrl { get; set; } = string.Empty;
    public string ExternalSubmodelRegistryUrl { get; set; } = string.Empty;
    public string ExternalSubmodelRepositoryUrl { get; set; } = string.Empty;
    public string ExternalConceptDescriptionRepositoryUrl { get; set; } = string.Empty;
    public List<HeaderParameter> HeaderParameters { get; set; } = [];

    public DateTime AnlageDatum { get; set; }

    public string AnlageBenutzer { get; set; } = string.Empty;

    public DateTime AenderungsDatum { get; set; }

    public string AenderungsBenutzer { get; set; } = string.Empty;

    public ICollection<OrganisationPaymentModel> Bezahlmodelle { get; set; } = [];
    public ICollection<EClassMetadata> OwnedEclassData { get; set; } = [];
    public bool MaintenanceActive { get; set; }
}
