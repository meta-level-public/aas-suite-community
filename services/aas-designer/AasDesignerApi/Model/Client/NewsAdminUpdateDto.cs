using System.ComponentModel.DataAnnotations;

namespace AasDesignerApi.Model.Client
{
    public class NewsAdminUpdateDto
    {
        [Required]
        public string? Version { get; set; }

        [Required]
        public string? Description { get; set; }
        public DateTime? Date { get; set; }

        // visibility for showNews-Component
        public bool Visible { get; set; }

        // already viewed by User?
        public bool Viewed { get; set; }
    }
}
