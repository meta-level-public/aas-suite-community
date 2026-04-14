namespace AasDesignerApi.Model.Configuration
{
    public class EmailConfiguration
    {
        public string ApiKey { get; set; } = string.Empty;
        public string SmtpServer { get; set; } = string.Empty;
        public int SmtpPort { get; set; } = 587;
        public bool SmtpUseSSL { get; set; } = false;
        public bool SmtpUseTLS { get; set; } = false;
        public bool SmtpNeedsAuthentication { get; set; } = false;
        public string SenderAddress { get; set; } = string.Empty;
        public string SenderUsername { get; set; } = string.Empty;
        public string SenderPassword { get; set; } = string.Empty;
        public string NewOrgaNotificationAddress { get; set; } = string.Empty;
        public string SubjectPrefix { get; set; } = string.Empty;
    }
}
