namespace AasDesignerApi.Model
{
    public class News
    {
        public long Id { get; set; }
        public string? Version { get; set; }
        public string? Description { get; set; }
        public string? Text { get; set; }
        public DateTime? Date { get; set; }
        public bool Visible { get; set; } = true;
        public bool IsPublic { get; set; } = false;
    }
}
