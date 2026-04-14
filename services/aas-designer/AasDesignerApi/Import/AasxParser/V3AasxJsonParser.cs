using System.IO.Packaging;
using Newtonsoft.Json;

namespace AasDesignerApi.Import.AasxParser
{
    public class V3AasxJsonParser : IAasxParser
    {
        public object GetAasxObject(Package package, out List<string> errorMessages)
        {
            AasSchema.Tns.EnvironmentElm? env = null;

            errorMessages = new List<string>();

            using Stream file = AasxParserHelper
                .GetSpecPart(package)
                .GetStream(FileMode.Open, FileAccess.Read);

            using StreamReader reader = new StreamReader(file);
            env = JsonConvert.DeserializeObject<AasSchema.Tns.EnvironmentElm>(
                reader.ReadToEnd(),
                AasxParserHelper.GetJsonsettings()
            );

            if (env == null)
            {
                throw new InvalidOperationException(
                    "Could not deserialize AssetAdministrationShellEnvironment_V2_0"
                );
            }

            return env;
        }
    }
}
