using System.Linq;
using System.Net.Http;
using System.Text.Json;
using System.Web;
using AasDesignerApi.Model;
using AasDesignerAuthorization;
using AasDesignerCommon.Utils;
using AasDesignerModel;
using AasDesignerModel.Model;
using AasShared.Controllers;
using AasShared.Exceptions;
using AspNetCore.Proxy;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace AasDesignerAasApi.Controllers;

[ApiController]
[Route("aas-proxy")]
[ApiExplorerSettings(GroupName = "aas-api-proxy")]
public class AasProxyController : InternalApiBaseController
{
    private readonly IApplicationDbContext _context;
    private readonly ApiKeyUserResolver _apiKeyUserResolver;
    private readonly HttpClient _httpClient;
    private readonly ILogger<AasProxyController> _logger;

    public AasProxyController(
        IApplicationDbContext context,
        ApiKeyUserResolver apiKeyUserResolver,
        HttpClient httpClient,
        ILogger<AasProxyController> logger
    )
    {
        _context = context;
        _apiKeyUserResolver = apiKeyUserResolver;
        _httpClient = httpClient;
        _logger = logger;
    }

    #region Swagger Proxies

    [HttpGet("{infrastructureId}/swagger-json/{type}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetCombinedSwagger(long infrastructureId, string type)
    {
        var infrastructure = _context.AasInfrastructureSettings.FirstOrDefault(i =>
            i.Id == infrastructureId
        );

        if (infrastructure == null)
            return NotFound();

        // var allPaths = new Dictionary<string, object>();
        // var allComponents = new Dictionary<string, object>();
        // var allTags = new List<object>();

        // Services mit ihren spezifischen Pfaden
        var services = new[]
        {
            ("aas-repository", infrastructure.GetResolvedServiceUrl("aas-repo"), "aas-repo"),
            ("sm-repository", infrastructure.GetResolvedServiceUrl("sm-repo"), "sm-repo"),
            ("aas-registry", infrastructure.GetResolvedServiceUrl("aas-reg"), "aas-reg"),
            ("sm-registry", infrastructure.GetResolvedServiceUrl("sm-reg"), "sm-reg"),
            ("discovery", infrastructure.GetResolvedServiceUrl("discovery"), "discovery"),
            ("cd-repository", infrastructure.GetResolvedServiceUrl("cd-repo"), "cd-repo"),
        };

        // aus den services muss die url aus dem übergebenen typen geladen werden
        var baseUrl = services.FirstOrDefault(s => s.Item3 == type).Item2;

        var swaggerUrl = $"{baseUrl}/v3/api-docs";
        var swaggerUrl2 = $"{baseUrl}/api-docs";
        string response;
        try
        {
            response = await _httpClient.GetStringAsync(swaggerUrl);
        }
        catch
        {
            response = await _httpClient.GetStringAsync(swaggerUrl2);
        }

        return Ok(response);
    }

    [HttpGet("{infrastructureId}/swagger/{type}")]
    [HttpGet("{infrastructureId}/swagger/{type}/index.html")]
    [AllowAnonymous]
    public IActionResult GetSwaggerUI(long infrastructureId, string type)
    {
        var html =
            $@"
<!DOCTYPE html>
<html>
<head>
    <title>Combined AAS API Documentation</title>
    <link rel=""stylesheet"" type=""text/css"" href=""https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui.css"" />
</head>
<body>
    <div id=""swagger-ui""></div>
    <script src=""https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-bundle.js""></script>
    <script>
        SwaggerUIBundle({{
            url: '/aas-proxy/{infrastructureId}/swagger-json/{type}',
            dom_id: '#swagger-ui',
            presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIBundle.presets.standalone
            ],
            tagsSorter: 'alpha',
            operationsSorter: 'alpha',
            displayRequestDuration: true,
            tryItOutEnabled: true
        }});
    </script>
</body>
</html>";

        return Content(html, "text/html");
    }

    [HttpGet("{infrastructureId}/swagger")]
    [AllowAnonymous]
    public IActionResult GetAllSwaggerLinks(long infrastructureId)
    {
        var html =
            $@"
<!DOCTYPE html>
<html>
<head>
    <title>AAS Infrastructure API Documentation</title>
    <meta charset=""utf-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1"">
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }}
        
        .container {{
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }}
        
        .header {{
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }}
        
        .header h1 {{
            font-size: 2.5rem;
            margin-bottom: 10px;
            font-weight: 300;
        }}
        
        .header p {{
            font-size: 1.1rem;
            opacity: 0.9;
        }}
        
        .content {{
            padding: 40px;
        }}
        
        .services-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 25px;
            margin-top: 30px;
        }}
        
        .service-card {{
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 25px;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }}
        
        .service-card:hover {{
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            border-color: #667eea;
        }}
        
        .service-card::before {{
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 4px;
            height: 100%;
            background: #667eea;
        }}
        
        .service-title {{
            font-size: 1.3rem;
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 10px;
        }}
        
        .service-description {{
            color: #6c757d;
            margin-bottom: 20px;
            line-height: 1.5;
        }}
        
        .swagger-link {{
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 5px;
            font-weight: 500;
            transition: all 0.3s ease;
            text-align: center;
            width: 100%;
        }}
        
        .swagger-link:hover {{
            transform: scale(1.05);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }}
        
        .footer {{
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #6c757d;
            border-top: 1px solid #e9ecef;
        }}
        
        .badge {{
            display: inline-block;
            background: #28a745;
            color: white;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 500;
            margin-bottom: 15px;
        }}
        
        @media (max-width: 768px) {{
            .services-grid {{
                grid-template-columns: 1fr;
            }}
            
            .header h1 {{
                font-size: 2rem;
            }}
            
            .content {{
                padding: 20px;
            }}
        }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h1>AAS Infrastructure API Documentation</h1>
            <p>Infrastructure ID: {infrastructureId}</p>
        </div>
        
        <div class=""content"">
            <div class=""services-grid"">
                <div class=""service-card"">
                    <div class=""badge"">Repository</div>
                    <div class=""service-title"">AAS Repository</div>
                    <div class=""service-description"">
                        Asset Administration Shell Repository für die Verwaltung von AAS-Objekten und deren Lebenszyklus.
                    </div>
                    <a href=""/aas-proxy/{infrastructureId}/swagger/aas-repo"" class=""swagger-link"" target=""_blank"">
                        📄 Swagger Documentation
                    </a>
                </div>
                
                <div class=""service-card"">
                    <div class=""badge"">Registry</div>
                    <div class=""service-title"">AAS Registry</div>
                    <div class=""service-description"">
                        Asset Administration Shell Registry für die Registrierung und Entdeckung von AAS-Instanzen.
                    </div>
                    <a href=""/aas-proxy/{infrastructureId}/swagger/aas-reg"" class=""swagger-link"" target=""_blank"">
                        📄 Swagger Documentation
                    </a>
                </div>
                
                <div class=""service-card"">
                    <div class=""badge"">Repository</div>
                    <div class=""service-title"">Submodel Repository</div>
                    <div class=""service-description"">
                        Submodel Repository für die Verwaltung von Submodel-Objekten und deren Datenstrukturen.
                    </div>
                    <a href=""/aas-proxy/{infrastructureId}/swagger/sm-repo"" class=""swagger-link"" target=""_blank"">
                        📄 Swagger Documentation
                    </a>
                </div>
                
                <div class=""service-card"">
                    <div class=""badge"">Registry</div>
                    <div class=""service-title"">Submodel Registry</div>
                    <div class=""service-description"">
                        Submodel Registry für die Registrierung und Verwaltung von Submodel-Metadaten.
                    </div>
                    <a href=""/aas-proxy/{infrastructureId}/swagger/sm-reg"" class=""swagger-link"" target=""_blank"">
                        📄 Swagger Documentation
                    </a>
                </div>
                
                <div class=""service-card"">
                    <div class=""badge"">Discovery</div>
                    <div class=""service-title"">AAS Discovery</div>
                    <div class=""service-description"">
                        Discovery Service für die Suche und Identifikation von Asset Administration Shells.
                    </div>
                    <a href=""/aas-proxy/{infrastructureId}/swagger/discovery"" class=""swagger-link"" target=""_blank"">
                        📄 Swagger Documentation
                    </a>
                </div>
                
                <div class=""service-card"">
                    <div class=""badge"">Repository</div>
                    <div class=""service-title"">Concept Description Repository</div>
                    <div class=""service-description"">
                        Repository für Concept Descriptions und semantische Definitionen von Datenelementen.
                    </div>
                    <a href=""/aas-proxy/{infrastructureId}/swagger/cd-repo"" class=""swagger-link"" target=""_blank"">
                        📄 Swagger Documentation
                    </a>
                </div>
            </div>
        </div>
        
        <div class=""footer"">
            <p>AAS Infrastructure Documentation Portal | Infrastructure {infrastructureId}</p>
        </div>
    </div>
</body>
</html>";

        return Content(html, "text/html");
    }

    // [HttpGet("{infrastructureId}/{serviceName}/swagger")]
    // public async Task<IActionResult> GetServiceSwagger(long infrastructureId, string serviceName)
    // {
    //     var infrastructure = _context.AasInfrastructureSettings
    //         .FirstOrDefault(i => i.Id == infrastructureId);

    //     if (infrastructure == null)
    //         return NotFound();

    //     try
    //     {
    //         var baseUrl = GetUrlByType(serviceName, infrastructure);
    //         var swaggerUrl = $"{baseUrl}/v3/api-docs";
    //         var response = await _httpClient.GetStringAsync(swaggerUrl);
    //         var swaggerDoc = JsonSerializer.Deserialize<object>(response);

    //         return Ok(swaggerDoc);
    //     }
    //     catch (Exception ex)
    //     {
    //         return StatusCode(503, new { error = ex.Message, service = serviceName });
    //     }
    // }

    #endregion Swagger Proxies


    [HttpGet]
    [Route("aas-repo/{**rest}")]
    [Route("aas-repository/{**rest}")]
    [Route("{infrastructureId}/aas-repo/{**rest}")]
    [Route("{infrastructureId}/aas-repository/{**rest}")]
    [AasDesignerAuthorize(
        RequiredScopes = [ApiScopes.AASX_READ_API, ApiScopes.AASX_WRITE_API],
        RequiredRoles = [
            AuthRoles.VIEWER_NUTZER,
            AuthRoles.BENUTZER,
            AuthRoles.ORGA_ADMIN,
            AuthRoles.SYSTEM_ADMIN,
        ]
    )]
    public Task ProxyCatchAllAasRepository(string rest, long infrastructureId)
    {
        if (HttpContext.Items[AasDesignerConstants.API_KEY] is Apikey apikey)
        {
            AppUser appUser;
            if (apikey.BenutzerId == null)
            {
                appUser = _apiKeyUserResolver.GetAppUserByApikey(apikey, infrastructureId);
            }
            else
            {
                appUser = _apiKeyUserResolver.GetSystemAppUserByApikey(apikey);
            }
            if (infrastructureId == 0)
            {
                infrastructureId = appUser.CurrentInfrastructureSettings.Id;
            }
            return ProxyRoute("aas-repo", rest, infrastructureId);
        }
        return ProxyRoute("aas-repo", rest, infrastructureId);
    }

    [HttpGet]
    [Route("aas-reg/{**rest}")]
    [Route("aas-registry/{**rest}")]
    [Route("{infrastructureId}/aas-reg/{**rest}")]
    [Route("{infrastructureId}/aas-registry/{**rest}")]
    [AasDesignerAuthorize(
        RequiredScopes = [ApiScopes.AASX_READ_API, ApiScopes.AASX_WRITE_API],
        RequiredRoles = [
            AuthRoles.VIEWER_NUTZER,
            AuthRoles.BENUTZER,
            AuthRoles.ORGA_ADMIN,
            AuthRoles.SYSTEM_ADMIN,
        ]
    )]
    public Task ProxyCatchAllAasRegistry(string rest, long infrastructureId)
    {
        if (HttpContext.Items[AasDesignerConstants.API_KEY] is Apikey apikey)
        {
            AppUser appUser;
            if (apikey.BenutzerId == null)
            {
                appUser = _apiKeyUserResolver.GetAppUserByApikey(apikey, infrastructureId);
            }
            else
            {
                appUser = _apiKeyUserResolver.GetSystemAppUserByApikey(apikey);
            }
            if (infrastructureId == 0)
            {
                infrastructureId = appUser.CurrentInfrastructureSettings.Id;
            }
            return ProxyRoute("aas-reg", rest, infrastructureId);
        }
        return ProxyRoute("aas-reg", rest, infrastructureId);
    }

    [HttpGet]
    [Route("sm-repo/{**rest}")]
    [Route("sm-repository/{**rest}")]
    [Route("{infrastructureId}/sm-repo/{**rest}")]
    [Route("{infrastructureId}/sm-repository/{**rest}")]
    [AasDesignerAuthorize(
        RequiredScopes = [ApiScopes.AASX_READ_API, ApiScopes.AASX_WRITE_API],
        RequiredRoles = [
            AuthRoles.VIEWER_NUTZER,
            AuthRoles.BENUTZER,
            AuthRoles.ORGA_ADMIN,
            AuthRoles.SYSTEM_ADMIN,
        ]
    )]
    public Task ProxyCatchAllSmRepository(string rest, long infrastructureId)
    {
        if (HttpContext.Items[AasDesignerConstants.API_KEY] is Apikey apikey)
        {
            AppUser appUser;
            if (apikey.BenutzerId == null)
            {
                appUser = _apiKeyUserResolver.GetAppUserByApikey(apikey, infrastructureId);
            }
            else
            {
                appUser = _apiKeyUserResolver.GetSystemAppUserByApikey(apikey);
            }
            if (infrastructureId == 0)
            {
                infrastructureId = appUser.CurrentInfrastructureSettings.Id;
            }
            return ProxyRoute("sm-repo", rest, infrastructureId);
        }
        return ProxyRoute("sm-repo", rest, infrastructureId);
    }

    [HttpGet]
    [Route("sm-reg/{**rest}")]
    [Route("sm-registry/{**rest}")]
    [Route("{infrastructureId}/sm-reg/{**rest}")]
    [Route("{infrastructureId}/sm-registry/{**rest}")]
    [AasDesignerAuthorize(
        RequiredScopes = [ApiScopes.AASX_READ_API, ApiScopes.AASX_WRITE_API],
        RequiredRoles = [
            AuthRoles.VIEWER_NUTZER,
            AuthRoles.BENUTZER,
            AuthRoles.ORGA_ADMIN,
            AuthRoles.SYSTEM_ADMIN,
        ]
    )]
    public Task ProxyCatchAllSmRegistry(string rest, long infrastructureId)
    {
        if (HttpContext.Items[AasDesignerConstants.API_KEY] is Apikey apikey)
        {
            AppUser appUser;
            if (apikey.BenutzerId == null)
            {
                appUser = _apiKeyUserResolver.GetAppUserByApikey(apikey, infrastructureId);
            }
            else
            {
                appUser = _apiKeyUserResolver.GetSystemAppUserByApikey(apikey);
            }
            if (infrastructureId == 0)
            {
                infrastructureId = appUser.CurrentInfrastructureSettings.Id;
            }
            return ProxyRoute("sm-reg", rest, infrastructureId);
        }
        return ProxyRoute("sm-reg", rest, infrastructureId);
    }

    [HttpGet]
    [Route("cd-repo/{**rest}")]
    [Route("{infrastructureId}/cd-repo/{**rest}")]
    [Route("{infrastructureId}/cd-repository/{**rest}")]
    [AasDesignerAuthorize(
        RequiredScopes = [ApiScopes.AASX_READ_API, ApiScopes.AASX_WRITE_API],
        RequiredRoles = [
            AuthRoles.VIEWER_NUTZER,
            AuthRoles.BENUTZER,
            AuthRoles.ORGA_ADMIN,
            AuthRoles.SYSTEM_ADMIN,
        ]
    )]
    public Task ProxyCatchAllCdRepository(string rest, long infrastructureId)
    {
        if (
            HttpContext.Items[AasDesignerConstants.API_KEY] is Apikey apikey
            && infrastructureId == 0
        )
        {
            AppUser appUser;
            if (apikey.BenutzerId == null)
            {
                appUser = _apiKeyUserResolver.GetAppUserByApikey(apikey, infrastructureId);
            }
            else
            {
                appUser = _apiKeyUserResolver.GetSystemAppUserByApikey(apikey);
            }
            return ProxyRoute("cd-repo", rest, appUser.CurrentInfrastructureSettings.Id);
        }
        return ProxyRoute("cd-repo", rest, infrastructureId);
    }

    [HttpGet]
    [Route("discovery/{**rest}")]
    [Route("aas-discovery/{**rest}")]
    [Route("{infrastructureId}/discovery/{**rest}")]
    [Route("{infrastructureId}/aas-discovery/{**rest}")]
    [AasDesignerAuthorize(
        RequiredScopes = [ApiScopes.AASX_READ_API, ApiScopes.AASX_WRITE_API],
        RequiredRoles = [
            AuthRoles.VIEWER_NUTZER,
            AuthRoles.BENUTZER,
            AuthRoles.ORGA_ADMIN,
            AuthRoles.SYSTEM_ADMIN,
        ]
    )]
    public Task ProxyCatchAllDiscovery(string rest, long infrastructureId)
    {
        if (HttpContext.Items[AasDesignerConstants.API_KEY] is Apikey apikey)
        {
            AppUser appUser;
            if (apikey.BenutzerId == null)
            {
                appUser = _apiKeyUserResolver.GetAppUserByApikey(apikey, infrastructureId);
            }
            else
            {
                appUser = _apiKeyUserResolver.GetSystemAppUserByApikey(apikey);
            }
            if (infrastructureId == 0)
            {
                infrastructureId = appUser.CurrentInfrastructureSettings.Id;
            }
            return ProxyRoute("discovery", rest, infrastructureId);
        }
        return ProxyRoute("discovery", rest, infrastructureId);
    }

    [HttpPost, HttpPut, HttpDelete, HttpPatch]
    [Route("aas-repo/{**rest}")]
    [Route("aas-repository/{**rest}")]
    [Route("{infrastructureId}/aas-repo/{**rest}")]
    [Route("{infrastructureId}/aas-repository/{**rest}")]
    [AasDesignerAuthorize(
        RequiredScopes = [ApiScopes.AASX_WRITE_API],
        RequiredRoles = [
            AuthRoles.VIEWER_NUTZER,
            AuthRoles.BENUTZER,
            AuthRoles.ORGA_ADMIN,
            AuthRoles.SYSTEM_ADMIN,
        ]
    )]
    public Task ProxyCatchAllAasRepositoryWrite(string rest, long infrastructureId)
    {
        if (HttpContext.Items[AasDesignerConstants.API_KEY] is Apikey apikey)
        {
            AppUser appUser;
            if (apikey.BenutzerId == null)
            {
                appUser = _apiKeyUserResolver.GetAppUserByApikey(apikey, infrastructureId);
            }
            else
            {
                appUser = _apiKeyUserResolver.GetSystemAppUserByApikey(apikey);
            }
            if (infrastructureId == 0)
            {
                infrastructureId = appUser.CurrentInfrastructureSettings.Id;
            }
            return ProxyRoute("aas-repo", rest, infrastructureId);
        }
        return ProxyRoute("aas-repo", rest, infrastructureId);
    }

    [HttpPost, HttpPut, HttpDelete, HttpPatch]
    [Route("aas-reg/{**rest}")]
    [Route("aas-registry/{**rest}")]
    [Route("{infrastructureId}/aas-reg/{**rest}")]
    [Route("{infrastructureId}/aas-registry/{**rest}")]
    [AasDesignerAuthorize(
        RequiredScopes = [ApiScopes.AASX_WRITE_API],
        RequiredRoles = [
            AuthRoles.VIEWER_NUTZER,
            AuthRoles.BENUTZER,
            AuthRoles.ORGA_ADMIN,
            AuthRoles.SYSTEM_ADMIN,
        ]
    )]
    public Task ProxyCatchAllAasRegistryWrite(string rest, long infrastructureId)
    {
        if (HttpContext.Items[AasDesignerConstants.API_KEY] is Apikey apikey)
        {
            AppUser appUser;
            if (apikey.BenutzerId == null)
            {
                appUser = _apiKeyUserResolver.GetAppUserByApikey(apikey, infrastructureId);
            }
            else
            {
                appUser = _apiKeyUserResolver.GetSystemAppUserByApikey(apikey);
            }
            if (infrastructureId == 0)
            {
                infrastructureId = appUser.CurrentInfrastructureSettings.Id;
            }
            return ProxyRoute("aas-reg", rest, infrastructureId);
        }
        return ProxyRoute("aas-reg", rest, infrastructureId);
    }

    [HttpPost, HttpPut, HttpDelete, HttpPatch]
    [Route("sm-repo/{**rest}")]
    [Route("sm-repository/{**rest}")]
    [Route("{infrastructureId}/sm-repo/{**rest}")]
    [Route("{infrastructureId}/sm-repository/{**rest}")]
    [AasDesignerAuthorize(
        RequiredScopes = [ApiScopes.AASX_WRITE_API],
        RequiredRoles = [
            AuthRoles.VIEWER_NUTZER,
            AuthRoles.BENUTZER,
            AuthRoles.ORGA_ADMIN,
            AuthRoles.SYSTEM_ADMIN,
        ]
    )]
    public Task ProxyCatchAllSmRepositoryWrite(string rest, long infrastructureId)
    {
        if (HttpContext.Items[AasDesignerConstants.API_KEY] is Apikey apikey)
        {
            AppUser appUser;
            if (apikey.BenutzerId == null)
            {
                appUser = _apiKeyUserResolver.GetAppUserByApikey(apikey, infrastructureId);
            }
            else
            {
                appUser = _apiKeyUserResolver.GetSystemAppUserByApikey(apikey);
            }
            if (infrastructureId == 0)
            {
                infrastructureId = appUser.CurrentInfrastructureSettings.Id;
            }
            return ProxyRoute("sm-repo", rest, infrastructureId);
        }
        return ProxyRoute("sm-repo", rest, infrastructureId);
    }

    [HttpPost, HttpPut, HttpDelete, HttpPatch]
    [Route("sm-reg/{**rest}")]
    [Route("sm-registry/{**rest}")]
    [Route("{infrastructureId}/sm-reg/{**rest}")]
    [Route("{infrastructureId}/sm-registry/{**rest}")]
    [AasDesignerAuthorize(
        RequiredScopes = [ApiScopes.AASX_WRITE_API],
        RequiredRoles = [
            AuthRoles.VIEWER_NUTZER,
            AuthRoles.BENUTZER,
            AuthRoles.ORGA_ADMIN,
            AuthRoles.SYSTEM_ADMIN,
        ]
    )]
    public Task ProxyCatchAllSmRegistryWrite(string rest, long infrastructureId)
    {
        if (HttpContext.Items[AasDesignerConstants.API_KEY] is Apikey apikey)
        {
            AppUser appUser;
            if (apikey.BenutzerId == null)
            {
                appUser = _apiKeyUserResolver.GetAppUserByApikey(apikey, infrastructureId);
            }
            else
            {
                appUser = _apiKeyUserResolver.GetSystemAppUserByApikey(apikey);
            }
            if (infrastructureId == 0)
            {
                infrastructureId = appUser.CurrentInfrastructureSettings.Id;
            }
            return ProxyRoute("sm-reg", rest, infrastructureId);
        }
        return ProxyRoute("sm-reg", rest, infrastructureId);
    }

    [HttpPost, HttpPut, HttpDelete, HttpPatch]
    [Route("cd-repo/{**rest}")]
    [Route("cd-repository/{**rest}")]
    [Route("{infrastructureId}/cd-repo/{**rest}")]
    [Route("{infrastructureId}/cd-repository/{**rest}")]
    [AasDesignerAuthorize(
        RequiredScopes = [ApiScopes.AASX_WRITE_API],
        RequiredRoles = [
            AuthRoles.VIEWER_NUTZER,
            AuthRoles.BENUTZER,
            AuthRoles.ORGA_ADMIN,
            AuthRoles.SYSTEM_ADMIN,
        ]
    )]
    public Task ProxyCatchAllCdRepositoryWrite(string rest, long infrastructureId)
    {
        if (HttpContext.Items[AasDesignerConstants.API_KEY] is Apikey apikey)
        {
            AppUser appUser;
            if (apikey.BenutzerId == null)
            {
                appUser = _apiKeyUserResolver.GetAppUserByApikey(apikey, infrastructureId);
            }
            else
            {
                appUser = _apiKeyUserResolver.GetSystemAppUserByApikey(apikey);
            }
            if (infrastructureId == 0)
            {
                infrastructureId = appUser.CurrentInfrastructureSettings.Id;
            }
            return ProxyRoute("cd-repo", rest, infrastructureId);
        }
        return ProxyRoute("cd-repo", rest, infrastructureId);
    }

    [HttpPost, HttpPut, HttpDelete, HttpPatch]
    [Route("discovery/{**rest}")]
    [Route("aas-discovery/{**rest}")]
    [Route("{infrastructureId}/discovery/{**rest}")]
    [Route("{infrastructureId}/aas-discovery/{**rest}")]
    [AasDesignerAuthorize(
        RequiredScopes = [ApiScopes.AASX_WRITE_API],
        RequiredRoles = [
            AuthRoles.VIEWER_NUTZER,
            AuthRoles.BENUTZER,
            AuthRoles.ORGA_ADMIN,
            AuthRoles.SYSTEM_ADMIN,
        ]
    )]
    public Task ProxyCatchAllDiscoveryWrite(string rest, long infrastructureId)
    {
        if (HttpContext.Items[AasDesignerConstants.API_KEY] is Apikey apikey)
        {
            AppUser appUser;
            if (apikey.BenutzerId == null)
            {
                appUser = _apiKeyUserResolver.GetAppUserByApikey(apikey, infrastructureId);
            }
            else
            {
                appUser = _apiKeyUserResolver.GetSystemAppUserByApikey(apikey);
            }
            if (infrastructureId == 0)
            {
                infrastructureId = appUser.CurrentInfrastructureSettings.Id;
            }
            return ProxyRoute("discovery", rest, infrastructureId);
        }
        return ProxyRoute("discovery", rest, infrastructureId);
    }

    private async Task ProxyRoute(string type, string rest, long infrastructureId)
    {
        var queryString = this.Request.QueryString.Value;
        AppUser? appUser = null;
        AasInfrastructureSettings? infrastructureSettings = null;
        if (HttpContext.Items[AasDesignerConstants.API_KEY] is Apikey apikey)
        {
            if (apikey.BenutzerId == null)
            {
                appUser = _apiKeyUserResolver.GetAppUserByApikey(apikey, infrastructureId);
            }
            else
            {
                appUser = _apiKeyUserResolver.GetSystemAppUserByApikey(apikey);
            }
            if (appUser.CurrentInfrastructureSettings.Id != infrastructureId)
            {
                throw new AppException("INFRASTRUCTURE_NOT_ALLOWED_FOR_THIS_APIKEY");
            }
            infrastructureSettings = _context.AasInfrastructureSettings.FirstOrDefault(i =>
                i.Id == infrastructureId
            );
        }
        else if (HttpContext.Items[AasDesignerConstants.APP_USER] is AppUser resolvedAppUser)
        {
            appUser = resolvedAppUser;
            var currentInfrastructure = resolvedAppUser.CurrentInfrastructureSettings;
            if (infrastructureId == 0)
            {
                infrastructureId = currentInfrastructure.Id;
                _logger.LogInformation(
                    "AAS proxy request {Method} {Path} did not include an infrastructureId in the route. Falling back to the AppUser infrastructure {InfrastructureId}.",
                    HttpContext.Request.Method,
                    HttpContext.Request.Path.Value,
                    infrastructureId
                );
            }

            // TODO: um die Sicherheit zu erhöhen, muss die Infrastruktur ID um die ORGA-ID erweitert werden und hier überprüft werden, ob die Daten aus appUser und übergebene ID zusammenpassen
            infrastructureSettings =
                currentInfrastructure.Id == infrastructureId
                    ? currentInfrastructure
                    : _context.AasInfrastructureSettings.FirstOrDefault(i =>
                        i.Id == infrastructureId
                    );
        }

        if (appUser == null)
        {
            _logger.LogWarning(
                "AAS proxy request {Method} {Path} could not resolve an AppUser. infrastructureId={InfrastructureId}, hasAuthorization={HasAuthorization}, hasOrganisationId={HasOrganisationId}, hasInfrastructureId={HasInfrastructureId}",
                HttpContext.Request.Method,
                HttpContext.Request.Path.Value,
                infrastructureId,
                HttpContext.Request.Headers.ContainsKey("Authorization"),
                HttpContext.Request.Headers.ContainsKey("X-Organisation-ID"),
                HttpContext.Request.Headers.ContainsKey("X-Infrastructure-ID")
            );
            throw new UserNotFoundException();
        }
        if (infrastructureSettings == null)
        {
            _logger.LogWarning(
                "AAS proxy request {Method} {Path} resolved an AppUser but no infrastructure settings for infrastructureId={InfrastructureId}.",
                HttpContext.Request.Method,
                HttpContext.Request.Path.Value,
                infrastructureId
            );
            throw new UserNotFoundException();
        }

        var localTargetUrl = infrastructureSettings.GetResolvedServiceUrl(type);

        var url =
            $"{localTargetUrl.AppendSlash()}{HttpUtility.UrlDecode(rest).Replace("[", "%5B").Replace("]", "%5D")}{queryString}";
        if (IsProxyLoopTarget(url))
        {
            await WriteProxyLoopDetectedAsync(type, infrastructureId, url);
            return;
        }

        _logger.LogInformation(
            "AAS proxy request {Method} type={Type} infrastructureId={InfrastructureId} target={Target}",
            HttpContext.Request.Method,
            type,
            infrastructureId,
            url
        );
        Response.Headers["X-Vws-Proxy-Upstream"] = "1";
        try
        {
            await this.HttpProxyAsync(url);
        }
        catch (HttpRequestException ex)
        {
            await WriteProxyUnavailableAsync(type, infrastructureId, url, ex);
        }
    }

    private async Task ProxyRouteAnonymous(string type, string rest, long infrastructureId)
    {
        var queryString = this.Request.QueryString.Value;
        var infrastructureSettings = _context.AasInfrastructureSettings.FirstOrDefault(i =>
            i.Id == infrastructureId
        );

        if (infrastructureSettings == null)
        {
            throw new ResourceNotFoundException(
                "Infrastructure settings not found for the given ID."
            );
        }

        var localTargetUrl = infrastructureSettings.GetResolvedServiceUrl(type);

        var url =
            $"{localTargetUrl.AppendSlash()}{HttpUtility.UrlDecode(rest).Replace("[", "%5B").Replace("]", "%5D")}{queryString}";
        if (IsProxyLoopTarget(url))
        {
            await WriteProxyLoopDetectedAsync(type, infrastructureId, url);
            return;
        }

        _logger.LogInformation(
            "AAS proxy anonymous request {Method} type={Type} infrastructureId={InfrastructureId} target={Target}",
            HttpContext.Request.Method,
            type,
            infrastructureId,
            url
        );
        Response.Headers["X-Vws-Proxy-Upstream"] = "1";
        try
        {
            await this.HttpProxyAsync(url);
        }
        catch (HttpRequestException ex)
        {
            await WriteProxyUnavailableAsync(type, infrastructureId, url, ex);
        }
    }

    private async Task WriteProxyUnavailableAsync(
        string type,
        long infrastructureId,
        string url,
        HttpRequestException exception
    )
    {
        _logger.LogWarning(
            exception,
            "AAS proxy upstream unavailable for type={Type}, infrastructureId={InfrastructureId}, target={Target}",
            type,
            infrastructureId,
            url
        );

        if (Response.HasStarted)
        {
            return;
        }

        Response.StatusCode = StatusCodes.Status503ServiceUnavailable;
        Response.ContentType = "application/problem+json";

        var response = new
        {
            title = "AAS infrastructure unavailable",
            status = StatusCodes.Status503ServiceUnavailable,
            detail = $"The configured upstream for '{type}' could not be reached. Check whether the target infrastructure is running and reachable.",
            infrastructureId,
            upstream = url,
        };

        await Response.WriteAsync(JsonSerializer.Serialize(response));
    }

    private async Task WriteProxyLoopDetectedAsync(string type, long infrastructureId, string url)
    {
        _logger.LogError(
            "AAS proxy loop detected for type={Type}, infrastructureId={InfrastructureId}, target={Target}",
            type,
            infrastructureId,
            url
        );

        if (Response.HasStarted)
        {
            return;
        }

        Response.StatusCode = StatusCodes.Status508LoopDetected;
        Response.ContentType = "application/problem+json";

        var response = new
        {
            title = "AAS proxy loop detected",
            status = StatusCodes.Status508LoopDetected,
            detail = "The resolved upstream points back to this proxy. Check the stored infrastructure URLs or internal container mapping.",
            infrastructureId,
            upstream = url,
        };

        await Response.WriteAsync(JsonSerializer.Serialize(response));
    }

    private static bool IsProxyLoopTarget(string targetUrl)
    {
        return TryExtractProxyPath(targetUrl, out _);
    }

    private static bool TryExtractProxyPath(string targetUrl, out string proxyPath)
    {
        proxyPath = string.Empty;
        if (string.IsNullOrWhiteSpace(targetUrl))
        {
            return false;
        }

        if (TryMatchProxyPath(targetUrl, out proxyPath))
        {
            return true;
        }

        if (!Uri.TryCreate(targetUrl, UriKind.Absolute, out var targetUri))
        {
            return false;
        }

        return TryMatchProxyPath(targetUri.AbsolutePath, out proxyPath);
    }

    private static bool TryMatchProxyPath(string path, out string proxyPath)
    {
        proxyPath = string.Empty;
        var knownPrefixes = new[] { "/aas-proxy/", "/designer-api/aas-proxy/" };
        var matchedPrefix = knownPrefixes.FirstOrDefault(prefix =>
            path.StartsWith(prefix, StringComparison.OrdinalIgnoreCase)
        );

        if (matchedPrefix == null)
        {
            return false;
        }

        proxyPath = path;
        return true;
    }
}
