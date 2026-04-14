using System.Globalization;
using System.Xml.Linq;
using AasDesignerModel.Model;

namespace AasDesignerApi.EClass
{
    public static class ConverterUtils
    {
        public static string GetString(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return string.Empty;

            return value;
        }

        public static DateTime? GetDate(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return null;

            var dateFormatString = "yyyy-MM-ddZ";
            CultureInfo provider = CultureInfo.InvariantCulture;

            return DateTime.ParseExact(value, dateFormatString, provider);
        }

        public static DateTime? GetDateTime(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return null;

            var dateFormatString = "yyyy-MM-ddTHH:mm:ss.fffZ";
            CultureInfo provider = CultureInfo.InvariantCulture;

            return DateTime.ParseExact(value, dateFormatString, provider);
        }

        public static int GetInt(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return 0;

            return Int32.Parse(value);
        }

        public static List<EClassDescribedBy> GetDescribedBy(XElement? node)
        {
            if (node == null)
                return [];
            var result = new List<EClassDescribedBy>();

            node.Elements("property")
                .ToList()
                .ForEach(p =>
                {
                    var eclassDescribedBy = new EClassDescribedBy()
                    {
                        Irdi = ConverterUtils.GetString(p.Attribute("property_ref")?.Value),
                        IsDeprecated = Boolean.Parse(
                            p.Attribute("is_deprecated")?.Value ?? "false"
                        ),
                        OrderNumber = ConverterUtils.GetInt(p.Attribute("order_number")?.Value),
                        PreferredNameBlockAspect = ConverterUtils.GetString(
                            p.Elements("preferred_name_block_aspect")?.FirstOrDefault()?.Value
                        ),
                    };
                    result.Add(eclassDescribedBy);
                });

            return result;
        }

        public static EClassDomain GetEClassDomain(XElement? node)
        {
            if (node == null)
                return new EClassDomain();

            XNamespace xsi = "http://www.w3.org/2001/XMLSchema-instance";

            return new EClassDomain
            {
                Quantity = GetString(node.Element("quantity")?.Attribute("quantity_ref")?.Value),
                Unit = GetString(node.Element("unit")?.Attribute("unit_ref")?.Value),
                ReferredType = GetString(
                    node.Element("referred_type")?.Attribute("datatype_ref")?.Value
                ),
                Type = GetString(node.Attribute(xsi + "type")?.Value),
            };
        }

        public static Dictionary<string, string> GetDictionary(XElement? node)
        {
            Dictionary<string, string> dict = [];

            node?.Elements()
                .ToList()
                .ForEach(el =>
                {
                    var key =
                        el.Attribute("language_code")?.Value
                        + "-"
                        + el.Attribute("country_code")?.Value;
                    dict.Add(key, el.Value);
                });

            return dict;
        }

        public static Dictionary<string, string> GetCodelistDictionary(XElement? node)
        {
            Dictionary<string, string> dict = [];
            XNamespace unitsml = "urn:oasis:names:tc:unitsml:schema:xsd:UnitsMLSchema-1.0";

            node?.Elements(unitsml + "CodeListValue")
                .ToList()
                .ForEach(el =>
                {
                    dict.Add(
                        el.Attribute("codeListName")?.Value ?? string.Empty,
                        el.Attribute("unitCodeValue")?.Value ?? string.Empty
                    );
                });

            return dict;
        }

        public static Dictionary<string, string> GetUnitNames(XElement? node)
        {
            Dictionary<string, string> dict = [];
            XNamespace unitsml = "urn:oasis:names:tc:unitsml:schema:xsd:UnitsMLSchema-1.0";

            node?.Elements(unitsml + "UnitName")
                .ToList()
                .ForEach(el =>
                {
                    var key = el.Attributes().FirstOrDefault()?.Value;
                    var value = el.Value ?? string.Empty;
                    if (!string.IsNullOrWhiteSpace(key))
                    {
                        dict.Add(key, value);
                    }
                });

            return dict;
        }
    }
}
