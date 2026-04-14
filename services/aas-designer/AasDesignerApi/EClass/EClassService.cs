using System.Text.RegularExpressions;
using AasCore.Aas3_1;
using AasDesignerApi.Model;
using AasDesignerModel;
using AasDesignerModel.Model;
using Microsoft.EntityFrameworkCore;

namespace AasDesignerApi.EClass
{
    public class EClassService
    {
        private readonly IApplicationDbContext _context;

        public EClassService(IApplicationDbContext context)
        {
            _context = context;
        }

        public List<TechnicalPropertyCandidate> GetEclassPropertyCandidates(
            Model.AppUser benutzer,
            string version,
            string classification,
            long orgaId
        )
        {
            var properties = new List<TechnicalPropertyCandidate>();
            var eclassMetadataIds = _context
                .Organisations.FirstOrDefault(o => o.Id == orgaId)
                ?.OwnedEclassData.Select(e => e.Id);
            if (eclassMetadataIds == null)
                return properties;

            var eclassClass = _context
                .EClassClasses.Where(c =>
                    c.HierarchicalPosition == classification
                    && eclassMetadataIds.Contains(c.EClassMetadataId)
                )
                .Include(c => c.DescribedBy)
                .FirstOrDefault();
            if (eclassClass == null)
                return properties;

            var relatedClasses = _context
                .EClassClasses.Where(c => c.IsCaseOf == eclassClass.Irdi)
                .Include(c => c.DescribedBy)
                .ToList();
            relatedClasses.ForEach(c =>
            {
                c.DescribedBy.ForEach(d =>
                {
                    var prop = _context.EClassProperties.Where(p => p.Irdi == d.Irdi).First();
                    if (!properties.Exists(p => p.Irdi == prop.Irdi))
                    {
                        properties.Add(
                            new TechnicalPropertyCandidate
                            {
                                AspectBlock = d.PreferredNameBlockAspect,
                                Irdi = d.Irdi,
                                OrderNumber = d.OrderNumber,
                                Definition = prop.Definition,
                                PreferredName = prop.PreferredName,
                                HasValueList = prop.SuggestedValueList,
                                Source = GetSource(c),
                            }
                        );
                    }
                });
            });

            return properties;
        }

        public string GetSource(EClassClass c)
        {
            if (c.Irdi.ToLower().Contains("---basic"))
                return "Basic";
            if (c.Irdi.ToLower().Contains("---asset"))
                return "Asset";
            if (c.Irdi.ToLower().Contains("---advanced"))
                return "Advanced";

            return string.Empty;
        }

        public List<string> GenerateProperties(
            Model.Benutzer benutzer,
            List<string> irids,
            long orgaId
        )
        {
            List<string> properties = [];
            var eclassMetadataIds = _context
                .Organisations.FirstOrDefault(o => o.Id == orgaId)
                ?.OwnedEclassData.Select(e => e.Id);
            if (eclassMetadataIds == null)
                return properties;

            irids.ForEach(irdi =>
            {
                var eclassProp = _context
                    .EClassProperties.Include(p => p.Domain)
                    .FirstOrDefault(p =>
                        p.Irdi == irdi && eclassMetadataIds.Contains(p.EClassMetadataId)
                    );
                if (eclassProp == null)
                    return;

                var xsDatatype = GetXsDataType(eclassProp.Domain);
                var iecDatatype = GetIecDataType(eclassProp.Domain);
                var keys = new List<IKey>() { new Key(KeyTypes.GlobalReference, irdi) };
                var referredType = eclassProp.Domain?.ReferredType;
                var datatype =
                    referredType == null
                        ? null
                        : _context
                            .EClassDatatypes.Include(d => d.TypeDefinition)
                                .ThenInclude(td => td.Constraints)
                            .FirstOrDefault(d => d.Irdi == referredType);

                var unit = GetUnit(eclassProp.Domain?.Unit);
                var dataSpecContent = new DataSpecificationIec61360(
                    CreatePreferredName(eclassProp.PreferredName)
                )
                {
                    DataType = iecDatatype,
                    Unit = unit?.PreferredName.FirstOrDefault().Value ?? string.Empty,
                    Symbol = unit?.Symbol ?? string.Empty,
                    Definition = GetDefinition(eclassProp),
                    ShortName = GetShortName(eclassProp),
                };
                if (dataSpecContent.ShortName.Count == 0)
                {
                    dataSpecContent.ShortName = null;
                }
                if (datatype != null)
                {
                    dataSpecContent.ValueList = CreateValueList(datatype);
                }
                // var dataSpec = new EmbeddedDataSpecification(dataSpecContent);
                // var prop = new Property(xsDatatype)
                // {
                //     Description = CreateDescription(eclassProp.Definition),
                //     DisplayName = CreateDisplayName(eclassProp.PreferredName),
                //     IdShort = CreateIdShort(eclassProp.PreferredName.FirstOrDefault().Value),
                //     SemanticId = new Reference(ReferenceTypes.ExternalReference, keys),
                //     EmbeddedDataSpecifications = [dataSpec],
                // };

                // properties.Add(Jsonization.Serialize.ToJsonObject(prop).ToString());
            });

            return properties;
        }

        private List<ILangStringDefinitionTypeIec61360> GetDefinition(EClassProperty eclassProp)
        {
            return eclassProp
                .Definition.Select(def =>
                    new LangStringDefinitionTypeIec61360(GetLanguage(def.Key), def.Value)
                    as ILangStringDefinitionTypeIec61360
                )
                .ToList();
        }

        private List<ILangStringShortNameTypeIec61360> GetShortName(EClassProperty eclassProp)
        {
            return eclassProp
                .ShortName.Select(def =>
                    new LangStringShortNameTypeIec61360(GetLanguage(def.Key), def.Value)
                    as ILangStringShortNameTypeIec61360
                )
                .ToList();
        }

        private List<ILangStringTextType> CreateDescription(Dictionary<string, string> definition)
        {
            return definition
                .Select(def =>
                    new LangStringTextType(GetLanguage(def.Key), def.Value) as ILangStringTextType
                )
                .ToList();
        }

        private List<ILangStringNameType> CreateDisplayName(
            Dictionary<string, string> preferredName
        )
        {
            return preferredName
                .Select(def =>
                    new LangStringNameType(GetLanguage(def.Key), def.Value) as ILangStringNameType
                )
                .ToList();
        }

        private List<ILangStringPreferredNameTypeIec61360> CreatePreferredName(
            Dictionary<string, string> preferredName
        )
        {
            return preferredName
                .Select(def =>
                    new LangStringPreferredNameTypeIec61360(GetLanguage(def.Key), def.Value)
                    as ILangStringPreferredNameTypeIec61360
                )
                .ToList();
        }

        private static string CreateIdShort(string? s)
        {
            if (s == null)
                return string.Empty;
            s = new string(
                s.Select((c, i) => i == 0 || char.IsWhiteSpace(s[i - 1]) ? char.ToUpper(c) : c)
                    .ToArray()
            );
            s = string.Concat(s.Where(c => !Char.IsWhiteSpace(c)));

            s = s.Replace("ä", "ae");
            s = s.Replace("Ä", "Ae");
            s = s.Replace("ö", "oe");
            s = s.Replace("Ö", "Oe");
            s = s.Replace("ü", "ue");
            s = s.Replace("Ü", "Ue");
            s = s.Replace("ß", "ss");

            Regex rgx = new Regex("[^a-zA-Z0-9_]");
            s = rgx.Replace(s, "");

            return s;
        }

        private IValueList CreateValueList(EClassDatatype datatype)
        {
            List<IValueReferencePair> valueReferencePairs = [];

            var constraint = datatype.TypeDefinition.Constraints?.FirstOrDefault();

            constraint
                ?.Subset.ToList()
                .ForEach(sub =>
                {
                    var indx = constraint.Subset.IndexOf(sub);
                    if (constraint.ValueMeanings.Count >= indx + 1)
                    {
                        var meaning = constraint.ValueMeanings[indx];
                        ValueReferencePair valueReferencePair = new(
                            sub,
                            CreateValueIdRef(meaning.Irdi)
                        );
                        valueReferencePairs.Add(valueReferencePair);
                    }
                    else
                    {
                        ValueReferencePair valueReferencePair = new(sub, CreateValueIdRef(sub));
                        valueReferencePairs.Add(valueReferencePair);
                    }
                });
            IValueList valueList = new ValueList(valueReferencePairs);
            return valueList;
        }

        private EClassUnit? GetUnit(string? irdi)
        {
            return irdi != null ? _context.EClassUnits.FirstOrDefault(u => u.Irdi == irdi) : null;
        }

        private IReference CreateValueIdRef(string id)
        {
            return new Reference(
                ReferenceTypes.ExternalReference,
                [new Key(KeyTypes.GlobalReference, id)]
            );
        }

        private DataTypeDefXsd GetXsDataType(EClassDomain? domain)
        {
            if (domain == null)
                return DataTypeDefXsd.String;
            if (domain.Type == "ontoml:NAMED_TYPE_Type")
            {
                var datatype = _context
                    .EClassDatatypes.Include(d => d.TypeDefinition)
                    .FirstOrDefault(d => d.Irdi == domain.ReferredType);
                return GetXsDataType(datatype?.TypeDefinition.Type ?? string.Empty);
            }
            else
            {
                return GetXsDataType(domain.Type);
            }
        }

        private DataTypeDefXsd GetXsDataType(string ontomlType)
        {
            return ontomlType switch
            {
                //ontoml:RATIONAL_TYPE_Type
                //ontoml:LEVEL_TYPE_Type
                //ontoml:CLASS_REFERENCE_TYPE_Type
                // ontoml:REAL_CURRENCY_TYPE_Type
                // ontoml:RATIONAL_MEASURE_TYPE_Type
                // ontoml:FILE_TYPE_Type
                // ontoml:AXIS1_PLACEMENT_TYPE_Type
                "ontoml:TIME_DATA_TYPE_Type" => DataTypeDefXsd.Time,
                "ontoml:URI_TYPE_Type" => DataTypeDefXsd.AnyUri,
                "ontoml:TRANSLATABLE_STRING_TYPE_Type" => DataTypeDefXsd.String,
                "ontoml:DATE_DATA_TYPE_Type" => DataTypeDefXsd.Date,
                "ontoml:DATE_TIME_DATA_TYPE_Type" => DataTypeDefXsd.DateTime,
                "ontoml:INT_MEASURE_TYPE_Type" => DataTypeDefXsd.Int,
                "ontoml:REAL_MEASURE_TYPE_Type" => DataTypeDefXsd.Double,
                "ontoml:REAL_TYPE_Type" => DataTypeDefXsd.Double,
                "ontoml:INT_TYPE_Type" => DataTypeDefXsd.Int,
                "ontoml:STRING_TYPE_Type" => DataTypeDefXsd.String,
                _ => DataTypeDefXsd.String,
            };
        }

        private DataTypeIec61360 GetIecDataType(EClassDomain? domain)
        {
            if (domain == null)
                return DataTypeIec61360.String;
            if (domain.Type == "ontoml:NAMED_TYPE_Type")
            {
                var datatype = _context
                    .EClassDatatypes.Include(d => d.TypeDefinition)
                    .FirstOrDefault(d => d.Irdi == domain.ReferredType);
                return GetIecDataType(datatype?.TypeDefinition.Type ?? string.Empty);
            }
            else
            {
                return GetIecDataType(domain.Type);
            }
        }

        private DataTypeIec61360 GetIecDataType(string ontomlType)
        {
            return ontomlType switch
            {
                "ontoml:RATIONAL_TYPE_Type" => DataTypeIec61360.Rational,
                // "ontoml:LEVEL_TYPE_Type" =>
                // "ontoml:CLASS_REFERENCE_TYPE_Type"
                "ontoml:REAL_CURRENCY_TYPE_Type" => DataTypeIec61360.RealCurrency,
                "ontoml:RATIONAL_MEASURE_TYPE_Type" => DataTypeIec61360.RationalMeasure,
                "ontoml:FILE_TYPE_Type" => DataTypeIec61360.File,
                // "ontoml:AXIS1_PLACEMENT_TYPE_Type"
                "ontoml:TIME_DATA_TYPE_Type" => DataTypeIec61360.Time,
                // "ontoml:URI_TYPE_Type" =>
                "ontoml:TRANSLATABLE_STRING_TYPE_Type" => DataTypeIec61360.StringTranslatable,
                "ontoml:DATE_DATA_TYPE_Type" => DataTypeIec61360.Date,
                "ontoml:DATE_TIME_DATA_TYPE_Type" => DataTypeIec61360.Timestamp,
                "ontoml:INT_MEASURE_TYPE_Type" => DataTypeIec61360.IntegerMeasure,
                "ontoml:REAL_MEASURE_TYPE_Type" => DataTypeIec61360.RealMeasure,
                "ontoml:REAL_TYPE_Type" => DataTypeIec61360.RealCount,
                "ontoml:INT_TYPE_Type" => DataTypeIec61360.IntegerCount,
                "ontoml:STRING_TYPE_Type" => DataTypeIec61360.String,
                _ => DataTypeIec61360.String,
            };
        }

        public bool HasEclassImported(AppUser benutzer)
        {
            var eclassOrga = _context
                .Organisations.Include(o => o.OwnedEclassData)
                .FirstOrDefault(o => o.Id == benutzer.OrganisationId);
            return eclassOrga?.OwnedEclassData.Count > 0;
        }

        public string GetLanguage(string languageKey)
        {
            return languageKey.Split("-")[0];
        }

        public List<string> GetValuelistInfo(string irdi)
        {
            var eclassProp = _context
                .EClassProperties.Include(p => p.Domain)
                .FirstOrDefault(d => d.Irdi == irdi);
            if (eclassProp?.Domain != null)
            {
                var datatype = _context
                    .EClassDatatypes.Include(d => d.TypeDefinition)
                        .ThenInclude(td => td.Constraints)
                    .FirstOrDefault(d => d.Irdi == eclassProp.Domain.ReferredType);
                var constraint = datatype?.TypeDefinition.Constraints?.FirstOrDefault();
                return constraint?.Subset ?? [];
            }
            return [];
        }

        public List<EClassProperty> FindProperties(Model.Benutzer user, string irdi, long orgaId)
        {
            var eclassMetadataIds = _context
                .Organisations.FirstOrDefault(o => o.Id == orgaId)
                ?.OwnedEclassData.Select(e => e.Id);
            if (eclassMetadataIds == null)
                return [];

            return _context
                .EClassProperties.Where(d =>
                    d.Irdi.Contains(irdi) && eclassMetadataIds.Contains(d.EClassMetadataId)
                )
                .ToList();
        }
    }
}
