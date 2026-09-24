using Microsoft.Extensions.Options;

namespace DppGateway;

public sealed record DppRoute(Uri UpstreamBaseUri, Uri AttachmentBaseUri, DppOAuthOptions OAuth)
{
    public DppRoute(Uri upstreamBaseUri, DppOAuthOptions oauth)
        : this(upstreamBaseUri, upstreamBaseUri, oauth) { }
}

public interface IDppRouteResolver
{
    ValueTask<DppRoute?> ResolveAsync(string dppId, CancellationToken cancellationToken);
}

public interface IDppInfrastructureRouteResolver
{
    DppRoute? ResolveInfrastructure(string infrastructureId);
}

public sealed class SingleTenantDppRouteResolver
    : IDppRouteResolver,
        IDppInfrastructureRouteResolver
{
    private readonly DppRoute _route;
    private readonly IDppPublicationRegistry _registry;
    private readonly string _infrastructureId;

    public SingleTenantDppRouteResolver(
        IOptions<DppGatewayOptions> options,
        IDppPublicationRegistry registry
    )
    {
        _registry = registry;
        _infrastructureId = options.Value.SingleTenantInfrastructureId;
        _route = new DppRoute(
            new Uri(options.Value.SingleTenantUpstreamBaseUrl.TrimEnd('/') + "/"),
            new Uri(
                (
                    string.IsNullOrWhiteSpace(options.Value.SingleTenantAttachmentBaseUrl)
                        ? options.Value.SingleTenantUpstreamBaseUrl
                        : options.Value.SingleTenantAttachmentBaseUrl
                ).TrimEnd('/') + "/"
            ),
            options.Value.SingleTenantOAuth
        );
    }

    public async ValueTask<DppRoute?> ResolveAsync(
        string dppId,
        CancellationToken cancellationToken
    )
    {
        return await _registry.IsPublishedAsync(dppId, cancellationToken) ? _route : null;
    }

    public DppRoute? ResolveInfrastructure(string infrastructureId) =>
        infrastructureId == _infrastructureId ? _route : null;
}

public sealed class MultiTenantDppRouteResolver : IDppRouteResolver, IDppInfrastructureRouteResolver
{
    private readonly IReadOnlyDictionary<string, DppRoute> _routes;
    private readonly IDppPublicationRegistry _registry;
    private readonly string _upstreamTemplate;
    private readonly string _attachmentTemplate;
    private readonly DppOAuthOptions _sharedOAuth;

    public MultiTenantDppRouteResolver(
        IOptions<DppGatewayOptions> options,
        IDppPublicationRegistry registry
    )
    {
        _registry = registry;
        _upstreamTemplate = options.Value.MultiTenantUpstreamBaseUrlTemplate;
        _attachmentTemplate = options.Value.MultiTenantAttachmentBaseUrlTemplate;
        _sharedOAuth = options.Value.MultiTenantOAuth;
        var infrastructures = options.Value.Infrastructures.ToDictionary(
            item => item.InfrastructureId.Trim(),
            item => new DppRoute(
                new Uri(item.UpstreamBaseUrl.TrimEnd('/') + "/"),
                new Uri(
                    (
                        string.IsNullOrWhiteSpace(item.AttachmentBaseUrl)
                            ? item.UpstreamBaseUrl
                            : item.AttachmentBaseUrl
                    ).TrimEnd('/') + "/"
                ),
                item.OAuth
            ),
            StringComparer.Ordinal
        );
        _routes = infrastructures;
    }

    public async ValueTask<DppRoute?> ResolveAsync(
        string dppId,
        CancellationToken cancellationToken
    )
    {
        var infrastructureId = await _registry.GetInfrastructureIdAsync(dppId, cancellationToken);
        return infrastructureId == null ? null : ResolveInfrastructure(infrastructureId);
    }

    public DppRoute? ResolveInfrastructure(string infrastructureId) =>
        _routes.GetValueOrDefault(infrastructureId)
        ?? ResolveDynamicInfrastructure(infrastructureId);

    private DppRoute? ResolveDynamicInfrastructure(string infrastructureId)
    {
        if (string.IsNullOrWhiteSpace(_upstreamTemplate) || !Guid.TryParse(infrastructureId, out _))
            return null;
        var url = _upstreamTemplate.Replace(
            "{infrastructureId}",
            infrastructureId.ToLowerInvariant(),
            StringComparison.Ordinal
        );
        var attachmentUrl = _attachmentTemplate.Replace(
            "{infrastructureId}",
            infrastructureId.ToLowerInvariant(),
            StringComparison.Ordinal
        );
        return
            DppGatewayOptionsValidator.IsValidUpstreamBaseUrl(url)
            && DppGatewayOptionsValidator.IsValidUpstreamBaseUrl(attachmentUrl)
            ? new DppRoute(
                new Uri(url.TrimEnd('/') + "/"),
                new Uri(attachmentUrl.TrimEnd('/') + "/"),
                _sharedOAuth
            )
            : null;
    }
}
