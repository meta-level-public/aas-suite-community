using AasDesignerApi.Model;
using AasDesignerCommon.Utils;
using AasShared.Middleware;
using AasShared.Model.AasApi;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace AasDesignerAuthorization
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
    public class AasDesignerAuthorizeAttribute : Attribute, IAuthorizationFilter
    {
        public string[] RequiredRoles { get; set; } = Array.Empty<string>();
        public string[] RequiredScopes { get; set; } = Array.Empty<string>();
        public int InfrastructureId { get; set; }

        public void OnAuthorization(AuthorizationFilterContext context)
        {
            // skip authorization if action is decorated with [AllowAnonymous] attribute
            var allowAnonymous = context
                .ActionDescriptor.EndpointMetadata.OfType<AllowAnonymousAttribute>()
                .Any();
            if (allowAnonymous)
                return;

            var user = (AppUser?)context.HttpContext.Items[AasDesignerConstants.APP_USER];
            if (user == null)
            {
                // prüfen ob es einen apiKey gibt
                var apiKey = (Apikey?)context.HttpContext.Items[AasDesignerConstants.API_KEY];
                if (apiKey != null)
                {
                    if (!IsAllowed(apiKey))
                    {
                        context.Result = GetResult(
                            StatusCodes.Status403Forbidden,
                            context,
                            "Unauthorized"
                        );
                    }
                }
                else
                {
                    // not logged in
                    context.Result = GetResult(
                        StatusCodes.Status401Unauthorized,
                        context,
                        "Unauthorized"
                    );
                }
            }
            else if (!IsAllowed(user))
            {
                // Forbidden
                context.Result = GetResult(StatusCodes.Status403Forbidden, context, "Forbidden");
            }
            else
            {
                // alles gut -> keine Behandlung notwendig
            }
        }

        private IActionResult GetResult(int code, AuthorizationFilterContext context, string detail)
        {
            IActionResult result;
            if (context.Filters.Any(f => f.GetType() == typeof(AasApiExceptionFilter)))
            {
                var apiError = new AasApiErrorResult()
                {
                    Messages = new List<AasApiMessage>()
                    {
                        new AasApiMessage()
                        {
                            MessageType = MessageType.Exception,
                            Text = detail,
                            Timestamp = DateTime.Now,
                        },
                    },
                };
                result = new JsonResult(apiError) { StatusCode = code };
            }
            else
            {
                result = new JsonResult(
                    new { TechnicalError = true, TechnicalErrorDetail = detail }
                )
                {
                    StatusCode = code,
                };
            }

            return result;
        }

        private bool IsAllowed(Apikey apiKey)
        {
            var allowed = false;

            if (!RequiredScopes.Any())
            {
                // no roles are required, but user has to be logged in
                allowed = true;
            }

            if (!allowed)
            {
                allowed = RequiredScopes.Any(requiredScope =>
                    apiKey.Scopes.Exists(scope => scope == requiredScope)
                );
            }

            return allowed;
        }

        private bool IsAllowed(AppUser benutzer)
        {
            var allowed = false;

            if (!RequiredRoles.Any())
            {
                // no roles are required, but user has to be logged in
                allowed = true;
            }

            if (!allowed)
            {
                allowed = RequiredRoles.Any(requiredRole =>
                    benutzer.BenutzerRollen.Exists(userRole => userRole == requiredRole)
                );
            }

            return allowed;
        }
    }
}
