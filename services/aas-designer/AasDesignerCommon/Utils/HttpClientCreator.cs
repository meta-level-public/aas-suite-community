using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography.X509Certificates;
using System.Threading.Tasks;
using AasDesignerApi.Model;

namespace AasDesignerCommon.Utils;

public class HttpClientCreator
{
    public static HttpClient CreateHttpClient(AppUser appUser)
    {
        var client = new HttpClient();
        if (
            appUser.CurrentInfrastructureSettings.Certificate != null
            && appUser.CurrentInfrastructureSettings.Certificate.Length > 0
            && !string.IsNullOrWhiteSpace(appUser.CurrentInfrastructureSettings.CertificatePassword)
        )
        {
            var certificate = X509CertificateLoader.LoadPkcs12(
                appUser.CurrentInfrastructureSettings.Certificate,
                appUser.CurrentInfrastructureSettings.CertificatePassword
            );

            // Create an HttpClientHandler and set the client certificate
            var handler = new HttpClientHandler();
            handler.ClientCertificates.Add(certificate);

            // Create an HttpClient using the handler
            client = new HttpClient(handler);
        }
        if (appUser.CurrentInfrastructureSettings.HeaderParameters.Any())
        {
            appUser
                .CurrentInfrastructureSettings.HeaderParameters.ToList()
                .ForEach(header =>
                {
                    client.DefaultRequestHeaders.Add(header.Name, header.Value);
                });
        }
        if (
            !string.IsNullOrWhiteSpace(appUser.JwtToken)
            && !appUser.CurrentInfrastructureSettings.HeaderParameters.Any(k =>
                k.Name == "Authorization"
            )
        )
        {
            client.DefaultRequestHeaders.Add("Authorization", "Bearer " + appUser.JwtToken);
        }

        client.DefaultRequestHeaders.Add("X-Organisation-ID", appUser.OrganisationId.ToString());
        client.DefaultRequestHeaders.Add(
            "X-Infrastructure-ID",
            appUser.CurrentInfrastructureSettings.Id.ToString()
        );
        return client;
    }
}
