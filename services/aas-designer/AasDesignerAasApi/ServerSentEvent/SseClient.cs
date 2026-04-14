namespace AasDesignerAasApi.ServerSentEvent;

public class SseClient
{
    public Guid ClientGuid { get; set; }
    public DateTimeOffset LastActivity { get; set; }
}
