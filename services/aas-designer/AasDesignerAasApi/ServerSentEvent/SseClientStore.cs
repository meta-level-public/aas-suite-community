namespace AasDesignerAasApi.ServerSentEvent;

public class SseClientStore
{
    public ICollection<SseClient> Clients { get; set; } = [];
}
