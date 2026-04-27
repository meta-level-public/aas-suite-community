using AasDesignerModel.Model;

namespace AasDesignerApi.Jobs.Markt;

/// <summary>
/// Abstraktion über zwei AAS-Endpoint-Strategien:
/// 1. Registry-Descriptors (bevorzugt, schlank)
/// 2. Repository-Shells (Fallback wenn keine Registry konfiguriert/erreichbar)
/// </summary>
public interface IShellDescriptorSource
{
    /// <summary>
    /// Lädt alle Shell-Scan-Einträge aus der Infrastruktur paginiert.
    /// Bricht ab wenn <paramref name="cancellationToken"/> signalisiert wird.
    /// </summary>
    IAsyncEnumerable<ShellScanEntry> ScanAsync(
        AasInfrastructureSettings infrastructure,
        HttpClient httpClient,
        CancellationToken cancellationToken
    );
}
