using AasDesignerAasApi.Infrastructure;

namespace AasDesignerApi.Authorization;

public sealed class KeycloakDppPublisherTokenProvider(KeycloakAdminService keycloakAdminService)
    : IDppPublisherTokenProvider
{
    public Task<string> GetAccessTokenAsync(
        string infrastructureId,
        CancellationToken cancellationToken = default
    ) => keycloakAdminService.GetDppPublisherAccessTokenAsync(infrastructureId, cancellationToken);
}
