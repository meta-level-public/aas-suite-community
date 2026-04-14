using System.IO.Packaging;
using BaSyx.Models.Core.AssetAdministrationShell.Implementations;
using BaSyx.Models.Export;
using Newtonsoft.Json;

namespace AasShared.Submodels
{
    public class NameplateManager
    {
        public static Submodel? CreateEmptyModel()
        {
            Submodel? submodel = null;
            var basePath =
                Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().Location)
                ?? throw new DirectoryNotFoundException(
                    "Assembly directory could not be resolved."
                );
            using (
                AASX aasxTemplate = new AASX(
                    Package.Open(Path.Combine(basePath, "Assets", "Templates", "nameplate_v2.aasx"))
                )
            )
            {
                submodel = (Submodel?)
                    aasxTemplate
                        .GetEnvironment_V2_0()
                        .Submodels.FirstOrDefault(sm => sm.IdShort == "Nameplate");
            }

            if (submodel != null)
            {
                Helper.ChangeTypeToInstance(submodel);
            }

            return submodel;
        }

        public static string ExtractHerstellerFromEnv(AssetAdministrationShellEnvironment_V2_0 env)
        {
            var hersteller = string.Empty;

            var submodel = env
                .EnvironmentSubmodels.FirstOrDefault(sm => sm.IdShort == "Nameplate")
                ?.SubmodelElements;
            if (submodel != null)
            {
                try
                {
                    hersteller =
                        (
                            (MultiLanguageProperty_V2_0?)
                                submodel
                                    .FirstOrDefault(smc =>
                                        smc.submodelElement.IdShort == "ManufacturerName"
                                    )
                                    ?.submodelElement
                        )
                            ?.Value.FirstOrDefault(mlp =>
                                mlp.Language.ToLower() == LangStringValue.DE.ToLower()
                            )
                            ?.Text
                        ?? "";
                }
                catch (InvalidCastException)
                {
                    hersteller =
                        (
                            (Property_V2_0?)
                                submodel
                                    .FirstOrDefault(smc =>
                                        smc.submodelElement.IdShort == "ManufacturerName"
                                    )
                                    ?.submodelElement
                        )?.Value
                        ?? "";
                }
            }

            return hersteller;
        }

        public static string ExtractProduktbezeichnungFromEnv(
            AssetAdministrationShellEnvironment_V2_0 env
        )
        {
            var bezeichung = string.Empty;

            var submodel = env
                .EnvironmentSubmodels.FirstOrDefault(sm => sm.IdShort == "Nameplate")
                ?.SubmodelElements;
            if (submodel != null)
            {
                try
                {
                    bezeichung =
                        (
                            (MultiLanguageProperty_V2_0?)
                                submodel
                                    .FirstOrDefault(smc =>
                                        smc.submodelElement.IdShort
                                        == "ManufacturerProductDesignation"
                                    )
                                    ?.submodelElement
                        )
                            ?.Value.FirstOrDefault(mlp =>
                                mlp.Language.ToLower() == LangStringValue.DE.ToLower()
                            )
                            ?.Text
                        ?? "";
                }
                catch (InvalidCastException)
                {
                    bezeichung =
                        (
                            (Property_V2_0?)
                                submodel
                                    .FirstOrDefault(smc =>
                                        smc.submodelElement.IdShort
                                        == "ManufacturerProductDesignation"
                                    )
                                    ?.submodelElement
                        )?.Value
                        ?? "";
                }
            }

            return bezeichung;
        }

        public static string ExtractProduktfamilieFromEnv(
            AssetAdministrationShellEnvironment_V2_0 env
        )
        {
            var familie = string.Empty;

            var submodel = env
                .EnvironmentSubmodels.FirstOrDefault(sm => sm.IdShort == "Nameplate")
                ?.SubmodelElements;
            if (submodel != null)
            {
                try
                {
                    familie =
                        (
                            (MultiLanguageProperty_V2_0?)
                                submodel
                                    .FirstOrDefault(smc =>
                                        smc.submodelElement.IdShort == "ManufacturerProductFamily"
                                    )
                                    ?.submodelElement
                        )
                            ?.Value.FirstOrDefault(mlp =>
                                mlp.Language.ToLower() == LangStringValue.DE.ToLower()
                            )
                            ?.Text
                        ?? "";
                }
                catch (InvalidCastException)
                {
                    familie =
                        (
                            (Property_V2_0?)
                                submodel
                                    .FirstOrDefault(smc =>
                                        smc.submodelElement.IdShort == "ManufacturerProductFamily"
                                    )
                                    ?.submodelElement
                        )?.Value
                        ?? "";
                }
            }

            return familie;
        }

        public static string ExtractSeriennummerFromEnv(
            AssetAdministrationShellEnvironment_V2_0 env
        )
        {
            var seriennr = string.Empty;

            var submodel = env
                .EnvironmentSubmodels.FirstOrDefault(sm => sm.IdShort == "Nameplate")
                ?.SubmodelElements;
            if (submodel != null)
            {
                seriennr =
                    (
                        (Property_V2_0?)
                            submodel
                                .FirstOrDefault(smc =>
                                    smc.submodelElement.IdShort == "SerialNumber"
                                )
                                ?.submodelElement
                    )?.Value
                    ?? "";
            }

            return seriennr;
        }

        public static string ExtractHerstellerFromEnv(AasCore.Aas3_1.Environment? env)
        {
            return ExtractNameFromEnv(env, "ManufacturerName");
        }

        public static string ExtractProduktbezeichnungNameFromEnv(AasCore.Aas3_1.Environment? env)
        {
            return ExtractNameFromEnv(env, "ManufacturerProductDesignation");
        }

        public static string ExtractProduktfamilieNameFromEnv(AasCore.Aas3_1.Environment? env)
        {
            return ExtractNameFromEnv(env, "ManufacturerProductFamily");
        }

        public static string ExtractProduktfamilieValuesFromEnv(AasCore.Aas3_1.Environment? env)
        {
            var familie = string.Empty;
            if (env != null)
            {
                var submodel = env
                    .Submodels?.FirstOrDefault(sm =>
                        sm.IdShort == "Nameplate"
                        || Helper.HasSemanticId(
                            sm,
                            "https://admin-shell.io/zvei/nameplate/2/0/Nameplate"
                        )
                        || Helper.HasSemanticId(
                            sm,
                            "https://admin-shell.io/idta/nameplate/3/0/Nameplate"
                        )
                    )
                    ?.SubmodelElements;

                if (submodel != null)
                {
                    try
                    {
                        var familieMlpValues = (
                            (AasCore.Aas3_1.MultiLanguageProperty?)
                                submodel.FirstOrDefault(smc =>
                                    smc.IdShort == "ManufacturerProductFamily"
                                )
                        )?.Value;
                        if (familieMlpValues != null)
                        {
                            return JsonConvert.SerializeObject(familieMlpValues);
                        }
                        else
                        {
                            return string.Empty;
                        }
                    }
                    catch
                    {
                        familie = string.Empty;
                    }
                }
            }
            return familie;
        }

        public static string ExtractProduktstammNameFromEnv(AasCore.Aas3_1.Environment? env)
        {
            return ExtractNameFromEnv(env, "ManufacturerProductRoot");
        }

        public static string ExtractNameFromEnv(
            AasCore.Aas3_1.Environment? env,
            string propertyName
        )
        {
            var root = string.Empty;

            if (env != null)
            {
                var submodel = env
                    .Submodels?.FirstOrDefault(sm =>
                        sm.IdShort == "Nameplate"
                        || Helper.HasSemanticId(
                            sm,
                            "https://admin-shell.io/zvei/nameplate/2/0/Nameplate"
                        )
                        || Helper.HasSemanticId(
                            sm,
                            "https://admin-shell.io/idta/nameplate/3/0/Nameplate"
                        )
                    )
                    ?.SubmodelElements;

                if (submodel != null)
                {
                    try
                    {
                        root =
                            (
                                (AasCore.Aas3_1.MultiLanguageProperty?)
                                    submodel.FirstOrDefault(smc => smc.IdShort == propertyName)
                            )
                                ?.Value?.FirstOrDefault(mlp =>
                                    mlp.Language.ToLower() == LangStringValue.EN.ToLower()
                                )
                                ?.Text
                            ?? "";
                        if (string.IsNullOrEmpty(root))
                        {
                            root =
                                (
                                    (AasCore.Aas3_1.MultiLanguageProperty?)
                                        submodel.FirstOrDefault(smc => smc.IdShort == propertyName)
                                )
                                    ?.Value?.FirstOrDefault()
                                    ?.Text
                                ?? "";
                        }
                    }
                    catch
                    {
                        root = string.Empty;
                    }
                }
            }
            return root;
        }

        public static string ExtractValuesFromEnv(
            AasCore.Aas3_1.Environment? env,
            string propertyName
        )
        {
            var name = string.Empty;
            if (env != null)
            {
                var submodel = env
                    .Submodels?.FirstOrDefault(sm =>
                        sm.IdShort == "Nameplate"
                        || Helper.HasSemanticId(
                            sm,
                            "https://admin-shell.io/zvei/nameplate/2/0/Nameplate"
                        )
                        || Helper.HasSemanticId(
                            sm,
                            "https://admin-shell.io/idta/nameplate/3/0/Nameplate"
                        )
                    )
                    ?.SubmodelElements;

                if (submodel != null)
                {
                    try
                    {
                        var mlpValues = (
                            (AasCore.Aas3_1.MultiLanguageProperty?)
                                submodel.FirstOrDefault(smc => smc.IdShort == propertyName)
                        )?.Value;
                        if (mlpValues != null)
                        {
                            return JsonConvert.SerializeObject(mlpValues);
                        }
                        else
                        {
                            return string.Empty;
                        }
                    }
                    catch
                    {
                        name = string.Empty;
                    }
                }
            }
            return name;
        }

        public static string ExtractProduktstammValuesFromEnv(AasCore.Aas3_1.Environment? env)
        {
            return ExtractValuesFromEnv(env, "ManufacturerProductRoot");
        }

        public static string ExtractProduktbezeichnungValuesFromEnv(AasCore.Aas3_1.Environment? env)
        {
            return ExtractValuesFromEnv(env, "ManufacturerProductDesignation");
        }

        public static string ExtractSeriennummerFromEnv(AasCore.Aas3_1.Environment? env)
        {
            var seriennr = string.Empty;

            if (env != null)
            {
                var submodel = env
                    .Submodels?.FirstOrDefault(sm =>
                        sm.IdShort == "Nameplate"
                        || Helper.HasSemanticId(
                            sm,
                            "https://admin-shell.io/zvei/nameplate/2/0/Nameplate"
                        )
                        || Helper.HasSemanticId(
                            sm,
                            "https://admin-shell.io/idta/nameplate/3/0/Nameplate"
                        )
                    )
                    ?.SubmodelElements;

                if (submodel != null)
                {
                    try
                    {
                        seriennr =
                            (
                                (AasCore.Aas3_1.Property?)
                                    submodel.FirstOrDefault(smc =>
                                        smc.IdShort == "SerialNumber"
                                        || (
                                            smc.SemanticId != null
                                            && smc.SemanticId.Keys.Any(k =>
                                                k.Value.Trim() == "0173-1#02-AAM556#002"
                                            )
                                        )
                                    )
                            )?.Value
                            ?? "";
                    }
                    catch
                    {
                        seriennr = string.Empty;
                    }
                }
            }
            return seriennr;
        }

        public static AasCore.Aas3_1.MultiLanguageProperty? ExtractProductArticleNumber(
            AasCore.Aas3_1.Environment? env
        )
        {
            AasCore.Aas3_1.MultiLanguageProperty? seriennr = null;

            if (env != null)
            {
                var submodel = env
                    .Submodels?.FirstOrDefault(sm =>
                        sm.IdShort == "Nameplate"
                        || Helper.HasSemanticId(
                            sm,
                            "https://admin-shell.io/zvei/nameplate/2/0/Nameplate"
                        )
                        || Helper.HasSemanticId(
                            sm,
                            "https://admin-shell.io/idta/nameplate/3/0/Nameplate"
                        )
                    )
                    ?.SubmodelElements;
                if (submodel != null)
                {
                    try
                    {
                        seriennr = (AasCore.Aas3_1.MultiLanguageProperty?)
                            submodel.FirstOrDefault(smc =>
                                smc.IdShort == "ProductArticleNumberOfManufacturer"
                                || (
                                    smc.SemanticId != null
                                    && smc.SemanticId.Keys.Any(k =>
                                        k.Value.Trim() == "0173-1#02-AAO676#003"
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
            return seriennr;
        }
    }
}
