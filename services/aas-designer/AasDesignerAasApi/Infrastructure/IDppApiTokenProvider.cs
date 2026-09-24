namespace AasDesignerAasApi.Infrastructure;

public interface IDppApiTokenProvider
{
    Task<string> GetAccessTokenAsync(CancellationToken cancellationToken = default);
}
