namespace gateway.Bff;

public sealed class GatewayBackendOptions
{
    public string DesignerBaseUrl { get; set; } = string.Empty;
    public string FrontendLoginPath { get; set; } = "/designer-ui/login";

    /// <summary>
    /// The base path prefix under which the frontend SPA is served (e.g. "/designer-ui").
    /// Derived from FrontendLoginPath by stripping the last path segment.
    /// </summary>
    public string FrontendBasePath
    {
        get
        {
            var path = FrontendLoginPath.TrimEnd('/');
            var lastSlash = path.LastIndexOf('/');
            return lastSlash > 0 ? path[..lastSlash] : string.Empty;
        }
    }
}
