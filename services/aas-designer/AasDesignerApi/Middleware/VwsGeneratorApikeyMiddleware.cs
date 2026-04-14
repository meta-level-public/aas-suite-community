using AasDesignerApi.Apikey;

namespace AasDesignerApi.Auth
{
    public class VwsGeneratorApikeyMiddleware
    {
        private readonly RequestDelegate _next;

        public VwsGeneratorApikeyMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task Invoke(
            HttpContext context,
            ApikeyService apikeyService,
            ILogger<VwsGeneratorApikeyMiddleware> logger
        )
        {
            var apiKey =
                context.Request.Headers["Api-Key"].FirstOrDefault()
                ?? context.Request.Headers["api-key"].FirstOrDefault()
                ?? context.Request.Headers["apikey"].FirstOrDefault()
                ?? context.Request.Headers["Apikey"].FirstOrDefault();

            if (apiKey != null)
            {
                // attach user to context on successful jwt validation
                try
                {
                    var guid = new Guid(apiKey);
                    var apiKeyObj = apikeyService.GetByKey(guid);
                    if (apiKeyObj == null)
                    {
                        logger.LogInformation("ApiKey not found: " + apiKey);
                    }
                    else
                    {
                        logger.LogInformation(
                            "ApiKey found: ID:"
                                + apiKeyObj.Id
                                + " - Scope: "
                                + String.Join("; ", apiKeyObj.Scopes)
                        );
                    }
                    context.Items["ApiKey"] = apiKeyObj;
                }
                catch (FormatException)
                {
                    // ignore invalid apikey
                    logger.LogInformation("Invalid ApiKey: " + apiKey);
                }
            }

            await _next(context);
        }
    }
}
