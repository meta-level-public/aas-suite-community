using System.Xml.Linq;
using AasDesignerModel.Model;

namespace AasDesignerApi.EClass
{
    public static class EClassDatatypeConverter
    {
        public static EClassDatatype ConvertNodeToEclassDatatype(
            XElement node,
            string filename,
            EClassMetadata metadata
        )
        {
            return new EClassDatatype
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
                Definition = ConverterUtils.GetDictionary(
                    node.Elements("definition").FirstOrDefault()
                ),
                Guid = Guid.Parse(node.Attribute("guid")?.Value ?? string.Empty),
                Irdi = ConverterUtils.GetString(node.Attribute("id")?.Value),
                PreferredName = ConverterUtils.GetDictionary(
                    node.Elements("preferred_name").FirstOrDefault()
                ),
                Revision = ConverterUtils.GetInt(node.Elements("revision").FirstOrDefault()?.Value),
                Status = ConverterUtils.GetInt(node.Elements("status").FirstOrDefault()?.Value),
                NameScope = ConverterUtils.GetString(
                    node.Element("name_scope")?.Attribute("class_ref")?.Value
                ),
                ImportFilename = filename,
                EClassMetadata = metadata,
                TypeDefinition = GetTypeDefinition(
                    node.Element("type_definition"),
                    filename,
                    metadata
                ),
            };
        }

        private static EClassTypeDefinition GetTypeDefinition(
            XElement? node,
            string filename,
            EClassMetadata metadata
        )
        {
            XNamespace xsi = "http://www.w3.org/2001/XMLSchema-instance";
            return new EClassTypeDefinition
            {
                Constraints = GetConstraints(node?.Element("constraints"), filename, metadata),
                Type = ConverterUtils.GetString(node?.Attribute(xsi + "type")?.Value),
            };
        }

        private static List<EClassConstraint> GetConstraints(
            XElement? node,
            string filename,
            EClassMetadata metadata
        )
        {
            XNamespace xsi = "http://www.w3.org/2001/XMLSchema-instance";
            List<EClassConstraint> constraints = [];
            node?.Elements("constraint")
                ?.ToList()
                ?.ForEach(c =>
                {
                    constraints.Add(
                        new EClassConstraint
                        {
                            Subset = GetSubset(c),
                            Type = ConverterUtils.GetString(c.Attribute(xsi + "type")?.Value),
                            ValueMeanings = GetValueMeanings(c.Element("value_meaning")),
                        }
                    );
                });

            return constraints;
        }

        private static List<EClassValueMeaning> GetValueMeanings(XElement? c)
        {
            List<EClassValueMeaning> meanings = [];

            c?.Element("its_values")
                ?.Elements("dic_value")
                .ToList()
                .ForEach(val =>
                {
                    meanings.Add(
                        new EClassValueMeaning
                        {
                            Definition = ConverterUtils.GetDictionary(val.Element("definition")),
                            Irdi = ConverterUtils.GetString(
                                val.Attribute("value_meaning_id")?.Value
                            ),
                            OrderNumber = ConverterUtils.GetInt(
                                val.Attribute("order_number")?.Value
                            ),
                            Guid = Guid.Parse(val.Attribute("guid")?.Value ?? string.Empty),
                            PreferredName = ConverterUtils.GetDictionary(
                                val.Element("preferred_name")
                            ),
                            ValueCode = ConverterUtils.GetString(val.Element("value_code")?.Value),
                            ShortName = ConverterUtils.GetDictionary(val.Element("short_name")),
                        }
                    );
                });

            return meanings;
        }

        private static List<string> GetSubset(XElement c)
        {
            XNamespace val = "urn:iso:std:iso:ts:29002:-10:ed-1:tech:xml-schema:value";
            return c.Element("subset")?.Elements(val + "string_value").Select(v => v.Value).ToList()
                ?? [];
        }
    }
}
