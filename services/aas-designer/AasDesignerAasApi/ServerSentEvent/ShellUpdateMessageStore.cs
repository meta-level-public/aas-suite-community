using System.Collections.Concurrent;

namespace AasDesignerAasApi.ServerSentEvent;

public class ShellUpdateMessageStore : IBaseStore
{
    private readonly SseClientStore _sseClientStore;

    public ShellUpdateMessageStore(SseClientStore sseClientStore)
    {
        _sseClientStore = sseClientStore;
    }

    public ConcurrentDictionary<Guid, IUpdateMessage> UpdateMessages { get; set; } = new();

    public void AddNewUpdateMessage(string aasIdentifier, long infrastructureId)
    {
        _sseClientStore
            .Clients.ToList()
            .ForEach(client =>
                UpdateMessages.TryAdd(
                    client.ClientGuid,
                    new ShellUpdateMessage
                    {
                        Identifier = aasIdentifier,
                        InfrastructureId = infrastructureId,
                        Type = MessageType.Infrastructure,
                    }
                )
            );
    }
}
