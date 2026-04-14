using System.Security.Cryptography.X509Certificates;
using AasDesignerApi.Model.Configuration;
using AasDesignerModel;
using AasShared.Exceptions;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json.Linq;

namespace AasDesignerApi.Service;

public class EClassProxyService
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<EClassProxyService> _logger;
    private readonly EclassConfiguration _eclassConfig;

    public EClassProxyService(
        ILogger<EClassProxyService> logger,
        IApplicationDbContext context,
        EclassConfiguration eclassConfig
    )
    {
        _context = context;
        _logger = logger;
        _eclassConfig = eclassConfig;
    }

    private HttpClient GetHttpClient(long orgaId)
    {
        var foundCertificate = _context
            .EclassCertificats.Include(e => e.CertificateBlob)
            .FirstOrDefault(e => e.OrganisationId == orgaId && e.Geloescht != true);

        if (foundCertificate == null)
            throw new AppException("NO_ECLASS_CERTIFICATE_FOUND");
        var certificate = X509CertificateLoader.LoadPkcs12(
            foundCertificate.CertificateBlob.Datei,
            password: null
        );

        var handler = new HttpClientHandler();
        handler.ClientCertificates.Add(certificate);
        HttpClient client = new HttpClient(handler);

        return client;
    }

    public async Task<JObject?> GetResult(
        long orgaId,
        string urlPart,
        long limit,
        long offset,
        Dictionary<string, string?> query,
        string language
    )
    {
        // query.Add("release", "LATEST"); // muss das nicht ggf der nutzer mit angeben?
        // query.Add("limit", limit.ToString());
        // query.Add("offset", offset.ToString());
        // query.Add("segmentsOnly", false.ToString());

        var uri = QueryHelpers.AddQueryString($"{_eclassConfig.ApiUrl}{urlPart}", query);
        using (var requestMessage = new HttpRequestMessage(HttpMethod.Get, uri))
        using (var client = GetHttpClient(orgaId))
        {
            requestMessage.Headers.Add("Accept-Language", language);
            requestMessage.Headers.Add("deprecated", "false");

            using var httpResponse = await client.SendAsync(requestMessage);
            if (httpResponse.StatusCode == System.Net.HttpStatusCode.OK)
            {
                var returnValue = await httpResponse.Content.ReadAsStringAsync();
                if (returnValue.StartsWith("<"))
                {
                    _logger.LogError(
                        "Error during EClass Request. "
                            + await httpResponse.Content.ReadAsStringAsync()
                    );
                    throw new AppException("UNKNWON_ECLASS_ERROR");
                }

                return JObject.Parse(returnValue);
            }

            if (httpResponse.StatusCode == System.Net.HttpStatusCode.Unauthorized)
            {
                throw new AppException("ECLASS_REQUEST_NOT_AUTHORIZED");
            }
            if (httpResponse.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return null;
            }
            else
            {
                _logger.LogError(
                    "Error during EClass Request. " + await httpResponse.Content.ReadAsStringAsync()
                );
                throw new AppException("UNKNWON_ECLASS_ERROR");
            }
        }
    }

    public bool HasEclassCert(long orgaId)
    {
        return _context
            .EclassCertificats.Include(e => e.CertificateBlob)
            .Any(e => e.OrganisationId == orgaId && e.Geloescht != true);
    }
}
