namespace AasDesignerAasApi.ServerSentEvent;

public class SubmodelUpdateMessage : IUpdateMessage
{
    public string Identifier { get; set; } = string.Empty;
    public long InfrastructureId { get; set; }
    public MessageType Type { get; set; } = MessageType.Infrastructure;
    public string AdditionalContent { get; set; } = string.Empty;
}
