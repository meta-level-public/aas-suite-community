using AasDesignerAasApi.Infrastructure;

namespace AasDesignerApi.Authorization;

public sealed class KeycloakDppApiTokenProvider(KeycloakAdminService keycloakAdminService)
    : IDppApiTokenProvider
{
    private Task<string>? _accessToken;

    public Task<string> GetAccessTokenAsync(CancellationToken cancellationToken = default) =>
        _accessToken ??= keycloakAdminService.GetDppGatewayAccessTokenAsync(cancellationToken);
}
