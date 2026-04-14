namespace AasDesignerApi.Model.Client
{
    public class EmailResponse
    {
        public string Email { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;

        public EmailResponse(string email, string subject, string body)
        {
            Email = email;
            Subject = subject;
            Body = body;
        }
    }
}
