using System.IO.Packaging;
using System.Xml;
using System.Xml.Schema;
using System.Xml.Serialization;
using BaSyx.Models.Export;
using Microsoft.Extensions.FileProviders;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace AasShared.Import
{
    public class AasxImporter
    {
        private static PackagePart GetSpecPart(Package package)
        {
            PackageRelationshipCollection originRelationships = package.GetRelationshipsByType(
                AASX.ORIGIN_RELATIONSHIP_TYPE
            );
            var originPart = originRelationships
                ?.Where(r => r.TargetUri == AASX.ORIGIN_URI)
                ?.Select(p => package.GetPart(p.TargetUri))
                ?.FirstOrDefault();
            if (originPart == null)
            {
                originPart = package.CreatePart(
                    AASX.ORIGIN_URI,
                    System.Net.Mime.MediaTypeNames.Text.Plain,
                    CompressionOption.Maximum
                );
                originPart.GetStream(FileMode.Create).Dispose();
                package.CreateRelationship(
                    originPart.Uri,
                    TargetMode.Internal,
                    AASX.ORIGIN_RELATIONSHIP_TYPE
                );
            }

            PackageRelationshipCollection specRelationships = originPart.GetRelationshipsByType(
                AASX.SPEC_RELATIONSHIP_TYPE
            );
            var specPart = specRelationships
                ?.Select(s => package.GetPart(s.TargetUri))
                ?.FirstOrDefault();

            return specPart
                ?? throw new InvalidDataException("Invalid Package: no specification part found.");
        }

        private static ExportType GetExportType(Package package)
        {
            string specFilePath = GetSpecPart(package).Uri.ToString();
            string extension = Path.GetExtension(specFilePath).ToLowerInvariant();

            switch (extension)
            {
                case ".json":
                    return ExportType.Json;
                case ".xml":
                    return ExportType.Xml;
                default:
                    throw new InvalidDataException(
                        "Invalid Package: neither json nor xml contained!"
                    );
            }
        }

        public static JsonSerializerSettings GetJsonsettings()
        {
            var JsonSettings = new JsonSerializerSettings()
            {
                Formatting = Newtonsoft.Json.Formatting.Indented,
                DefaultValueHandling = DefaultValueHandling.Include,
                NullValueHandling = NullValueHandling.Ignore,
            };
            JsonSettings.Converters.Add(new StringEnumConverter());

            return JsonSettings;
        }

        public static XmlReaderSettings GetXmlsettings(List<string> errorMessages)
        {
            var fileProvider = new ManifestEmbeddedFileProvider(
                typeof(AssetAdministrationShellEnvironment_V2_0).Assembly,
                Path.Combine("aas-spec-v2.0", "Resources")
            );

            var XmlSettings = new XmlReaderSettings { ValidationType = ValidationType.Schema };
            XmlSettings.ValidationFlags |= XmlSchemaValidationFlags.ProcessInlineSchema;
            XmlSettings.ValidationFlags |= XmlSchemaValidationFlags.ProcessSchemaLocation;
            XmlSettings.ValidationFlags |= XmlSchemaValidationFlags.ReportValidationWarnings;
            XmlSettings.ValidationEventHandler += (sender, e) =>
                ValidationCallback(errorMessages, e);

            using (
                var stream = fileProvider
                    .GetFileInfo(AssetAdministrationShellEnvironment_V2_0.AAS_XSD_FILENAME)
                    .CreateReadStream()
            )
                XmlSettings.Schemas.Add(
                    AssetAdministrationShellEnvironment_V2_0.AAS_NAMESPACE,
                    XmlReader.Create(stream)
                );

            using (
                var stream = fileProvider
                    .GetFileInfo(AssetAdministrationShellEnvironment_V2_0.IEC61360_XSD_FILENAME)
                    .CreateReadStream()
            )
                XmlSettings.Schemas.Add(
                    AssetAdministrationShellEnvironment_V2_0.IEC61360_NAMESPACE,
                    XmlReader.Create(stream)
                );

            using (
                var stream = fileProvider
                    .GetFileInfo(AssetAdministrationShellEnvironment_V2_0.ABAC_XSD_FILENAME)
                    .CreateReadStream()
            )
                XmlSettings.Schemas.Add(
                    AssetAdministrationShellEnvironment_V2_0.ABAC_NAMESPACE,
                    XmlReader.Create(stream)
                );
            return XmlSettings;
        }

        public static AssetAdministrationShellEnvironment_V2_0 GetEnvironmenMl(
            Package package,
            out List<string> errorMessages
        )
        {
            AssetAdministrationShellEnvironment_V2_0? env = null;

            var exportType = GetExportType(package);
            errorMessages = new List<string>();

            switch (exportType)
            {
                case ExportType.Xml:
                    {
                        XmlSerializer serializer = new XmlSerializer(
                            typeof(AssetAdministrationShellEnvironment_V2_0),
                            AssetAdministrationShellEnvironment_V2_0.AAS_NAMESPACE
                        );
                        using Stream file = GetSpecPart(package)
                            .GetStream(FileMode.Open, FileAccess.Read);

                        using XmlReader reader = XmlReader.Create(
                            file,
                            GetXmlsettings(errorMessages)
                        );
                        env =
                            serializer.Deserialize(reader)
                            as AssetAdministrationShellEnvironment_V2_0;
                    }
                    break;
                case ExportType.Json:
                    {
                        using Stream file = GetSpecPart(package)
                            .GetStream(FileMode.Open, FileAccess.Read);

                        using StreamReader reader = new StreamReader(file);
                        env =
                            JsonConvert.DeserializeObject<AssetAdministrationShellEnvironment_V2_0>(
                                reader.ReadToEnd(),
                                GetJsonsettings()
                            );
                    }
                    break;
                default:
                    throw new InvalidOperationException(exportType + " not supported");
            }

            return env
                ?? throw new InvalidDataException(
                    "Invalid Package: specification could not be deserialized."
                );
        }

        private static void ValidationCallback(object errorMessages, ValidationEventArgs args)
        {
            if (args.Severity == XmlSeverityType.Warning)
            {
                (errorMessages as List<string>)?.Add("Validation warning: " + args.Message);
                Console.WriteLine("Validation warning: " + args.Message);
                // logger.LogWarning("Validation warning: " + args.Message);
            }
            else
            {
                (errorMessages as List<string>)?.Add(
                    "Validation error: "
                        + args.Message
                        + " | LineNumber: "
                        + args.Exception.LineNumber
                        + " | LinePosition: "
                        + args.Exception.LinePosition
                );

                Console.WriteLine(
                    "Validation error: "
                        + args.Message
                        + " | LineNumber: "
                        + args.Exception.LineNumber
                        + " | LinePosition: "
                        + args.Exception.LinePosition
                );
                // logger.LogError("Validation error: " + args.Message + " | LineNumber: " + args.Exception.LineNumber + " | LinePosition: " + args.Exception.LinePosition);

                // _userValidationCallback?.Invoke(args);
            }
        }
    }
}
