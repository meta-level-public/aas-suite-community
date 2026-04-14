using System.IO.Packaging;
using System.Xml;
using System.Xml.Serialization;
using BaSyx.Models.Export;
using Newtonsoft.Json;

namespace AasDesignerApi.Import.AasxParser
{
    public class V2AasxXmlParser : IAasxParser
    {
        public object? GetAasxObject(Package package, out List<string> errorMessages)
        {
            AssetAdministrationShellEnvironment_V2_0? env = null;

            var exportType = AasxParserHelper.GetExportType(package);
            errorMessages = new List<string>();

            switch (exportType)
            {
                case ExportType.Xml:
                    {
                        XmlSerializer serializer = new XmlSerializer(
                            typeof(AssetAdministrationShellEnvironment_V2_0),
                            AssetAdministrationShellEnvironment_V2_0.AAS_NAMESPACE
                        );
                        using Stream file = AasxParserHelper
                            .GetSpecPart(package)
                            .GetStream(FileMode.Open, FileAccess.Read);

                        using XmlReader reader = XmlReader.Create(
                            file,
                            AasxParserHelper.GetXmlsettings(errorMessages)
                        );
                        env = (AssetAdministrationShellEnvironment_V2_0?)
                            serializer.Deserialize(reader);
                    }
                    break;
                case ExportType.Json:
                    {
                        using Stream file = AasxParserHelper
                            .GetSpecPart(package)
                            .GetStream(FileMode.Open, FileAccess.Read);

                        using StreamReader reader = new StreamReader(file);
                        env =
                            JsonConvert.DeserializeObject<AssetAdministrationShellEnvironment_V2_0>(
                                reader.ReadToEnd(),
                                AasxParserHelper.GetJsonsettings()
                            );
                    }
                    break;
                default:
                    throw new InvalidOperationException(exportType + " not supported");
            }

            return env;
        }
    }
}
