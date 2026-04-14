using System.Text;
using AasCore.Aas3_1;
using AasDesignerCommon.Model;

namespace AasDesignerCommon.Utils;

public static class CDsFromAasResolver
{
    public static List<ConceptDescriptionMetadata> GetAllConceptDescriptions(
        AasCore.Aas3_1.Environment env,
        string cdEndpoint
    )
    {
        List<ConceptDescriptionMetadata> cdDescriptions = [];

        env.Submodels?.ForEach(sm =>
        {
            cdEndpoint = cdEndpoint.AppendSlash() + "concept-descriptions";
            if (sm.SubmodelElements != null)
                GetAllCdsRecursively(sm.SubmodelElements, cdDescriptions, cdEndpoint);
            sm.SemanticId?.Keys.ForEach(key =>
            {
                if (!cdDescriptions.Any(cd => cd.Irdi == key.Value))
                {
                    cdDescriptions.Add(
                        new ConceptDescriptionMetadata
                        {
                            Endpoint =
                                cdEndpoint.AppendSlash()
                                + key.Value.ToBase64UrlEncoded(Encoding.UTF8),
                            Irdi = key.Value,
                        }
                    );
                }
            });
        });

        return cdDescriptions;
    }

    private static void GetAllCdsRecursively(
        List<ISubmodelElement> smElements,
        List<ConceptDescriptionMetadata> cdDescriptions,
        string cdEndpoint
    )
    {
        smElements.ForEach(smEl =>
        {
            if (smEl is SubmodelElementCollection submodelElementCollection)
            {
                if (submodelElementCollection.Value != null)
                    GetAllCdsRecursively(
                        submodelElementCollection.Value,
                        cdDescriptions,
                        cdEndpoint
                    );
            }
            if (smEl is SubmodelElementList submodelElementList)
            {
                if (submodelElementList.Value != null)
                    GetAllCdsRecursively(submodelElementList.Value, cdDescriptions, cdEndpoint);
            }
            smEl.SemanticId?.Keys.ForEach(key =>
            {
                if (!cdDescriptions.Any(cd => cd.Irdi == key.Value))
                {
                    cdDescriptions.Add(
                        new ConceptDescriptionMetadata
                        {
                            Endpoint =
                                cdEndpoint.AppendSlash()
                                + key.Value.ToBase64UrlEncoded(Encoding.UTF8),
                            Irdi = key.Value,
                        }
                    );
                }
            });
        });
    }
}
