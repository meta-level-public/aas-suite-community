namespace gateway.Bff;

public sealed class GatewayBackendOptions
{
    public string DesignerBaseUrl { get; set; } = string.Empty;
    public string FrontendLoginPath { get; set; } = "/designer-ui/login";

    /// <summary>
    /// Externer Pfad-Präfix, unter dem die gesamte Suite bereitgestellt wird (z.B. "/aas_testing").
    /// Leer lassen, wenn die Suite direkt am Root läuft.
    /// </summary>
    public string ExternalBasePath { get; set; } = string.Empty;

    /// <summary>
    /// Basis-Pfade weiterer SPAs hinter dem Gateway (z.B. der Markt unter "/markt-ui").
    /// Rücksprung-URLs nach dem SSO-Login, die mit einem dieser Pfade beginnen, werden
    /// unverändert übernommen statt unter <see cref="FrontendBasePath"/> gehängt.
    /// </summary>
    public string[] AdditionalFrontendBasePaths { get; set; } = ["/markt-ui"];

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
