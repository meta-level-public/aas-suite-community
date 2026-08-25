using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;

namespace AasSuitePluginAbstractions;

public interface IAasSuiteBackendPlugin
{
    void ConfigureServices(IServiceCollection services);
    void MapEndpoints(IEndpointRouteBuilder endpoints);
}
