using System.ComponentModel.DataAnnotations;

namespace AasDesignerApi.Model.Client
{
    public class NewsUserUpdateDto
    {
        [Required]
        public string Description { get; set; } = null!;
        public bool Visible { get; set; }

        // already viewed by User?
        public bool Viewed { get; set; }
    }
}
