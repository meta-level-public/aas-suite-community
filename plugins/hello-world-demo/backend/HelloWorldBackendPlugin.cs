using AasSuitePluginAbstractions;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;

namespace HelloWorldBackendPlugin;

public sealed class HelloWorldBackendPlugin : IAasSuiteBackendPlugin
{
    public void ConfigureServices(IServiceCollection services)
    {
        services.AddSingleton<HelloWorldMessageService>();
    }

    public void MapEndpoints(IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet(
            "/plugin-api/hello-world-demo/message",
            (HelloWorldMessageService service) => Results.Ok(new { message = service.GetMessage() })
        );
    }
}

public sealed class HelloWorldMessageService
{
    public string GetMessage() => "Hello from the AAS Suite backend plugin.";
}