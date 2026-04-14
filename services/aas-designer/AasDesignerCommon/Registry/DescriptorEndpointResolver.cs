using System.Text;
using AasDesignerCommon.Utils;
using AasDesignerModel.Model;

namespace AasDesignerCommon.Registry;

public static class DescriptorEndpointResolver
{
    public static string ResolveAasDescriptorEndpoint(
        AasInfrastructureSettings infrastructure,
        string baseUrl,
        string aasId
    )
    {
        return infrastructure.UsesInternalRouting()
            ? BuildProxyEndpoint(baseUrl, infrastructure.Id, "aas-repo", "shells", aasId)
            : BuildRepositoryEndpoint(infrastructure.AasRepositoryUrl, "shells", aasId);
    }

    public static string ResolveSubmodelDescriptorEndpoint(
        AasInfrastructureSettings infrastructure,
        string baseUrl,
        string submodelId
    )
    {
        return infrastructure.UsesInternalRouting()
            ? BuildProxyEndpoint(baseUrl, infrastructure.Id, "sm-repo", "submodels", submodelId)
            : BuildRepositoryEndpoint(
                infrastructure.SubmodelRepositoryUrl,
                "submodels",
                submodelId
            );
    }

    private static string BuildProxyEndpoint(
        string baseUrl,
        long infrastructureId,
        string proxyType,
        string resourceSegment,
        string identifier
    )
    {
        if (string.IsNullOrWhiteSpace(baseUrl))
        {
            throw new InvalidOperationException(
                "BaseUrl is required to build proxy descriptor endpoints for internal infrastructures."
            );
        }

        return (
            baseUrl.AppendSlash()
            + "aas-proxy/"
            + infrastructureId
            + "/"
            + proxyType
            + "/"
            + resourceSegment
            + "/"
            + identifier.ToBase64UrlEncoded(Encoding.UTF8)
        )
            .Replace("//", "/")
            .Replace(":/", "://");
    }

    private static string BuildRepositoryEndpoint(
        string repositoryUrl,
        string resourceSegment,
        string identifier
    )
    {
        return (
            repositoryUrl.AppendSlash()
            + resourceSegment
            + "/"
            + identifier.ToBase64UrlEncoded(Encoding.UTF8)
        )
            .Replace("//", "/")
            .Replace(":/", "://");
    }
}
