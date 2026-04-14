using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AasCore.Aas3_1;
using AasDesignerCommon.Model;
using AasDesignerCommon.Utils;

namespace AasDesignerCommon.Shells
{
    public class CdLoader
    {
        public static ConceptDescription? GetCdFromDescriptor(
            ConceptDescriptionMetadata cdDescriptor,
            string cdEndpoint,
            HttpClient client
        )
        {
            var url =
                cdEndpoint.AppendSlash()
                + "concept-descriptions".AppendSlash()
                + cdDescriptor.Irdi.ToBase64UrlEncoded(Encoding.UTF8);
            return GetSingle(url, client);
        }

        public static ConceptDescription? GetSingle(string url, HttpClient client)
        {
            try
            {
                HttpResponseMessage response = client.GetAsync(url).Result;

                if (!response.IsSuccessStatusCode)
                {
                    return null;
                    // nicht schlimm - kennen wir eben nicht
                }

                var responseContent = response.Content.ReadAsStringAsync().Result;

                var jsonNode = AasJsonNodeParser.Parse(responseContent);

                return Jsonization.Deserialize.ConceptDescriptionFrom(jsonNode);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }

            return null;
        }
    }
}
