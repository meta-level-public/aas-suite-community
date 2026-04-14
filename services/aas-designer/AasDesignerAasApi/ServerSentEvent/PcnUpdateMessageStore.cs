using System.Collections.Concurrent;

namespace AasDesignerAasApi.ServerSentEvent;

public class PcnUpdateMessageStore : IBaseStore
{
    private readonly SseClientStore _sseClientStore;

    public PcnUpdateMessageStore(SseClientStore sseClientStore)
    {
        _sseClientStore = sseClientStore;
    }

    public ConcurrentDictionary<Guid, IUpdateMessage> UpdateMessages { get; set; } = new();

    public void AddNewUpdateMessage(
        string aasIdentifier,
        long infrastructureId,
        string additionalContent
    )
    {
        _sseClientStore
            .Clients.ToList()
            .ForEach(client =>
                UpdateMessages.TryAdd(
                    client.ClientGuid,
                    new PcnUpdateMessage
                    {
                        Identifier = aasIdentifier,
                        InfrastructureId = infrastructureId,
                        AdditionalContent = additionalContent,
                        Type = MessageType.Pcn,
                    }
                )
            );
    }
}
