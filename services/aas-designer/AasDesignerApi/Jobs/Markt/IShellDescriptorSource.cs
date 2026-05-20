using AasDesignerModel.Model;

namespace AasDesignerApi.Jobs.Markt;

/// <summary>
/// Abstraction over two AAS endpoint strategies:
/// 1. Registry-Descriptors (bevorzugt, schlank)
/// 2. Repository-Shells (Fallback wenn keine Registry konfiguriert/erreichbar)
/// </summary>
public interface IShellDescriptorSource
{
    /// <summary>
    /// Loads all shell scan entries from the infrastructure in a paginated manner.
    /// Bricht ab wenn <paramref name="cancellationToken"/> signalisiert wird.
    /// </summary>
    IAsyncEnumerable<ShellScanEntry> ScanAsync(
        AasInfrastructureSettings infrastructure,
        HttpClient httpClient,
        CancellationToken cancellationToken
    );
}
