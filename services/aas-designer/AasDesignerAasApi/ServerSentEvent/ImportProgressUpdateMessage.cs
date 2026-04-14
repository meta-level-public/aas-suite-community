namespace AasDesignerAasApi.ServerSentEvent;

public class ImportProgressUpdateMessage : IUpdateMessage
{
    public string Identifier { get; set; } = string.Empty;
    public long InfrastructureId { get; set; }
    public MessageType Type { get; set; } = MessageType.Other;
    public string AdditionalContent { get; set; } = string.Empty;
}
