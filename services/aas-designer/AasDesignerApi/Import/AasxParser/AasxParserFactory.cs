using System.IO.Packaging;
using System.Xml.Linq;
using BaSyx.Models.Export;
using Newtonsoft.Json;

namespace AasDesignerApi.Import.AasxParser
{
    public class AasxParserFactory
    {
        public static IAasxParser GetAasxParser(string xmlAasxString)
        {
            var doc = XDocument.Parse(xmlAasxString);
            var ns =
                doc.Root?.Name.Namespace
                ?? throw new InvalidOperationException("AASX XML does not contain a root element.");

            if (ns == "https://admin-shell.io/aas/3/0")
            {
                return new V3AasxXmlParser();
            }
            if (ns == "http://www.admin-shell.io/aas/2/0")
            {
                return new V2AasxXmlParser();
            }

            throw new Exception("Unknown AASX version");
        }

        public static IAasxParser GetAasxParser(Package package)
        {
            var exportType = AasxParserHelper.GetExportType(package);
            switch (exportType)
            {
                case ExportType.Xml:
                    return GetAasxXmlParser(package);
                case ExportType.Json:
                    return GetAasxJsonParser(package);
                default:
                    throw new InvalidOperationException(exportType + " not supported");
            }
        }

        private static IAasxParser GetAasxXmlParser(Package package)
        {
            using Stream file = AasxParserHelper
                .GetSpecPart(package)
                .GetStream(FileMode.Open, FileAccess.Read);
            var aasxInputXml = new StreamReader(file).ReadToEnd();
            var doc = XDocument.Parse(aasxInputXml);
            var ns =
                doc.Root?.Name.Namespace
                ?? throw new InvalidOperationException("AASX XML does not contain a root element.");

            if (ns == "https://admin-shell.io/aas/3/0")
            {
                return new V3AasxXmlParser();
            }
            if (ns == "http://www.admin-shell.io/aas/2/0")
            {
                return new V2AasxXmlParser();
            }

            throw new Exception("Unknown AASX version");
        }

        private static IAasxParser GetAasxJsonParser(Package package)
        {
            using Stream file = AasxParserHelper
                .GetSpecPart(package)
                .GetStream(FileMode.Open, FileAccess.Read);
            var aasxInputJson = new StreamReader(file).ReadToEnd();

            object? deserializedSm;
            try
            {
                deserializedSm = JsonConvert.DeserializeObject<EnvironmentSubmodel_V2_0>(
                    aasxInputJson
                );

                if (deserializedSm != null)
                {
                    return new V2AasxJsonParser();
                }
            }
            catch (Exception)
            {
                // Console.WriteLine(e);
            }
            throw new Exception("Unknown AASX version");
        }
    }
}
