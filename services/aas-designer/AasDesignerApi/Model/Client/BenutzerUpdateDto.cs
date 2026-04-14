using System.ComponentModel.DataAnnotations;

namespace AasDesignerApi.Model.Client
{
    public class BenutzerUpdateDto
    {
        [Required]
        public string Name { get; set; } = null!;

        [Required]
        public string Vorname { get; set; } = null!;

        [Required]
        public string Email { get; set; } = null!;

        public string? Telefon { get; set; }

        [Required]
        public bool Geloescht { get; set; }

        [Required]
        public bool AccountAktiv { get; set; }

        public List<string> BenutzerRollen { get; set; } = new List<string>();
    }
}
