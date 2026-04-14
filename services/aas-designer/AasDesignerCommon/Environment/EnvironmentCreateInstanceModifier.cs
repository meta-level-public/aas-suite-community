using AasCore.Aas3_1;
using AasDesignerCommon.Utils;
using BaSyx.Models.Core.AssetAdministrationShell;

namespace AasDesignerCommon.Shells;

public class EnvironmentCreateInstanceModifier
{
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
                // aas.DerivedFrom = new Reference(ReferenceTypes.ExternalReference, [new Key(KeyTypes.AssetAdministrationShell, aas.Id)]);
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
                // Referenzen auf die Originale AAS erstellen
                aas.DerivedFrom = new Reference(
                    ReferenceTypes.ModelReference,
                    [new Key(KeyTypes.AssetAdministrationShell, aas.Id)]
                );
                aas.AssetInformation.AssetType = aas.AssetInformation.GlobalAssetId;

                // neue Werte setzen
                aas.AssetInformation.GlobalAssetId = IdGenerationUtil.GenerateId(
                    IdType.Asset,
                    targetNamespace
                );
                aas.AssetInformation.AssetKind = AasCore.Aas3_1.AssetKind.Instance;

                // alle SM umschreiben
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
                        // wenn Nameplate, dann Seriennummer setzen

                        if (IsNameplate(sm) == true)
                        {
                            var serialNumberElem = sm.SubmodelElements?.FirstOrDefault(sme =>
                                HasSemanticId(sme, "0112/2///61987#ABA951#009") == true
                            );
                            if (
                                serialNumberElem != null
                                && serialNumberElem is Property serialNumberProperty
                            )
                            {
                                serialNumberProperty.Value = serialNumber;
                            }
                        }
                    }
                });
            });

        return modifications;
    }

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
            "https://admin-shell.io/zvei/nameplate/2/0/Nameplate",
        };

        if (submodel.SemanticId?.Keys.Any(k => nameplateSemanticIds.Contains(k.Value)) ?? false)
        {
            return true;
        }

        return false;
    }
}
