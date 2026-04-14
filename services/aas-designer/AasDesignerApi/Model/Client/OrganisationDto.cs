using System.ComponentModel.DataAnnotations;

namespace AasDesignerApi.Model.Client
{
    public class OrganisationDto
    {
        [Required]
        public string Name { get; set; } = null!;

        [Required]
        public string Email { get; set; } = null!;
        public string? Telefon { get; set; }
        public string? Fax { get; set; }

        public string? Strasse { get; set; }
        public string? Plz { get; set; }
        public string? Ort { get; set; }
        public string? Bundesland { get; set; }
        public string? LaenderCode { get; set; }

        [Required]
        public bool AccountAktiv { get; set; } = true;

        public List<PaymentModel> Bezahlmodelle { get; set; } = new List<PaymentModel>();
    }
}
