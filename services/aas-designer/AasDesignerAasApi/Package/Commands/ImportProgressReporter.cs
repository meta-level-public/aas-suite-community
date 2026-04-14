using System.Text.Json;
using AasDesignerAasApi.ServerSentEvent;

namespace AasDesignerAasApi.Package.Commands;

public sealed class ImportProgressReporter
{
    private readonly Guid? _clientGuid;
    private readonly long _infrastructureId;
    private readonly string _operationId;
    private readonly ImportProgressMessageStore _store;

    public ImportProgressReporter(
        Guid? clientGuid,
        long infrastructureId,
        string operationId,
        ImportProgressMessageStore store
    )
    {
        _clientGuid = clientGuid;
        _infrastructureId = infrastructureId;
        _operationId = operationId;
        _store = store;
    }

    public void Report(
        int progressPercent,
        string stage,
        string message,
        int processedFiles,
        int totalFiles,
        string? currentFileName = null,
        bool completed = false,
        bool failed = false
    )
    {
        if (_clientGuid is not Guid clientGuid)
        {
            return;
        }

        var payload = JsonSerializer.Serialize(
            new
            {
                operationId = _operationId,
                infrastructureId = _infrastructureId,
                progressPercent,
                stage,
                message,
                processedFiles,
                totalFiles,
                currentFileName,
                completed,
                failed,
            }
        );

        _store.AddOrUpdateMessage(clientGuid, _operationId, _infrastructureId, payload);
    }
}
