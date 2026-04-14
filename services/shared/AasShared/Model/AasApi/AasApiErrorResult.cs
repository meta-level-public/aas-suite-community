namespace AasShared.Model.AasApi
{
    public class AasApiErrorResult
    {
        public List<AasApiMessage> Messages { get; set; } = new();
    }

    public class AasApiMessage
    {
        public string Code { get; set; } = string.Empty;
        public string CorrelationId { get; set; } = string.Empty;
        public MessageType MessageType { get; set; } = MessageType.Info;
        public string Text { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
    }

    public enum MessageType
    {
        Info,
        Warning,
        Error,
        Exception,
    }
}
