namespace AasShared.Model
{
    public class Adresse
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Strasse { get; set; }
        public string? Plz { get; set; }
        public string? Ort { get; set; }
        public string? Bundesland { get; set; }
        public string? LaenderCode { get; set; }
    }
}
