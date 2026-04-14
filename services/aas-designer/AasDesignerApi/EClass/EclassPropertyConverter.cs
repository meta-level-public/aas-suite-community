using System.Xml.Linq;
using AasDesignerModel.Model;

namespace AasDesignerApi.EClass
{
    public static class EclassPropertyConverter
    {
        public static EClassProperty ConvertNodeToEclassProperty(
            XElement node,
            string filename,
            EClassMetadata metadata
        )
        {
            XNamespace xsi = "http://www.w3.org/2001/XMLSchema-instance";

            return new EClassProperty
            {
                DateOfCurrentRevision = ConverterUtils.GetDate(
                    node.Elements("date_of_current_revision").FirstOrDefault()?.Value
                ),
                DateOfCurrentVersion = ConverterUtils.GetDate(
                    node.Elements("date_of_current_version").FirstOrDefault()?.Value
                ),
                DateOfOriginalDefinition = ConverterUtils.GetDate(
                    node.Elements("date_of_original_definition").FirstOrDefault()?.Value
                ),
                Definition = ConverterUtils.GetDictionary(node.Element("definition")),
                Guid = Guid.Parse(node.Attribute("guid")?.Value ?? string.Empty),
                Irdi = ConverterUtils.GetString(node.Attribute("id")?.Value),
                PreferredName = ConverterUtils.GetDictionary(node.Element("preferred_name")),
                ShortName = ConverterUtils.GetDictionary(node.Element("short_name")),
                Revision = ConverterUtils.GetInt(node.Element("revision")?.Value),
                Status = ConverterUtils.GetInt(node.Element("status")?.Value),
                NameScope = ConverterUtils.GetString(
                    node.Element("name_scope")?.Attribute("class_ref")?.Value
                ),
                IsMultivalent = Boolean.Parse(node.Element("is_multivalent")?.Value ?? "false"),
                IsDeprecated = Boolean.Parse(node.Element("is_deprecated")?.Value ?? "false"),
                ObjectType = ConverterUtils.GetString(node.Attribute(xsi + "type")?.Value),
                Domain = ConverterUtils.GetEClassDomain(node.Element("domain")),
                ImportFilename = filename,
                EClassMetadata = metadata,
                SuggestedValueList = Boolean.Parse(
                    node.Elements("suggested_value_list")?.FirstOrDefault()?.Value ?? "false"
                ),
            };
        }
    }
}
