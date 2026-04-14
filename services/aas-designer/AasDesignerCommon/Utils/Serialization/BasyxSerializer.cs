using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using Newtonsoft.Json.Serialization;
using AasJsonization = AasCore.Aas3_1.Jsonization;

namespace AasDesignerCommon.Serialization
{
    public class BasyxSerializer
    {
        public static string Serialize(AasCore.Aas3_1.IClass obj)
        {
            if (obj == null)
            {
                return string.Empty;
            }
            var jsonObject = AasJsonization.Serialize.ToJsonObject(obj);

            return jsonObject.ToString();
        }

        public static string SerializeNewtonsoft(object obj)
        {
            DefaultContractResolver contractResolver = new DefaultContractResolver
            {
                NamingStrategy = new CamelCaseNamingStrategy(),
            };
            var serializerSettings = new JsonSerializerSettings
            {
                ContractResolver = contractResolver,
                Formatting = Formatting.Indented,
                Converters = [new StringEnumConverter()],
                NullValueHandling = NullValueHandling.Ignore,
            };

            return JsonConvert.SerializeObject(obj, serializerSettings);
        }
    }
}
