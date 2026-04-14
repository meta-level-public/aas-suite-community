using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using AasDesignerApi.Model;
using AasDesignerCommon.Utils;
using AasDesignerModel.Model;

namespace AasDesignerCommon.Submodels
{
    public class SubmodelLoader
    {
        public static async Task<bool> CheckIfExists(
            AasInfrastructureSettings aasInfrastructureSettings,
            string smIdentifier,
            CancellationToken cancellationToken,
            AppUser appUser
        )
        {
            using var client = HttpClientCreator.CreateHttpClient(appUser);

            var url =
                aasInfrastructureSettings.AasRepositoryUrl.AppendSlash()
                + "submodels/"
                + smIdentifier.ToBase64UrlEncoded(Encoding.UTF8);

            HttpResponseMessage response = await client.GetAsync(url, cancellationToken);

            if (response.StatusCode == HttpStatusCode.NotFound)
            {
                return false;
            }
            else if (response.IsSuccessStatusCode)
            {
                return true;
            }

            throw new Exception($"Request to {url} failed with status code {response.StatusCode}");
        }
    }
}
