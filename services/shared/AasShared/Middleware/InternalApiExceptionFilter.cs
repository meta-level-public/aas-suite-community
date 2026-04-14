using System.Security.Authentication;
using AasShared.Exceptions;
using AasShared.Model.AasApi;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace AasShared.Middleware
{
    public class ErroResult
    {
        public string Stacktrace { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string ExceptionType { get; set; } = string.Empty;
    }

    public class InternalApiExceptionFilter : IExceptionFilter
    {
        private readonly ILogger<InternalApiExceptionFilter> _logger;

        public InternalApiExceptionFilter(ILogger<InternalApiExceptionFilter> logger)
        {
            _logger = logger;
        }

        public void OnException(ExceptionContext context)
        {
            if (context.Exception is OperationNotAllowedException)
            {
                context.Result = new JsonResult(
                    new { TechnicalError = true, TechnicalErrorDetail = context.Exception.Message }
                )
                {
                    StatusCode = StatusCodes.Status403Forbidden,
                };
                _logger.LogInformation(context.Exception, "Forbidden");
            }
            else if (
                context.Exception is AuthenticationException ex
                && (
                    ex.Message == "INVALID_TOKEN"
                    || ex.Message == "TOKEN_REVOKED"
                    || ex.Message == "TOKEN_EXPIRED"
                )
            )
            {
                context.Result = new JsonResult(
                    new { TechnicalError = true, TechnicalErrorDetail = context.Exception.Message }
                )
                {
                    StatusCode = StatusCodes.Status410Gone,
                };
                _logger.LogInformation(context.Exception, "Gone");
            }
            else if (context.Exception is AasApi404Exception)
            {
                var apiError = new AasApiErrorResult()
                {
                    Messages = new List<AasApiMessage>()
                    {
                        new AasApiMessage()
                        {
                            MessageType = MessageType.Error,
                            Text = context.Exception.Message,
                            Timestamp = DateTime.Now,
                        },
                    },
                };
                context.Result = new JsonResult(apiError)
                {
                    StatusCode = StatusCodes.Status404NotFound,
                };
            }
            else
            {
                var errorResult = new ErroResult
                {
                    Stacktrace = context.Exception.StackTrace ?? "",
                    Message = context.Exception.Message,
                    ExceptionType = context.Exception.GetType().Name,
                };

                context.Result = new ContentResult()
                {
                    Content = JsonConvert.SerializeObject(errorResult),
                    StatusCode = StatusCodes.Status400BadRequest,
                };
                _logger.LogError(context.Exception, "Exception");
            }
        }
    }
}
