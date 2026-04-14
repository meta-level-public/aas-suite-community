namespace AasDesignerApi.Model.Client
{
    public class ContactRequest
    {
        public string Topic { get; set; } = string.Empty;
        public string? Message { get; set; } = string.Empty;
        public string? Email { get; set; } = string.Empty;
        public string? Lizenz { get; set; } = string.Empty;

        public Organisation? Organisation { get; set; }
        public RequestUser? Admin { get; set; }

        public RequestForOffer? RequestForOffer { get; set; }

        public string SelectedLanguage { get; set; } = string.Empty;
    }

    public class RequestUser
    {
        public string Name { get; set; } = string.Empty;
        public string? Vorname { get; set; } = string.Empty;
        public string? Email { get; set; } = string.Empty;
    }

    public class RequestForOffer
    {
        public string Name { get; set; } = string.Empty;
        public string? Vorname { get; set; } = string.Empty;
        public string? Email { get; set; } = string.Empty;
        public string? PaymentPeriod { get; set; } = string.Empty;
        public string? NumberOfLicences { get; set; } = string.Empty;
        public string? Price { get; set; } = string.Empty;
        public Organisation? Organisation { get; set; }
    }
}
