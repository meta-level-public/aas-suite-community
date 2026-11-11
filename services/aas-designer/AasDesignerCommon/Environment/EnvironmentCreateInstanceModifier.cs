using System.Globalization;
using AasCore.Aas3_1;
using AasDesignerCommon.Utils;
using BaSyx.Models.Core.AssetAdministrationShell;

namespace AasDesignerCommon.Shells;

public class EnvironmentCreateInstanceModifier
{
    // semantic ID of the IDTA template "Digital Nameplate" 3.0 (IDTA 02006-3-0)
    private const string NameplateV3SemanticId =
        "https://admin-shell.io/idta/nameplate/3/0/Nameplate";

    /// <summary>
    /// Instance-specific nameplate properties with their semantic IDs:
    /// ECLASS IRDIs of Digital Nameplate 3.0 first, then those of 2.0 and the ZVEI nameplate.
    /// </summary>
    private static readonly NameplateProperty SerialNumberProperty = new(
        "SerialNumber",
        DataTypeDefXsd.String,
        "0112/2///61987#ABA951#009",
        "0173-1#02-AAM556#002"
    );
    private static readonly NameplateProperty YearOfConstructionProperty = new(
        "YearOfConstruction",
        DataTypeDefXsd.String,
        "0112/2///61987#ABP000#002",
        "0173-1#02-AAP906#001"
    );
    private static readonly NameplateProperty DateOfManufactureProperty = new(
        "DateOfManufacture",
        DataTypeDefXsd.Date,
        "0112/2///61987#ABB757#007",
        "0173-1#02-AAR972#002"
    );

    public static List<EnvironmentModifications> ModifyEnvironment(
        AasCore.Aas3_1.Environment environment,
        string targetNamespace,
        string serialNumber,
        string dateOfManufacture
    )
    {
        var modifications = new List<EnvironmentModifications>();
        environment
            .AssetAdministrationShells?.ToList()
            .ForEach(aas =>
            {
                var oldAasId = aas.Id;
                aas.Id = IdGenerationUtil.GenerateId(IdType.Aas, targetNamespace);
                modifications.Add(
                    new EnvironmentModifications
                    {
                        Id = oldAasId,
                        NewId = aas.Id,
                        Type = ModificationType.Aas,
                    }
                );
                // the instance is derived from the type AAS it was copied from
                aas.DerivedFrom = new Reference(
                    ReferenceTypes.ModelReference,
                    [new Key(KeyTypes.AssetAdministrationShell, oldAasId)]
                );
                aas.AssetInformation.AssetType = aas.AssetInformation.GlobalAssetId;

                // set new values
                aas.AssetInformation.GlobalAssetId = IdGenerationUtil.GenerateId(
                    IdType.Asset,
                    targetNamespace
                );
                aas.AssetInformation.AssetKind = AasCore.Aas3_1.AssetKind.Instance;

                // rewrite all SMs
                aas.Submodels?.ForEach(smRef =>
                {
                    var smRefKey = smRef.Keys.Find(k => k.Type == KeyTypes.Submodel);
                    var oldSmId = smRefKey?.Value ?? string.Empty;
                    var sm = environment.Submodels?.Find(sm => sm.Id == smRefKey?.Value);
                    if (sm != null && smRefKey != null)
                    {
                        sm.Id = IdGenerationUtil.GenerateId(IdType.Submodel, targetNamespace);
                        smRefKey.Value = sm.Id;
                        modifications.Add(
                            new EnvironmentModifications
                            {
                                Id = oldSmId,
                                NewId = sm.Id,
                                Type = ModificationType.Submodel,
                            }
                        );
                        if (IsNameplate(sm))
                        {
                            WriteInstanceData(sm, serialNumber, dateOfManufacture);
                        }
                    }
                });
            });

        return modifications;
    }

    /// <summary>
    /// Writes serial number, date of manufacture and year of construction into the nameplate.
    /// Missing properties are added with the semantic IDs of the nameplate's version.
    /// </summary>
    private static void WriteInstanceData(
        ISubmodel nameplate,
        string serialNumber,
        string dateOfManufacture
    )
    {
        var isVersion3 = IsNameplateVersion3(nameplate);
        SetPropertyValue(nameplate, SerialNumberProperty, isVersion3, _ => serialNumber);

        // The value carries the user's time zone offset; formatting keeps that offset, so the
        // written date is the calendar date the user picked, not the UTC date
        if (
            !DateTimeOffset.TryParse(
                dateOfManufacture,
                CultureInfo.InvariantCulture,
                DateTimeStyles.AssumeUniversal,
                out var manufactured
            )
        )
        {
            return;
        }

        SetPropertyValue(
            nameplate,
            DateOfManufactureProperty,
            isVersion3,
            valueType =>
                valueType == DataTypeDefXsd.DateTime
                    ? manufactured.ToString("yyyy-MM-ddTHH:mm:sszzz", CultureInfo.InvariantCulture)
                    : manufactured.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture)
        );
        SetPropertyValue(
            nameplate,
            YearOfConstructionProperty,
            isVersion3,
            _ => manufactured.Year.ToString(CultureInfo.InvariantCulture)
        );
    }

    private static void SetPropertyValue(
        ISubmodel nameplate,
        NameplateProperty definition,
        bool isVersion3,
        Func<DataTypeDefXsd, string> value
    )
    {
        var property =
            nameplate
                .SubmodelElements?.OfType<Property>()
                .FirstOrDefault(p => definition.SemanticIds.Any(id => HasSemanticId(p, id)))
            ?? nameplate
                .SubmodelElements?.OfType<Property>()
                .FirstOrDefault(p => p.IdShort == definition.IdShort);

        if (property == null)
        {
            property = new Property(
                definition.ValueType,
                idShort: definition.IdShort,
                semanticId: new Reference(
                    ReferenceTypes.ExternalReference,
                    [
                        new Key(
                            KeyTypes.GlobalReference,
                            isVersion3 ? definition.SemanticIds[0] : definition.SemanticIds[1]
                        ),
                    ]
                )
            );
            nameplate.SubmodelElements ??= [];
            nameplate.SubmodelElements.Add(property);
        }

        property.Value = value(property.ValueType);
    }

    private static bool IsNameplateVersion3(ISubmodel submodel) =>
        submodel.SemanticId?.Keys.Any(k => k.Value.Contains("/3/0")) ?? false;

    private sealed record NameplateProperty(
        string IdShort,
        DataTypeDefXsd ValueType,
        params string[] SemanticIds
    );

    public static bool HasSemanticId(ISubmodelElement submodelElement, string semanticId)
    {
        if (submodelElement.SemanticId?.Keys.Any(k => k.Value == semanticId) ?? false)
        {
            return true;
        }

        return false;
    }

    public static bool IsNameplate(ISubmodel submodel)
    {
        var nameplateSemanticIds = new List<string>
        {
            "https://admin-shell.io/idta/aas/DigitalNameplate/2/0",
            "https://admin-shell.io/idta/aas/DigitalNameplate/3/0",
            NameplateV3SemanticId,
            "https://admin-shell.io/zvei/nameplate/2/0/Nameplate",
        };

        if (submodel.SemanticId?.Keys.Any(k => nameplateSemanticIds.Contains(k.Value)) ?? false)
        {
            return true;
        }

        return false;
    }
}
