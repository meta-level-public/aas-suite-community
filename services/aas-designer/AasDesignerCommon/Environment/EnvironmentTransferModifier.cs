using AasCore.Aas3_1;
using AasDesignerCommon.Utils;

namespace AasDesignerCommon.Shells;

public class EnvironmentTransferModifier
{
    public static List<EnvironmentModifications> ModifyEnvironment(
        AasCore.Aas3_1.Environment environment,
        string targetNamespace
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
                    }
                });
            });

        return modifications;
    }
}
