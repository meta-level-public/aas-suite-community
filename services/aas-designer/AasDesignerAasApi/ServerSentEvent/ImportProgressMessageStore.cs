using System.Collections.Concurrent;

namespace AasDesignerAasApi.ServerSentEvent;

public class ImportProgressMessageStore : IBaseStore
{
    public ConcurrentDictionary<Guid, IUpdateMessage> UpdateMessages { get; set; } = new();

    public void AddOrUpdateMessage(
        Guid clientGuid,
        string operationId,
        long infrastructureId,
        string additionalContent
    )
    {
        var message = new ImportProgressUpdateMessage
        {
            Identifier = operationId,
            InfrastructureId = infrastructureId,
            AdditionalContent = additionalContent,
            Type = MessageType.Other,
        };

        UpdateMessages.AddOrUpdate(clientGuid, message, (_, _) => message);
    }
}
