using System.ComponentModel.DataAnnotations;

namespace AasDesignerApi.Model.Client
{
    public class InvitationDto
    {
        [Required]
        public string Name { get; set; } = null!;

        [Required]
        public string Vorname { get; set; } = null!;

        [Required]
        public string Email { get; set; } = null!;

        [Required]
        public long OrganisationId { get; set; }

        [Required]
        public List<string> BenutzerRollen { get; set; } = null!;

        [Required]
        public string Language { get; set; } = "de";
    }
}
