using System.IO.Packaging;
using System.Xml;
using System.Xml.Schema;
using BaSyx.Models.Export;
using Microsoft.Extensions.FileProviders;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace AasDesignerApi.Import.AasxParser
{
    public static class AasxParserHelper
    {
        private static Uri ORIGIN_URI = new("/aasx/aasx-origin", UriKind.RelativeOrAbsolute);
        private static string ORIGIN_RELATIONSHIP_TYPE =
            "http://admin-shell.io/aasx/relationships/aasx-origin";
        private static string SPEC_RELATIONSHIP_TYPE =
            "http://admin-shell.io/aasx/relationships/aas-spec";

        public static PackagePart GetSpecPart(Package package)
        {
            PackageRelationshipCollection originRelationships = package.GetRelationshipsByType(
                ORIGIN_RELATIONSHIP_TYPE
            );
            var originPart =
                originRelationships
                    .Where(r => r.TargetUri == AasxParserHelper.ORIGIN_URI)
                    .Select(p => package.GetPart(p.TargetUri))
                    .FirstOrDefault()
                ?? throw new InvalidDataException("Invalid Package: no origin part contained!");
            PackageRelationshipCollection specRelationships = originPart.GetRelationshipsByType(
                SPEC_RELATIONSHIP_TYPE
            );
            var specPart =
                specRelationships.Select(s => package.GetPart(s.TargetUri)).FirstOrDefault()
                ?? throw new InvalidDataException("Invalid Package: no spec part contained!");
            return specPart;
        }

        public static ExportType GetExportType(Package package)
        {
            string specFilePath = GetSpecPart(package).Uri.ToString();
            string extension = Path.GetExtension(specFilePath)?.ToLower() ?? string.Empty;

            return extension switch
            {
                ".json" => ExportType.Json,
                ".xml" => ExportType.Xml,
                _ => throw new InvalidDataException(
                    "Invalid Package: neither json nor xml contained!"
                ),
            };
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
