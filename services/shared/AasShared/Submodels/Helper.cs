using BaSyx.Models.Core.AssetAdministrationShell;
using BaSyx.Models.Core.AssetAdministrationShell.Implementations;
using BaSyx.Models.Core.Common;

namespace AasShared.Submodels
{
    public class Helper
    {
        public static void ChangeTypeToInstance(Submodel submodel)
        {
            submodel.Kind = ModelingKind.Instance;
            submodel
                .SubmodelElements.ToList()
                .ForEach(sme =>
                {
                    ((SubmodelElement)sme).Kind = ModelingKind.Instance;
                    if (sme is SubmodelElementCollection)
                    {
                        ChangeTypeToInstance((SubmodelElement)sme);
                    }
                });
        }

        public static void ChangeTypeToInstance(SubmodelElement submodelElement)
        {
            submodelElement.Kind = ModelingKind.Instance;
            if (submodelElement.ModelType == ModelType.SubmodelElementCollection)
            {
                ((SubmodelElementCollection)submodelElement)
                    .ToList()
                    .ForEach(smc =>
                    {
                        ChangeTypeToInstance((SubmodelElement)smc);
                    });
            }
        }

        public static bool HasSemanticId(AasCore.Aas3_1.IHasSemantics element, string semanticId)
        {
            return element.SemanticId?.Keys.Any(s => s.Value.Trim() == semanticId.Trim()) ?? false;
        }
    }
}
