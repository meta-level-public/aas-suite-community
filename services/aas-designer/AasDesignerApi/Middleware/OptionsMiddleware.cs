using System.Net;
using VwsPortalApi.Cors;

namespace AasDesignerApi.Middleware
{
    public class OptionsMiddleware
    {
        private readonly RequestDelegate _next;

        public OptionsMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext httpContext, CorsService corsService)
        {
            var origin = httpContext.Request.Headers["Origin"].FirstOrDefault();
            var hasOrigin = corsService.HasCorsConfig(origin);
            if (httpContext.Request.Method == "OPTIONS")
            {
                if (hasOrigin)
                {
                    if (httpContext.Response.Headers.ContainsKey("Access-Control-Allow-Origin"))
                    {
                        httpContext.Response.Headers.Remove("Access-Control-Allow-Origin");
                    }
                    httpContext.Response.Headers.Append("Access-Control-Allow-Origin", origin);
                    httpContext.Response.Headers.Append("Access-Control-Allow-Credentials", "true");
                    httpContext.Response.Headers.Append("Access-Control-Allow-Methods", "*");
                    httpContext.Response.Headers.Append(
                        "Access-Control-Allow-Headers",
                        "Authorization, Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Api-Key, ApiKey,x-gui-language, x-infrastructure-id, x-organisation-id"
                    );
                    httpContext.Response.StatusCode = (int)HttpStatusCode.OK;
                    return;
                }
            }
            await _next.Invoke(httpContext);
        }
    }
}
