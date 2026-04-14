using AasShared.Middleware;
using Microsoft.AspNetCore.Mvc;

namespace AasShared.Controllers
{
    [ServiceFilter<InternalApiExceptionFilter>]
    public class InternalApiBaseController : ControllerBase { }
}
