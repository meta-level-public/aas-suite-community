using System.Security.Authentication;
using AasShared.Exceptions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Newtonsoft.Json;

namespace AasDesignerApi.Middleware
{
    public class ErroResult
    {
        public string Stacktrace { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string ExceptionType { get; set; } = string.Empty;
    }

    public class ExceptionFilter : IExceptionFilter
    {
        private readonly IWebHostEnvironment _hostingEnvironment;
        private readonly IModelMetadataProvider _modelMetadataProvider;
        private readonly ILogger<ExceptionFilter> _logger;

        public ExceptionFilter(
            IWebHostEnvironment hostingEnvironment,
            IModelMetadataProvider modelMetadataProvider,
            ILogger<ExceptionFilter> logger
        )
        {
            _hostingEnvironment = hostingEnvironment;
            _modelMetadataProvider = modelMetadataProvider;
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
                && ex.Message == "INVALID_TOKEN"
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
