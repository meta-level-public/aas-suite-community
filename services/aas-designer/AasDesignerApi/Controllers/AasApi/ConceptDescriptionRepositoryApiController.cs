using System.Text;
using AasDesignerApi.AasApi;
using AasDesignerCommon.Utils;
using AasShared.Controllers;
using AasShared.Model.AasApi;
using Microsoft.AspNetCore.Mvc;
using NSwag.Annotations;

namespace AasDesignerApi.Controllers.AasApi
{
    [ApiController]
    [Route("api")]
    [Route("api/PublicApi")]
    [ApiExplorerSettings(GroupName = "conceptDescription")]
    [OpenApiTag("Concept Description Repository API")]
    public class ConceptDescriptionRepositoryApiController : AasApiBaseController
    {
        private readonly PublicApiConceptDescriptionService _cdService;

        public ConceptDescriptionRepositoryApiController(
            PublicApiConceptDescriptionService cdService
        )
        {
            _cdService = cdService;
        }

        // /// <summary>
        // /// Returns all Concept Descriptions
        // /// </summary>
        // /// <param name="idShort">The Concept Description’s IdShort</param>
        // /// <param name="isCaseOf">IsCaseOf reference (UTF8-BASE64-URL-encoded)</param>
        // /// <param name="dataSpecificationRef">DataSpecification reference (UTF8-BASE64-URL-encoded)</param>
        // /// <param name="limit">The maximum number of elements in the response array</param>
        // /// <param name="cursor">A server-generated identifier retrieved from pagingMetadata that specifies from which position the result listing should continue</param>
        // /// <returns></returns>
        // [ProducesResponseType(typeof(AasApiResult<List<AasCore.Aas3_1.ConceptDescription>>), StatusCodes.Status200OK)]
        // [ProducesResponseType(typeof(AasApiErrorResult), StatusCodes.Status400BadRequest)]
        // [ProducesResponseType(typeof(AasApiErrorResult), StatusCodes.Status401Unauthorized)]
        // [ProducesResponseType(typeof(AasApiErrorResult), StatusCodes.Status403Forbidden)]
        // [ProducesResponseType(typeof(AasApiErrorResult), StatusCodes.Status500InternalServerError)]
        // [HttpGet("concept-descriptions")]
        // public async Task<AasApiResult<List<AasCore.Aas3_1.ConceptDescription>>> GetConceptDescriptions(string? idShort, string? isCaseOf, string? dataSpecificationRef, int? limit, string? cursor)
        // {
        //     return await Task.FromResult(_cdService.GetConceptDescriptions(HttpUtility.UrlDecode(idShort), limit, cursor));
        // }

        /// <summary>
        /// Returns a specific Concept Description
        /// </summary>
        /// <param name="cdIdentifier">The Concept Description’s unique id (UTF8-BASE64-URL-encoded)</param>
        /// <returns></returns>
        [ProducesResponseType(typeof(AasCore.Aas3_1.ConceptDescription), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(AasApiErrorResult), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(AasApiErrorResult), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(AasApiErrorResult), StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(AasApiErrorResult), StatusCodes.Status500InternalServerError)]
        [HttpGet("concept-description/{cdIdentifier}")]
        public async Task<string> GetConceptDescription(string cdIdentifier)
        {
            cdIdentifier.TryParseBase64Urlencoded(Encoding.UTF8, out string decodedCdId);
            return await Task.FromResult(_cdService.GetConceptDescription(decodedCdId));
        }
    }
}
