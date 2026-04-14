using System.IO.Packaging;
using BaSyx.Models.Core.AssetAdministrationShell.Implementations;
using BaSyx.Models.Export;

namespace AasShared.Submodels
{
    public class TechnicalDataManager
    {
        const string TECHNICALDATA_SEMANTIC_ID =
            "https://admin-shell.io/ZVEI/TechnicalData/Submodel/1/2";
        const string CLASSIFICATIONS_SEMANTIC_ID =
            "https://admin-shell.io/ZVEI/TechnicalData/ProductClassifications/1/1";
        const string CLASSIFICATION_SYSTEM_SEMANTIC_ID =
            "https://admin-shell.io/ZVEI/TechnicalData/ProductClassificationSystem/1/1";
        const string CLASSIFICATION_SYSTEM_VERSION_SEMANTIC_ID =
            "https://admin-shell.io/ZVEI/TechnicalData/ClassificationSystemVersion/1/1";
        const string PRODUCT_CLASS = "https://admin-shell.io/ZVEI/TechnicalData/ProductClassId/1/1";

        public static Submodel? CreateEmptyModel()
        {
            Submodel? submodel = null;
            using (
                var aasxTemplate = new AASX(
                    Package.Open(Path.Combine("Service", "Template", "technicalData.aasx"))
                )
            )
            {
                submodel = (Submodel?)
                    aasxTemplate
                        .GetEnvironment_V2_0()
                        .Submodels.FirstOrDefault(sm => sm.IdShort == "TechnicalData");
            }

            return submodel;
        }

        public static AasCore.Aas3_1.SubmodelElementCollection? ExtractClassifications(
            AasCore.Aas3_1.Environment? env
        )
        {
            AasCore.Aas3_1.SubmodelElementCollection? coll = null;

            if (env != null)
            {
                var submodel = env.Submodels?.FirstOrDefault(sm =>
                    sm.IdShort == "TechnicalData"
                    || (
                        sm.SemanticId != null
                        && sm.SemanticId.Keys.Any(k => k.Value == TECHNICALDATA_SEMANTIC_ID)
                    )
                );
                if (submodel != null)
                {
                    try
                    {
                        coll = (AasCore.Aas3_1.SubmodelElementCollection?)
                            submodel.SubmodelElements?.FirstOrDefault(smc =>
                                smc.IdShort == "ProductClassifications"
                                || (
                                    smc.SemanticId != null
                                    && smc.SemanticId.Keys.Any(k =>
                                        k.Value.Trim() == CLASSIFICATIONS_SEMANTIC_ID
                                    )
                                )
                            );
                    }
                    catch
                    {
                        // nothing to do
                    }
                }
            }
            return coll;
        }

        public static string GetClassificationSystem(
            AasCore.Aas3_1.SubmodelElementCollection collection
        )
        {
            var system = string.Empty;

            try
            {
                system =
                    (
                        (AasCore.Aas3_1.Property?)
                            collection.Value?.Find(smc =>
                                smc.IdShort == "ProductClassificationSystem"
                                || (
                                    smc.SemanticId != null
                                    && smc.SemanticId.Keys.Any(k =>
                                        k.Value.Trim() == CLASSIFICATION_SYSTEM_SEMANTIC_ID
                                    )
                                )
                            )
                    )?.Value
                    ?? "";
            }
            catch
            {
                system = string.Empty;
            }
            return system;
        }

        public static string GetCLassificationSystemVersion(
            AasCore.Aas3_1.SubmodelElementCollection collection
        )
        {
            var system = string.Empty;

            try
            {
                system =
                    (
                        (AasCore.Aas3_1.Property?)
                            collection.Value?.Find(smc =>
                                smc.IdShort == "ClassificationSystemVersion"
                                || (
                                    smc.SemanticId != null
                                    && smc.SemanticId.Keys.Any(k =>
                                        k.Value.Trim() == CLASSIFICATION_SYSTEM_VERSION_SEMANTIC_ID
                                    )
                                )
                            )
                    )?.Value
                    ?? "";
            }
            catch
            {
                system = string.Empty;
            }
            return system;
        }

        public static string GetProductClass(AasCore.Aas3_1.SubmodelElementCollection collection)
        {
            var system = string.Empty;

            try
            {
                system =
                    (
                        (AasCore.Aas3_1.Property?)
                            collection.Value?.Find(smc =>
                                smc.IdShort == "ProductClassId"
                                || (
                                    smc.SemanticId != null
                                    && smc.SemanticId.Keys.Any(k => k.Value.Trim() == PRODUCT_CLASS)
                                )
                            )
                    )?.Value
                    ?? "";
            }
            catch
            {
                system = string.Empty;
            }
            return system;
        }
    }
}
