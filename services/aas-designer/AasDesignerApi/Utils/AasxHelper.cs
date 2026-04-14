using System.IO.Packaging;
using System.Text.Json.Nodes;
using System.Xml.Linq;
using AasDesignerApi.Import.AasxParser;
using AasDesignerApi.Model;
using AasDesignerApi.Packaging;
using AasDesignerCommon.Packaging;
using BaSyx.Models.Export;
using Newtonsoft.Json;

namespace AasDesignerApi.Utils
{
    public class AasxHelper
    {
        public static AasMetamodelVersion GetAasMetamodelVersion(Package package)
        {
            {
                var exportType = AasxParserHelper.GetExportType(package);
                switch (exportType)
                {
                    case ExportType.Xml:
                        return GetAasxXmlVersion(package);
                    case ExportType.Json:
                        return GetAasxJsonVersion(package);
                    default:
                        throw new InvalidOperationException(exportType + " not supported");
                }
            }
        }

        public static AasMetamodelVersion GetAasxXmlVersion(Package package)
        {
            using Stream file = AasxParserHelper
                .GetSpecPart(package)
                .GetStream(FileMode.Open, FileAccess.Read);
            var aasxInputXml = new StreamReader(file).ReadToEnd();
            var doc = XDocument.Parse(aasxInputXml);
            var ns = doc.Root?.Name.Namespace;

            if (ns == "https://admin-shell.io/aas/3/0" || ns == "http://www.admin-shell.io/aas/1/0") // TODO: wieder entfernen, aber die demo-datei des package-explorers is faul ...
            {
                return AasMetamodelVersion.V3;
            }
            if (ns == "http://www.admin-shell.io/aas/2/0")
            {
                return AasMetamodelVersion.V2;
            }

            throw new Exception("Unknown AASX version");
        }

        public static List<Dictionary<string, string>> GetAasIds(
            MemoryStream ms,
            AASXPackager packager
        )
        {
            _ = packager;
            var result = new List<Dictionary<string, string>>();
            var aasxPackage = PackagingUtil.ReadPackage(ms, true);

            var env = aasxPackage.Environment;
            foreach (var aas in env?.AssetAdministrationShells ?? [])
            {
                var aasId = aas.Id;
                result.Add(
                    new Dictionary<string, string>
                    {
                        { aasId, aas.AssetInformation.GlobalAssetId ?? string.Empty },
                    }
                );
            }

            return result;
        }

        private static AasMetamodelVersion GetAasxJsonVersion(Package package)
        {
            using Stream file = AasxParserHelper
                .GetSpecPart(package)
                .GetStream(FileMode.Open, FileAccess.Read);
            var aasxInputJson = new StreamReader(file).ReadToEnd();

            object? deserializedSm;
            try
            {
                var jsonNode =
                    JsonNode.Parse(aasxInputJson ?? string.Empty)
                    ?? throw new Exception("Could not parse JSON");

                AasCore.Aas3_1.Environment? environment = null;
                // De-serialize from the JSON node
                environment = AasCore.Aas3_1.Jsonization.Deserialize.EnvironmentFrom(jsonNode);

                if (environment != null)
                {
                    return AasMetamodelVersion.V3;
                }
            }
            catch (Exception)
            {
                // ignoreren und schauen ob es als V2 gelesen werden kann
            }

            try
            {
                deserializedSm = JsonConvert.DeserializeObject<EnvironmentSubmodel_V2_0>(
                    aasxInputJson ?? string.Empty
                );

                if (deserializedSm != null)
                {
                    return AasMetamodelVersion.V2;
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
            // TODO: weitere Versionen ermitteln
            throw new Exception("Unknown AASX version");
        }
    }
}
