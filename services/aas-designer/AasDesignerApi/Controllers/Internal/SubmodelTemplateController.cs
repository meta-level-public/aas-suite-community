using System.Web;
using AasDesignerApi.Exceptions;
using AasDesignerApi.Model;
using AasDesignerApi.Model.Client;
using AasDesignerApi.SubmodelTemplate;
using AasDesignerAuthorization;
using AasDesignerCommon.Utils;
using AasShared.Controllers;
using AasShared.Exceptions;
using AasShared.Submodels;
using BaSyx.Models.Core.AssetAdministrationShell.Generics;
using BaSyx.Models.Core.AssetAdministrationShell.Implementations;
using BaSyx.Models.Export;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.Primitives;

namespace AasDesignerApi.Controllers.Internal
{
    [ApiController]
    [Route("api/[controller]/[action]")]
    [ApiExplorerSettings(GroupName = "internal")]
    public class SubmodelTemplateController : InternalApiBaseController
    {
        private readonly SubmodelTemplateService _templateService;

        public SubmodelTemplateController(SubmodelTemplateService templateService)
        {
            _templateService = templateService;
        }

        [HttpGet]
        [AasDesignerAuthorize(
            RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
        )]
        public async Task<ActionResult<SubmodelElementCollection?>> GetAddressTemplate(string typ)
        {
            return await Task.FromResult(AddressManager.CreateAddressCollection());
        }

        [HttpGet]
        [AasDesignerAuthorize]
        public async Task<ActionResult<SubmodelElementCollection?>> GetMarkingTemplate()
        {
            return await Task.FromResult(MarkingManager.CreateMarking());
        }

        [HttpGet]
        [AasDesignerAuthorize(
            RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
        )]
        public async Task<ActionResult<SubmodelElementCollection>> GetDocumentTemplate()
        {
            return await Task.FromResult(DocumentManager.CreateDocumentElement());
        }

        [HttpGet]
        [AasDesignerAuthorize(
            RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
        )]
        public async Task<Submodel?> GetNameplateTemplate()
        {
            return await Task.FromResult(NameplateManager.CreateEmptyModel());
        }

        [HttpGet]
        [AasDesignerAuthorize(
            RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
        )]
        public async Task<ISubmodel?> GetTechnicalDataTemplate()
        {
            return await Task.FromResult(TechnicalDataManager.CreateEmptyModel());
        }

        [HttpGet]
        [AasDesignerAuthorize(
            RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
        )]
        public async Task<SubmodelResult> GetModelTemplate(long id)
        {
            return await Task.FromResult(_templateService.GetEmptyTemplate(id));
        }

        [HttpGet]
        [AasDesignerAuthorize]
        public async Task<SubmodelResult> GetModelTemplateByName(
            string name,
            AasMetamodelVersion version
        )
        {
            return await Task.FromResult(_templateService.GetEmptyTemplateByName(name, version));
        }

        [HttpGet]
        [AasDesignerAuthorize]
        public async Task<SubmodelResult> GetRepoSubmodelTemplate(
            string url,
            [FromQuery] List<string>? knownConceptDescriptionIds
        )
        {
            return await _templateService.GetRepoSubmodelTemplate(url, knownConceptDescriptionIds);
        }

        [HttpPost]
        [AasDesignerAuthorize]
        public async Task<SubmodelResult> GetRepoSubmodelTemplatePost(
            [FromBody] RepoSubmodelTemplateRequest request
        )
        {
            return await _templateService.GetRepoSubmodelTemplate(
                request?.Url ?? string.Empty,
                request?.KnownConceptDescriptionIds
            );
        }

        [HttpGet]
        [AasDesignerAuthorize]
        public async Task<string?> GetRepoConceptDescription(string id)
        {
            return await _templateService.GetRepoConceptDescription(id);
        }

        [HttpPost]
        [AasDesignerAuthorize]
        public async Task<List<string>> GetRepoConceptDescriptions([FromBody] List<string> ids)
        {
            return await _templateService.GetRepoConceptDescriptions(ids);
        }

        [HttpGet]
        [AasDesignerAuthorize(
            RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
        )]
        public async Task<List<Model.SubmodelTemplate>> GetAll(AasMetamodelVersion version)
        {
            return await Task.FromResult(_templateService.GetAll(version));
        }

        [HttpGet]
        [AasDesignerAuthorize(
            RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
        )]
        public async Task<List<Model.SubmodelTemplate>> GetAllFromIdtaRepo()
        {
            return await _templateService.GetAllFromIdtaRepo();
        }

        [HttpGet]
        [AasDesignerAuthorize(
            RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
        )]
        public async Task<SubmodelResult> GetBatteryPassportFromIdtaRepo()
        {
            return await _templateService.GetBatteryPassportFromIdtaRepo();
        }

        [HttpGet]
        [AasDesignerAuthorize(
            RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
        )]
        public async Task<
            ActionResult<StandardGeneratorBootstrapResult>
        > GetStandardGeneratorBootstrap(string mode, string? iriPrefix = null)
        {
            try
            {
                return await _templateService.GetStandardGeneratorBootstrap(mode, iriPrefix);
            }
            catch (ArgumentException exception)
            {
                return BadRequest(exception.Message);
            }
        }

        [HttpGet]
        [AasDesignerAuthorize(
            RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
        )]
        public async Task<ActionResult> Download(int id)
        {
            var paket = _templateService.GetPaket(id);

            var provider = new FileExtensionContentTypeProvider();
            if (!provider.TryGetContentType(paket.Filename, out var contentType))
            {
                contentType = "application/octet-stream";
            }

            var basePath =
                new FileInfo(System.Reflection.Assembly.GetExecutingAssembly().Location)
                    .Directory
                    ?.FullName
                ?? string.Empty;
            // Datei Lesen
            var stream = new FileStream(
                Path.Combine(basePath, "Assets", "Templates", paket.Filename),
                FileMode.Open
            );
            var filename = Path.GetFileName(paket.Filename);
            var downloadFile = File(stream, contentType, filename);

            return await Task.FromResult(downloadFile);
        }

        [HttpPost, DisableRequestSizeLimit]
        [RequestFormLimits(
            ValueLengthLimit = int.MaxValue,
            MultipartBodyLengthLimit = long.MaxValue
        )]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
        public async Task<long> Import()
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();
            var formCollection = await Request.ReadFormAsync();
            var file = formCollection.Files[0];

            if (file.Length > 0)
            {
                var filename = string.Empty;
                var semanticIds = string.Empty;
                var name = string.Empty;
                var label = string.Empty;
                var version = AasMetamodelVersion.UNKNOWN;
                var group = "IDTA";

                Request
                    .Form.Keys.ToList()
                    .ForEach(
                        (key) =>
                        {
                            StringValues val;
                            Request.Form.TryGetValue(key, out val);
                            if (key == "filename")
                            {
                                filename = val[0];
                            }
                            if (key == "semanticIds")
                            {
                                semanticIds = val[0];
                            }
                            if (key == "label")
                            {
                                label = val[0];
                            }
                            if (key == "name")
                            {
                                name = val[0];
                            }
                            if (key == "version")
                            {
                                version = (AasMetamodelVersion)
                                    Enum.Parse(typeof(AasMetamodelVersion), val[0] ?? "UNKNOWN");
                            }
                            if (key == "group")
                            {
                                group = val[0];
                            }
                        }
                    );

                var result = _templateService.SavePackageFile(
                    file,
                    filename,
                    benutzer.Benutzer,
                    label,
                    semanticIds,
                    name,
                    version,
                    group
                );

                return await Task.FromResult(result);
            }
            else
            {
                throw new InvalidFileException("FILESIZE 0 byte!");
            }
        }

        [HttpPost, DisableRequestSizeLimit]
        [RequestFormLimits(
            ValueLengthLimit = int.MaxValue,
            MultipartBodyLengthLimit = long.MaxValue
        )]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
        public async Task BulkImport()
        {
            var user = HttpContext.Items[AasDesignerConstants.CURRENT_USER] as Model.Benutzer;
            if (user == null)
                throw new UserNotFoundException();
            {
                var formCollection = await Request.ReadFormAsync();

                var group = "IDTA";
                Request
                    .Form.Keys.ToList()
                    .ForEach(
                        (key) =>
                        {
                            StringValues val;
                            Request.Form.TryGetValue(key, out val);
                            if (key == "group")
                            {
                                group = val[0];
                            }
                        }
                    );
                _templateService.SavePackageFiles(formCollection.Files.ToList(), group);
            }
        }

        [HttpDelete]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
        public async Task<ActionResult<bool>> Delete(long id)
        {
            var result = _templateService.Delete(id);

            return await Task.FromResult(result);
        }

        [HttpPut]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
        public async Task<ActionResult<bool>> Update([FromBody] Model.SubmodelTemplate smt)
        {
            var result = _templateService.Update(smt);

            return await Task.FromResult(result);
        }

        [HttpGet]
        [AasDesignerAuthorize(
            RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
        )]
        public async Task<SubmodelResult> GetByIdentification(
            string? idShort,
            string? semanticId,
            AasMetamodelVersion version
        )
        {
            return await Task.FromResult(
                _templateService.GetByIdentification(
                    idShort,
                    HttpUtility.UrlDecode(semanticId),
                    version
                )
            );
        }
    }
}
