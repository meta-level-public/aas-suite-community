using System.Xml;
using System.Xml.Linq;
using AasDesignerModel.Model;

namespace AasDesignerApi.EClass
{
    public static class EClassUtils
    {
        // Determine ECLASS files types
        //
        //

        public enum DataFileType
        {
            Invalid,
            Unknown,
            Units,
            Dictionary,
            Other,
            Mapping,
        };

        public static DataFileType TryGetDataFileType(string fn)
        {
            try
            {
                using (FileStream fileSteam = System.IO.File.OpenRead(fn))
                {
                    return TryGetDataFileType(fileSteam);
                }
            }
            catch
            {
                return DataFileType.Invalid;
            }
        }

        public static DataFileType TryGetDataFileType(Stream stream)
        {
            var res = DataFileType.Other;
            try
            {
                using (XmlReader reader = XmlReader.Create(stream))
                {
                    while (reader.Read())
                    {
                        if (reader.IsStartElement())
                        {
                            if (reader.Name == "unt:eclass_units")
                                res = DataFileType.Units;
                            if (reader.Name == "dic:eclass_dictionary")
                                res = DataFileType.Dictionary;
                            if (reader.Name == "map:eclass_mapping")
                                res = DataFileType.Mapping;
                            break;
                        }
                    }
                }
            }
            catch
            {
                return DataFileType.Invalid;
            }
            ;
            return res;
        }

        public static EClassMetadata GetEClassMetadata(Stream fileStream)
        {
            fileStream.Seek(0, SeekOrigin.Begin);

            EClassMetadata result = new();
            var fileType = EClassUtils.TryGetDataFileType(fileStream);

            if (fileType == DataFileType.Dictionary)
            {
                fileStream.Seek(0, SeekOrigin.Begin);

                var root = XDocument.Load(fileStream);

                XNamespace nsDic = "urn:eclass:xml-schema:dictionary:4.0";
                XNamespace nsHea = "urn:eclass:xml-schema:header:4.0";

                var rootDic = root?.Element(nsDic + "eclass_dictionary");
                if (rootDic != null)
                {
                    var header = rootDic.Element(nsHea + "header");

                    if (header != null)
                    {
                        result = EClassMetadataConverter.ConvertNodeToEclassMetadata(header);
                    }
                }
            }
            else if (fileType == DataFileType.Units)
            {
                fileStream.Seek(0, SeekOrigin.Begin);

                var root = XDocument.Load(fileStream);

                XNamespace nsHea = "urn:eclass:xml-schema:header:4.0";
                XNamespace nsUnt = "urn:eclass:xml-schema:units:4.0";

                var rootDic = root?.Element(nsUnt + "eclass_units");
                if (rootDic != null)
                {
                    var header = rootDic.Element(nsHea + "header");

                    if (header != null)
                    {
                        result = EClassMetadataConverter.ConvertNodeToEclassMetadata(header);
                    }
                }
            }

            return result;
        }

        public static List<EClassClass> GetEClassClasses(
            Stream fileStream,
            string filename,
            EClassMetadata metadata
        )
        {
            fileStream.Seek(0, SeekOrigin.Begin);

            List<EClassClass> result = [];
            var fileType = EClassUtils.TryGetDataFileType(fileStream);

            if (fileType == DataFileType.Dictionary)
            {
                fileStream.Seek(0, SeekOrigin.Begin);

                var root = XDocument.Load(fileStream);

                XNamespace nsDic = "urn:eclass:xml-schema:dictionary:4.0";
                XNamespace nsOnto = "urn:iso:std:iso:is:13584:-32:ed-1:tech:xml-schema:ontoml";

                var rootDic = root?.Element(nsDic + "eclass_dictionary");
                if (rootDic != null)
                {
                    var onto = rootDic.Element(nsOnto + "ontoml");
                    var dict = onto?.Element("dictionary");

                    // LINQ to XML query
                    IEnumerable<XElement>? list1 = dict?.Elements("contained_classes")?.Elements();
                    list1
                        ?.ToList()
                        .ForEach(x =>
                        {
                            result.Add(
                                EclassClassConverter.ConvertNodeToEclassClass(x, filename, metadata)
                            );
                        });
                }
            }

            return result;
        }

        public static List<EClassProperty> GetEClassProperties(
            Stream fileStream,
            string filename,
            EClassMetadata metadata
        )
        {
            fileStream.Seek(0, SeekOrigin.Begin);

            List<EClassProperty> result = [];
            var fileType = TryGetDataFileType(fileStream);

            if (fileType == DataFileType.Dictionary)
            {
                fileStream.Seek(0, SeekOrigin.Begin);

                var root = XDocument.Load(fileStream);

                XNamespace nsDic = "urn:eclass:xml-schema:dictionary:4.0";
                XNamespace nsOnto = "urn:iso:std:iso:is:13584:-32:ed-1:tech:xml-schema:ontoml";

                var rootDic = root?.Element(nsDic + "eclass_dictionary");
                if (rootDic != null)
                {
                    var onto = rootDic.Element(nsOnto + "ontoml");
                    var dict = onto?.Element("dictionary");

                    // LINQ to XML query
                    IEnumerable<XElement>? list1 = dict
                        ?.Elements("contained_properties")
                        ?.Elements();
                    list1
                        ?.ToList()
                        .ForEach(x =>
                        {
                            result.Add(
                                EclassPropertyConverter.ConvertNodeToEclassProperty(
                                    x,
                                    filename,
                                    metadata
                                )
                            );
                        });
                }
            }

            return result;
        }

        public static List<EClassDatatype> GetEClassDatatypes(
            Stream fileStream,
            string filename,
            EClassMetadata metadata
        )
        {
            fileStream.Seek(0, SeekOrigin.Begin);

            List<EClassDatatype> result = [];
            var fileType = TryGetDataFileType(fileStream);

            if (fileType == DataFileType.Dictionary)
            {
                fileStream.Seek(0, SeekOrigin.Begin);

                var root = XDocument.Load(fileStream);

                XNamespace nsDic = "urn:eclass:xml-schema:dictionary:4.0";
                XNamespace nsOnto = "urn:iso:std:iso:is:13584:-32:ed-1:tech:xml-schema:ontoml";

                var rootDic = root?.Element(nsDic + "eclass_dictionary");
                if (rootDic != null)
                {
                    var onto = rootDic.Element(nsOnto + "ontoml");
                    var dict = onto?.Element("dictionary");

                    // LINQ to XML query
                    IEnumerable<XElement>? list1 = dict
                        ?.Elements("contained_datatypes")
                        ?.Elements();
                    list1
                        ?.ToList()
                        .ForEach(x =>
                        {
                            result.Add(
                                EClassDatatypeConverter.ConvertNodeToEclassDatatype(
                                    x,
                                    filename,
                                    metadata
                                )
                            );
                        });
                }
            }

            return result;
        }

        public static List<EClassUnit> GetEClassUnits(
            Stream fileStream,
            string filename,
            EClassMetadata metadata
        )
        {
            fileStream.Seek(0, SeekOrigin.Begin);

            List<EClassUnit> result = [];
            var fileType = TryGetDataFileType(fileStream);

            if (fileType == DataFileType.Units)
            {
                fileStream.Seek(0, SeekOrigin.Begin);

                var root = XDocument.Load(fileStream);

                XNamespace nsDic = "urn:eclass:xml-schema:dictionary:4.0";
                XNamespace nsUnt = "urn:eclass:xml-schema:units:4.0";

                var rootDic = root?.Element(nsUnt + "eclass_units");
                if (rootDic != null)
                {
                    var units = rootDic.Element(nsUnt + "eClassUnitsML");
                    var dict = units?.Element(nsUnt + "eClassUnitSet");

                    // LINQ to XML query
                    IEnumerable<XElement>? list1 = dict?.Elements();
                    list1
                        ?.ToList()
                        .ForEach(x =>
                        {
                            result.Add(
                                EclassUnitConverter.ConvertNodeToEclassUnit(x, filename, metadata)
                            );
                        });
                }
            }

            return result;
        }
    }
}
