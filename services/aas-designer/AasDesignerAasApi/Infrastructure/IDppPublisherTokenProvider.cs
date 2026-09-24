namespace AasDesignerAasApi.Infrastructure;

public interface IDppPublisherTokenProvider
{
    Task<string> GetAccessTokenAsync(
        string infrastructureId,
        CancellationToken cancellationToken = default
    );
}
