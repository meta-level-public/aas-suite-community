using System.Xml.Linq;
using AasDesignerModel.Model;

namespace AasDesignerApi.EClass
{
    public static class EclassClassConverter
    {
        public static EClassClass ConvertNodeToEclassClass(
            XElement node,
            string filename,
            EClassMetadata metadata
        )
        {
            XNamespace xsi = "http://www.w3.org/2001/XMLSchema-instance";

            return new EClassClass
            {
                DateOfCurrentRevision = ConverterUtils.GetDate(
                    node.Element("date_of_current_revision")?.Value
                ),
                DateOfCurrentVersion = ConverterUtils.GetDate(
                    node.Element("date_of_current_version")?.Value
                ),
                DateOfOriginalDefinition = ConverterUtils.GetDate(
                    node.Element("date_of_original_definition")?.Value
                ),
                Definition = ConverterUtils.GetDictionary(node.Element("definition")),
                Guid = Guid.Parse(node.Attribute("guid")?.Value ?? string.Empty),
                HierarchicalPosition = ConverterUtils.GetString(
                    node.Elements("hierarchical_position").FirstOrDefault()?.Value
                ),
                Irdi = ConverterUtils.GetString(node.Attribute("id")?.Value),
                PreferredName = ConverterUtils.GetDictionary(node.Element("preferred_name")),
                ShortName = ConverterUtils.GetDictionary(node.Element("short_name")),
                Revision = ConverterUtils.GetInt(node.Elements("revision").FirstOrDefault()?.Value),
                Status = ConverterUtils.GetInt(node.Elements("status").FirstOrDefault()?.Value),
                Superclass = ConverterUtils.GetString(
                    node.Elements("its_superclass")?.Attributes("class_ref").FirstOrDefault()?.Value
                ),
                DescribedBy = ConverterUtils.GetDescribedBy(
                    node.Elements("described_by").FirstOrDefault()
                ),
                ObjectType = ConverterUtils.GetString(node.Attribute(xsi + "type")?.Value),
                SourceLanguage = ConverterUtils.GetString(
                    node.Elements("source_language")
                        ?.Attributes("language_code")
                        ?.FirstOrDefault()
                        ?.Value
                ),
                ImportFilename = filename,
                IsCaseOf = ConverterUtils.GetString(
                    node.Elements("is_case_of")
                        ?.Elements("class")
                        ?.Attributes("class_ref")
                        ?.FirstOrDefault()
                        ?.Value
                ),
                EClassMetadata = metadata,
            };
        }
    }
}
