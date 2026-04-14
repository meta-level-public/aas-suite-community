using AasShared.Exceptions;
using AasShared.Model.AasApi;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Logging;

namespace AasShared.Middleware
{
    public class AasApiExceptionFilter : IExceptionFilter
    {
        private readonly ILogger<InternalApiExceptionFilter> _logger;

        public AasApiExceptionFilter(ILogger<InternalApiExceptionFilter> logger)
        {
            _logger = logger;
        }

        public void OnException(ExceptionContext context)
        {
            if (context.Exception is AasApi404Exception)
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
                var apiError = new AasApiErrorResult()
                {
                    Messages = new List<AasApiMessage>()
                    {
                        new AasApiMessage()
                        {
                            MessageType = MessageType.Exception,
                            Text = context.Exception.Message,
                            Timestamp = DateTime.Now,
                        },
                    },
                };
                context.Result = new JsonResult(apiError)
                {
                    StatusCode = StatusCodes.Status500InternalServerError,
                };
                _logger.LogError(context.Exception, "Exception");
            }
        }
    }
}
