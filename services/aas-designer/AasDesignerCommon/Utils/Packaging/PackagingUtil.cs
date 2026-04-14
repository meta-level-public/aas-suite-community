using System.Text.Json.Nodes;
using System.Xml;
using AasCore.Aas3.Package;
using AasDesignerCommon.Packaging.Model;
using AasJsonization = AasCore.Aas3_1.Jsonization;
using AasJsonizationV30 = AasCore.Aas3_0.Jsonization;
using AasXmlization = AasCore.Aas3_1.Xmlization;
using AasXmlizationV30 = AasCore.Aas3_0.Xmlization;

namespace AasDesignerCommon.Packaging
{
    public class PackagingUtil
    {
        public static AasxPackage ReadPackage(MemoryStream ms, bool readContent = true)
        {
            var aasxPackage = new AasxPackage();

            var packaging = new AasCore.Aas3.Package.Packaging();

            using var pkgOrErr = packaging.OpenRead(ms);
            var pkg = pkgOrErr.Must();
            var thumb = pkg.Thumbnail();
            if (thumb != null)
            {
                var thumbFile = new AasxFile()
                {
                    Filename = thumb.Uri.OriginalString.Split('/').Last(),
                    MimeType = thumb.ContentType,
                    AasxPath = thumb.Uri.OriginalString,
                    Content = readContent ? thumb.ReadAllBytes() : null,
                };

                aasxPackage.Thumbnail = thumbFile;
            }
            var specsByContentType = pkg.SpecsByContentType();
            var specs = pkg.Specs();
            specs
                .ToList()
                .ForEach(
                    (specPart) =>
                    {
                        if (specPart.Uri.ToString().EndsWith(".json"))
                        {
                            // Do something with JSON spec
                            CreatePackageJson(specPart, aasxPackage, pkg, readContent);
                        }
                        else
                        {
                            // Do something with XML spec
                            CreatePackageXml(specPart, aasxPackage, pkg, readContent);
                        }
                    }
                );

            return aasxPackage;
        }

        public static void CreatePackageXml(
            Part specPart,
            AasxPackage aasxPackage,
            PackageRead pkg,
            bool readContent
        )
        {
            var xmlContent = specPart.ReadAllText();
            var environment = DeserializeEnvironmentFromXml(xmlContent);
            aasxPackage.Environment = environment;

            foreach (Part suppl in pkg.SupplementariesFor(specPart))
            {
                var aasxFile = new AasxFile()
                {
                    Filename = suppl.Uri.OriginalString.Split('/').Last(),
                    MimeType = suppl.ContentType,
                    AasxPath = suppl.Uri.OriginalString,
                    Content = readContent ? suppl.ReadAllBytes() : null,
                };

                aasxPackage.Files.Add(aasxFile);
            }
        }

        public static void CreatePackageJson(
            Part specPart,
            AasxPackage aasxPackage,
            PackageRead pkg,
            bool readContent
        )
        {
            var jsonContent = specPart.ReadAllText();
            var environment = DeserializeEnvironmentFromJson(jsonContent);
            aasxPackage.Environment = environment;

            foreach (Part suppl in pkg.SupplementariesFor(specPart))
            {
                var aasxFile = new AasxFile()
                {
                    Filename = suppl.Uri.OriginalString.Split('/').Last(),
                    MimeType = suppl.ContentType,
                    AasxPath = suppl.Uri.OriginalString,
                    Content = readContent ? suppl.ReadAllBytes() : null,
                };

                aasxPackage.Files.Add(aasxFile);
            }
        }

        private static AasCore.Aas3_1.Environment DeserializeEnvironmentFromXml(string xmlContent)
        {
            try
            {
                return DeserializeEnvironmentFromXmlV31(xmlContent);
            }
            catch (Exception ex31)
            {
                try
                {
                    var env30 = DeserializeEnvironmentFromXmlV30(xmlContent);
                    return ConvertV30ToV31(env30);
                }
                catch (Exception ex30)
                {
                    throw new InvalidOperationException(
                        "Could not deserialize AASX XML as AAS metamodel 3.1 or 3.0.",
                        new AggregateException(ex31, ex30)
                    );
                }
            }
        }

        private static AasCore.Aas3_1.Environment DeserializeEnvironmentFromJson(string jsonContent)
        {
            try
            {
                var jsonNode =
                    JsonNode.Parse(jsonContent)
                    ?? throw new InvalidOperationException("Could not parse JSON content.");
                return AasJsonization.Deserialize.EnvironmentFrom(jsonNode);
            }
            catch (Exception ex31)
            {
                try
                {
                    var jsonNode =
                        JsonNode.Parse(jsonContent)
                        ?? throw new InvalidOperationException("Could not parse JSON content.");
                    var env30 = AasJsonizationV30.Deserialize.EnvironmentFrom(jsonNode);
                    return ConvertV30ToV31(env30);
                }
                catch (Exception ex30)
                {
                    throw new InvalidOperationException(
                        "Could not deserialize AASX JSON as AAS metamodel 3.1 or 3.0.",
                        new AggregateException(ex31, ex30)
                    );
                }
            }
        }

        private static AasCore.Aas3_1.Environment DeserializeEnvironmentFromXmlV31(
            string xmlContent
        )
        {
            using var stringReader = new StringReader(xmlContent);
            using var xmlReader = XmlReader.Create(
                stringReader,
                new XmlReaderSettings() { CheckCharacters = false }
            );
            xmlReader.MoveToContent();
            return AasXmlization.Deserialize.EnvironmentFrom(xmlReader);
        }

        private static AasCore.Aas3_0.Environment DeserializeEnvironmentFromXmlV30(
            string xmlContent
        )
        {
            using var stringReader = new StringReader(xmlContent);
            using var xmlReader = XmlReader.Create(
                stringReader,
                new XmlReaderSettings() { CheckCharacters = false }
            );
            xmlReader.MoveToContent();
            return AasXmlizationV30.Deserialize.EnvironmentFrom(xmlReader);
        }

        private static AasCore.Aas3_1.Environment ConvertV30ToV31(AasCore.Aas3_0.Environment env30)
        {
            var jsonString = AasJsonizationV30.Serialize.ToJsonObject(env30).ToJsonString();
            var jsonNode =
                JsonNode.Parse(jsonString)
                ?? throw new InvalidOperationException("Could not parse converted v3.0 JSON.");
            return AasJsonization.Deserialize.EnvironmentFrom(jsonNode);
        }
    }
}
