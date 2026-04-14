using System.Collections.Concurrent;

namespace AasDesignerAasApi.ServerSentEvent;

public class SubmodelUpdateMessageStore : IBaseStore
{
    private readonly SseClientStore _sseClientStore;

    public SubmodelUpdateMessageStore(SseClientStore sseClientStore)
    {
        _sseClientStore = sseClientStore;
    }

    public ConcurrentDictionary<Guid, IUpdateMessage> UpdateMessages { get; set; } = new();

    public void AddNewUpdateMessage(string smIdentifier, long infrastructureId)
    {
        _sseClientStore
            .Clients.ToList()
            .ForEach(client =>
            {
                var added = UpdateMessages.TryAdd(
                    client.ClientGuid,
                    new SubmodelUpdateMessage
                    {
                        Identifier = smIdentifier,
                        InfrastructureId = infrastructureId,
                        Type = MessageType.Infrastructure,
                    }
                );
            });
    }
}
