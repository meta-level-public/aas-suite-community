using System.ComponentModel.DataAnnotations;

namespace AasDesignerApi.Model.Client
{
    public class OrganisationUpdateDto
    {
        public string Name { get; set; } = null!;

        public string Email { get; set; } = null!;

        public string? Telefon { get; set; }

        public string? Fax { get; set; }

        [Required]
        public bool AccountAktiv { get; set; } = true;

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
    }
}
