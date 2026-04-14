using System.Xml.Linq;
using AasDesignerModel.Model;

namespace AasDesignerApi.EClass
{
    public static class EclassUnitConverter
    {
        public static EClassUnit ConvertNodeToEclassUnit(
            XElement node,
            string filename,
            EClassMetadata metadata
        )
        {
            XNamespace unitsml = "urn:oasis:names:tc:unitsml:schema:xsd:UnitsMLSchema-1.0";
            XNamespace unt = "urn:eclass:xml-schema:units:4.0";

            var unit = new EClassUnit
            {
                Definition = ConverterUtils.GetDictionary(node.Element("definition")),
                // Irdi = ConverterUtils.GetString(node.Attributes().First()?.Value), // Das geht so nicht, wert muss aus den enthaltenen codelistvalues ermittelt werden
                PreferredName = ConverterUtils.GetDictionary(node.Element(unt + "preferred_name")),
                ShortName = ConverterUtils.GetDictionary(node.Element(unt + "short_name")),
                CodeListValue = ConverterUtils.GetCodelistDictionary(node),
                Name = ConverterUtils.GetUnitNames(node),
                Symbol = ConverterUtils.GetString(node.Element(unitsml + "UnitSymbol")?.Value),
                EClassMetadata = metadata,
            };
            unit.Irdi =
                unit.CodeListValue?.FirstOrDefault(x => x.Key == "IRDI").Value ?? string.Empty;

            return unit;
        }
    }
}
