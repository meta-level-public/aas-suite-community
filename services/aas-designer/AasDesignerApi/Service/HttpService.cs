namespace AasDesignerApi.Service;

public sealed class HttpService
{
    private static readonly Lazy<HttpService> lazy = new Lazy<HttpService>(() => new HttpService());

    public static HttpService Instance
    {
        get { return lazy.Value; }
    }

    public readonly HttpClient HttpClient;

    private HttpService()
    {
        HttpClient = new HttpClient { Timeout = TimeSpan.FromMinutes(1) };
    }
}
