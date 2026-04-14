using System.IO.Packaging;
using Newtonsoft.Json;

namespace AasDesignerApi.Import.AasxParser
{
    public class V2AasxJsonParser : IAasxParser
    {
        public object GetAasxObject(Package package, out List<string> errorMessages)
        {
            errorMessages = new List<string>();

            using Stream file = AasxParserHelper
                .GetSpecPart(package)
                .GetStream(FileMode.Open, FileAccess.Read);

            using StreamReader reader = new StreamReader(file);
            var aasxJsonString = reader.ReadToEnd();
            var env = JsonConvert.DeserializeObject<AasSchema.Tns.EnvironmentElm>(
                aasxJsonString,
                new JsonSerializerSettings()
                {
                    ContractResolver = new NeverRequiredContractResolver(),
                }
            );
            // try
            // {
            //     DotnetBasyxValidator.ConvertToAssetAdministrationShell(env);
            // }
            // catch (Exception ex)
            // {
            //     return ex.Message;
            // }

            if (env == null)
            {
                throw new InvalidOperationException(
                    "Could not deserialize EnvironmentSubmodel_V2_0"
                );
            }

            return env;
        }
    }
}
