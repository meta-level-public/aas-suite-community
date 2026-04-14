using System.Collections.Concurrent;

namespace AasDesignerAasApi.ServerSentEvent;

public interface IBaseStore
{
    ConcurrentDictionary<Guid, IUpdateMessage> UpdateMessages { get; set; }
}
