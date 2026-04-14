using System.ComponentModel.DataAnnotations;

namespace AasDesignerApi.Model.Client
{
    public class CreateNewBenutzerDto
    {
        [Required]
        public string Name { get; set; } = null!;

        [Required]
        public string Vorname { get; set; } = null!;

        [Required]
        public string Email { get; set; } = null!;

        public string? Passwort { get; set; }

        public string? Telefon { get; set; }

        [Required]
        public long OrganisationId { get; set; }

        [Required]
        public List<string> BenutzerRollen { get; set; } = null!;
    }
}
