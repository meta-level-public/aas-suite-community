using AasShared.Middleware;
using Microsoft.AspNetCore.Mvc;

namespace AasShared.Controllers
{
    [ServiceFilter<AasApiExceptionFilter>]
    public class AasApiBaseController : ControllerBase { }
}
