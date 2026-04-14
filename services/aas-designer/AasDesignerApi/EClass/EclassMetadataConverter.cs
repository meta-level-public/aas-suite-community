using System.Xml.Linq;
using AasDesignerModel.Model;

namespace AasDesignerApi.EClass
{
    public static class EClassMetadataConverter
    {
        public static EClassMetadata ConvertNodeToEclassMetadata(XElement node)
        {
            return new EClassMetadata
            {
                Authorisation = ConverterUtils.GetString(
                    node.Elements("authorisation")?.FirstOrDefault()?.Value
                ),
                ContentDate = ConverterUtils.GetDateTime(
                    node.Elements("content_date").FirstOrDefault()?.Value
                ),
                ContentDescription = ConverterUtils.GetString(
                    node.Elements("content_description").FirstOrDefault()?.Value
                ),
                ContentLanguage = ConverterUtils.GetString(
                    node.Elements("content_language")
                        ?.Attributes("language_ref")
                        ?.FirstOrDefault()
                        ?.Value
                ),
                ContentIdentification = ConverterUtils.GetString(
                    node.Elements("content_identification").FirstOrDefault()?.Value
                ),
                Creator = ConverterUtils.GetString(
                    node.Elements("creator").FirstOrDefault()?.Value
                ),
                GenerationDate = ConverterUtils.GetDateTime(
                    node.Elements("generation_date").FirstOrDefault()?.Value
                ),
                GeneratorVersion = ConverterUtils.GetString(
                    node.Elements("generator_version").FirstOrDefault()?.Value
                ),
                OriginatingSystem = ConverterUtils.GetString(
                    node.Elements("originating_system").FirstOrDefault()?.Value
                ),
                SchemaVersion = ConverterUtils.GetString(
                    node.Elements("schema_version").FirstOrDefault()?.Value
                ),
            };
        }
    }
}
