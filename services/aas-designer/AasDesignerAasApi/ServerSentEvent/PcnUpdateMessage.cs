namespace AasDesignerAasApi.ServerSentEvent;

public class PcnUpdateMessage : IUpdateMessage
{
    public string Identifier { get; set; } = string.Empty;
    public long InfrastructureId { get; set; }
    public MessageType Type { get; set; } = MessageType.Pcn;
    public string AdditionalContent { get; set; } = string.Empty;
}
