using AasShared.Controllers;
using Microsoft.AspNetCore.Mvc;

namespace AasDesignerApi.Controllers.AasApi
{
    [ApiController]
    [Route("api")]
    [Route("api/PublicApi")]
    [ApiExplorerSettings(GroupName = "serialization")]
    public class SerializationApiController : AasApiBaseController { }
}
