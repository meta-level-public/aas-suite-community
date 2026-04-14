using System.IO.Packaging;
using AasShared.Model;
using BaSyx.Models.Core.AssetAdministrationShell.Identification;
using BaSyx.Models.Core.AssetAdministrationShell.Implementations;
using BaSyx.Models.Export;

namespace AasShared.Submodels
{
    public class AddressManager
    {
        public static SubmodelElementCollection? CreateAddressCollection()
        {
            SubmodelElementCollection? addressCollection = null;
            var basePath =
                Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().Location)
                ?? throw new DirectoryNotFoundException(
                    "Assembly directory could not be resolved."
                );
            using (
                AASX aasxTemplate = new AASX(
                    Package.Open(Path.Combine(basePath, "Assets", "Templates", "nameplate.aasx"))
                )
            )
            {
                addressCollection = (SubmodelElementCollection?)
                    aasxTemplate
                        .GetEnvironment_V2_0()
                        .Submodels.FirstOrDefault(sm => sm.IdShort == "Nameplate")
                        ?.SubmodelElements.FirstOrDefault(sme => sme.IdShort == "Address");
            }

            // fallback
            if (addressCollection == null)
            {
                new SubmodelElementCollection("Address")
                {
                    SemanticId = new Reference(
                        new Key(
                            KeyElements.ConceptDescription,
                            KeyType.IRDI,
                            IrdiValue.ADDRESS,
                            true
                        )
                    ),
                    Value =
                    {
                        new Property<string>("NationalCode", "")
                        {
                            SemanticId = new Reference(
                                new Key(
                                    KeyElements.ConceptDescription,
                                    KeyType.IRDI,
                                    IrdiValue.ADDRESS_COUNTRY_CODE,
                                    true
                                )
                            ),
                        },
                        new Property<string>("Street", "")
                        {
                            SemanticId = new Reference(
                                new Key(
                                    KeyElements.ConceptDescription,
                                    KeyType.IRDI,
                                    IrdiValue.ADDRESS_STREET,
                                    true
                                )
                            ),
                        },
                        new Property<string>("Zipcode", "")
                        {
                            SemanticId = new Reference(
                                new Key(
                                    KeyElements.ConceptDescription,
                                    KeyType.IRDI,
                                    IrdiValue.ADDRESS_ZIP,
                                    true
                                )
                            ),
                        },
                        new Property<string>("CityTown", "")
                        {
                            SemanticId = new Reference(
                                new Key(
                                    KeyElements.ConceptDescription,
                                    KeyType.IRDI,
                                    IrdiValue.ADDRESS_CITY_TOWN,
                                    true
                                )
                            ),
                        },
                        new Property<string>("StateCounty", "")
                        {
                            SemanticId = new Reference(
                                new Key(
                                    KeyElements.ConceptDescription,
                                    KeyType.IRDI,
                                    IrdiValue.ADDRESS_STATE_COUNTY,
                                    true
                                )
                            ),
                        },
                    },
                };
            }
            return addressCollection;
        }

        public static Adresse ExtractAddressFromEnv(AssetAdministrationShellEnvironment_V2_0 env)
        {
            var adresse = new Adresse();
            try
            {
                var submodel = (SubmodelElementCollection_V2_0?)
                    env
                        .EnvironmentSubmodels.FirstOrDefault(sm => sm.IdShort == "Nameplate")
                        ?.SubmodelElements.FirstOrDefault(sme =>
                            sme.submodelElement.IdShort == "Address"
                        )
                        ?.submodelElement;
                if (submodel == null)
                    submodel = (SubmodelElementCollection_V2_0?)
                        env
                            .EnvironmentSubmodels.FirstOrDefault(sm => sm.IdShort == "Nameplate")
                            ?.SubmodelElements.FirstOrDefault(sme =>
                                sme.submodelElement.IdShort == "ContactInformation"
                            )
                            ?.submodelElement;
                if (submodel == null)
                    submodel = (SubmodelElementCollection_V2_0?)
                        env
                            .EnvironmentSubmodels.FirstOrDefault(sm => sm.IdShort == "Nameplate")
                            ?.SubmodelElements.FirstOrDefault(sme =>
                                sme.submodelElement.IdShort == "PhysicalAddress"
                            )
                            ?.submodelElement;
                if (submodel != null)
                {
                    try
                    {
                        adresse.Strasse =
                            (
                                (MultiLanguageProperty_V2_0?)
                                    submodel
                                        .Value?.FirstOrDefault(smc =>
                                            smc.submodelElement.IdShort == "Street"
                                        )
                                        ?.submodelElement
                            )
                                ?.Value.FirstOrDefault(mlp =>
                                    mlp.Language.ToLower() == LangStringValue.DE.ToLower()
                                )
                                ?.Text
                            ?? "";
                    }
                    catch
                    {
                        adresse.Strasse =
                            (
                                (Property_V2_0?)
                                    submodel
                                        .Value?.FirstOrDefault(smc =>
                                            smc.submodelElement.IdShort == "Street"
                                        )
                                        ?.submodelElement
                            )?.Value
                            ?? "";
                    }
                    try
                    {
                        adresse.Plz =
                            (
                                (MultiLanguageProperty_V2_0?)
                                    submodel
                                        .Value?.FirstOrDefault(smc =>
                                            smc.submodelElement.IdShort == "Zipcode"
                                        )
                                        ?.submodelElement
                            )
                                ?.Value.FirstOrDefault(mlp =>
                                    mlp.Language.ToLower() == LangStringValue.DE.ToLower()
                                )
                                ?.Text
                            ?? "";
                    }
                    catch
                    {
                        adresse.Plz =
                            (
                                (Property_V2_0?)
                                    submodel
                                        .Value?.FirstOrDefault(smc =>
                                            smc.submodelElement.IdShort == "Zipcode"
                                        )
                                        ?.submodelElement
                            )?.Value
                            ?? "";
                    }
                    if (string.IsNullOrEmpty(adresse.Plz))
                    {
                        adresse.Plz =
                            (
                                (Property_V2_0?)
                                    submodel
                                        .Value?.FirstOrDefault(smc =>
                                            smc.submodelElement.IdShort == "PostalCode"
                                        )
                                        ?.submodelElement
                            )?.Value
                            ?? "";
                    }
                    try
                    {
                        adresse.Ort =
                            (
                                (MultiLanguageProperty_V2_0?)
                                    submodel
                                        .Value?.FirstOrDefault(smc =>
                                            smc.submodelElement.IdShort == "CityTown"
                                        )
                                        ?.submodelElement
                            )
                                ?.Value.FirstOrDefault(mlp =>
                                    mlp.Language.ToLower() == LangStringValue.DE.ToLower()
                                )
                                ?.Text
                            ?? "";
                    }
                    catch
                    {
                        adresse.Ort =
                            (
                                (Property_V2_0?)
                                    submodel
                                        .Value?.FirstOrDefault(smc =>
                                            smc.submodelElement.IdShort == "CityTown"
                                        )
                                        ?.submodelElement
                            )?.Value
                            ?? "";
                    }
                    if (string.IsNullOrEmpty(adresse.Ort))
                    {
                        adresse.Ort =
                            (
                                (Property_V2_0?)
                                    submodel
                                        .Value?.FirstOrDefault(smc =>
                                            smc.submodelElement.IdShort == "City"
                                        )
                                        ?.submodelElement
                            )?.Value
                            ?? "";
                    }
                    try
                    {
                        adresse.Bundesland =
                            (
                                (MultiLanguageProperty_V2_0?)
                                    submodel
                                        .Value?.FirstOrDefault(smc =>
                                            smc.submodelElement.IdShort == "StateCounty"
                                        )
                                        ?.submodelElement
                            )
                                ?.Value.FirstOrDefault(mlp =>
                                    mlp.Language.ToLower() == LangStringValue.DE.ToLower()
                                )
                                ?.Text
                            ?? "";
                    }
                    catch
                    {
                        adresse.Bundesland =
                            (
                                (Property_V2_0?)
                                    submodel
                                        .Value?.FirstOrDefault(smc =>
                                            smc.submodelElement.IdShort == "StateCounty"
                                        )
                                        ?.submodelElement
                            )?.Value
                            ?? "";
                    }
                    try
                    {
                        adresse.LaenderCode =
                            (
                                (MultiLanguageProperty_V2_0?)
                                    submodel
                                        .Value?.FirstOrDefault(smc =>
                                            smc.submodelElement.IdShort == "NationalCode"
                                        )
                                        ?.submodelElement
                            )
                                ?.Value.FirstOrDefault(mlp =>
                                    mlp.Language.ToLower() == LangStringValue.DE.ToLower()
                                )
                                ?.Text
                            ?? "";
                    }
                    catch
                    {
                        adresse.LaenderCode =
                            (
                                (Property_V2_0?)
                                    submodel
                                        .Value?.FirstOrDefault(smc =>
                                            smc.submodelElement.IdShort == "NationalCode"
                                        )
                                        ?.submodelElement
                            )?.Value
                            ?? "";
                    }
                    if (string.IsNullOrEmpty(adresse.Plz))
                    {
                        adresse.LaenderCode =
                            (
                                (Property_V2_0?)
                                    submodel
                                        .Value?.FirstOrDefault(smc =>
                                            smc.submodelElement.IdShort == "CountryCode"
                                        )
                                        ?.submodelElement
                            )?.Value
                            ?? "";
                    }
                }
                try
                {
                    var nameElement = (MultiLanguageProperty_V2_0?)
                        env
                            .EnvironmentSubmodels.FirstOrDefault(sm => sm.IdShort == "Nameplate")
                            ?.SubmodelElements.FirstOrDefault(sme =>
                                sme.submodelElement.IdShort == "ManufacturerName"
                            )
                            ?.submodelElement;
                    adresse.Name =
                        nameElement
                            ?.Value.FirstOrDefault(mlp =>
                                mlp.Language.ToLower() == LangStringValue.DE.ToLower()
                            )
                            ?.Text
                        ?? "";
                }
                catch
                {
                    var nameElement = (Property_V2_0?)
                        env
                            .EnvironmentSubmodels.FirstOrDefault(sm => sm.IdShort == "Nameplate")
                            ?.SubmodelElements.FirstOrDefault(sme =>
                                sme.submodelElement.IdShort == "ManufacturerName"
                            )
                            ?.submodelElement;
                    adresse.Name = nameElement?.Value ?? "";
                }
            }
            catch
            {
                /* ignore errors */
            }

            return adresse;
        }

        public static Adresse ExtractAddressFromEnv(AasCore.Aas3_1.Environment? env)
        {
            var adresse = new Adresse();
            if (env != null)
            {
                try
                {
                    var submodel = env
                        .Submodels?.FirstOrDefault(sm => sm.IdShort == "Nameplate")
                        ?.SubmodelElements;
                    if (submodel != null)
                    {
                        var contactInformation = (AasCore.Aas3_1.SubmodelElementCollection?)
                            submodel.FirstOrDefault(sme => sme.IdShort == "ContactInformation");

                        if (contactInformation != null)
                        {
                            try
                            {
                                adresse.Strasse =
                                    (
                                        (AasCore.Aas3_1.MultiLanguageProperty?)
                                            contactInformation.Value?.FirstOrDefault(smc =>
                                                smc.IdShort == "Street"
                                            )
                                    )
                                        ?.Value?.FirstOrDefault(mlp =>
                                            mlp.Language.ToLower() == LangStringValue.DE.ToLower()
                                        )
                                        ?.Text
                                    ?? "";
                                if (String.IsNullOrEmpty(adresse.Strasse))
                                {
                                    adresse.Ort =
                                        (
                                            (AasCore.Aas3_1.MultiLanguageProperty?)
                                                contactInformation.Value?.FirstOrDefault(smc =>
                                                    smc.IdShort == "Street"
                                                )
                                        )
                                            ?.Value?.FirstOrDefault(mlp =>
                                                mlp.Language.ToLower()
                                                == LangStringValue.EN.ToLower()
                                            )
                                            ?.Text
                                        ?? "";
                                }
                                if (String.IsNullOrEmpty(adresse.Strasse))
                                {
                                    adresse.Ort =
                                        (
                                            (AasCore.Aas3_1.MultiLanguageProperty?)
                                                contactInformation.Value?.FirstOrDefault(smc =>
                                                    smc.IdShort == "Street"
                                                )
                                        )
                                            ?.Value?.FirstOrDefault()
                                            ?.Text
                                        ?? "";
                                }
                            }
                            catch
                            {
                                adresse.Strasse = string.Empty;
                            }
                            try
                            {
                                adresse.Plz =
                                    (
                                        (AasCore.Aas3_1.MultiLanguageProperty?)
                                            contactInformation.Value?.FirstOrDefault(smc =>
                                                smc.IdShort == "Zipcode"
                                            )
                                    )
                                        ?.Value?.FirstOrDefault(mlp =>
                                            mlp.Language.ToLower() == LangStringValue.DE.ToLower()
                                        )
                                        ?.Text
                                    ?? "";
                                if (String.IsNullOrEmpty(adresse.Plz))
                                {
                                    adresse.Plz =
                                        (
                                            (AasCore.Aas3_1.MultiLanguageProperty?)
                                                contactInformation.Value?.FirstOrDefault(smc =>
                                                    smc.IdShort == "Zipcode"
                                                )
                                        )
                                            ?.Value?.FirstOrDefault(mlp =>
                                                mlp.Language.ToLower()
                                                == LangStringValue.EN.ToLower()
                                            )
                                            ?.Text
                                        ?? "";
                                }
                                if (String.IsNullOrEmpty(adresse.Plz))
                                {
                                    adresse.Plz =
                                        (
                                            (AasCore.Aas3_1.MultiLanguageProperty?)
                                                contactInformation.Value?.FirstOrDefault(smc =>
                                                    smc.IdShort == "Zipcode"
                                                )
                                        )
                                            ?.Value?.FirstOrDefault()
                                            ?.Text
                                        ?? "";
                                }
                            }
                            catch
                            {
                                adresse.Plz = string.Empty;
                            }
                            try
                            {
                                adresse.Ort =
                                    (
                                        (AasCore.Aas3_1.MultiLanguageProperty?)
                                            contactInformation.Value?.FirstOrDefault(smc =>
                                                smc.IdShort == "CityTown"
                                            )
                                    )
                                        ?.Value?.FirstOrDefault(mlp =>
                                            mlp.Language.ToLower() == LangStringValue.DE.ToLower()
                                        )
                                        ?.Text
                                    ?? "";
                                if (String.IsNullOrEmpty(adresse.Ort))
                                {
                                    adresse.Ort =
                                        (
                                            (AasCore.Aas3_1.MultiLanguageProperty?)
                                                contactInformation.Value?.FirstOrDefault(smc =>
                                                    smc.IdShort == "CityTown"
                                                )
                                        )
                                            ?.Value?.FirstOrDefault(mlp =>
                                                mlp.Language.ToLower()
                                                == LangStringValue.EN.ToLower()
                                            )
                                            ?.Text
                                        ?? "";
                                }
                                if (String.IsNullOrEmpty(adresse.Ort))
                                {
                                    adresse.Ort =
                                        (
                                            (AasCore.Aas3_1.MultiLanguageProperty?)
                                                contactInformation.Value?.FirstOrDefault(smc =>
                                                    smc.IdShort == "CityTown"
                                                )
                                        )
                                            ?.Value?.FirstOrDefault()
                                            ?.Text
                                        ?? "";
                                }
                            }
                            catch
                            {
                                adresse.Ort = string.Empty;
                            }
                            try
                            {
                                adresse.LaenderCode =
                                    (
                                        (AasCore.Aas3_1.MultiLanguageProperty?)
                                            contactInformation.Value?.FirstOrDefault(smc =>
                                                smc.IdShort == "NationalCode"
                                            )
                                    )
                                        ?.Value?.FirstOrDefault(mlp =>
                                            mlp.Language.ToLower() == LangStringValue.DE.ToLower()
                                        )
                                        ?.Text
                                    ?? "";
                                if (String.IsNullOrEmpty(adresse.LaenderCode))
                                {
                                    adresse.LaenderCode =
                                        (
                                            (AasCore.Aas3_1.MultiLanguageProperty?)
                                                contactInformation.Value?.FirstOrDefault(smc =>
                                                    smc.IdShort == "NationalCode"
                                                )
                                        )
                                            ?.Value?.FirstOrDefault(mlp =>
                                                mlp.Language.ToLower()
                                                == LangStringValue.EN.ToLower()
                                            )
                                            ?.Text
                                        ?? "";
                                }
                                if (String.IsNullOrEmpty(adresse.LaenderCode))
                                {
                                    adresse.LaenderCode =
                                        (
                                            (AasCore.Aas3_1.MultiLanguageProperty?)
                                                contactInformation.Value?.FirstOrDefault(smc =>
                                                    smc.IdShort == "NationalCode"
                                                )
                                        )
                                            ?.Value?.FirstOrDefault()
                                            ?.Text
                                        ?? "";
                                }
                            }
                            catch
                            {
                                adresse.LaenderCode = string.Empty;
                            }
                            try
                            {
                                adresse.Bundesland =
                                    (
                                        (AasCore.Aas3_1.MultiLanguageProperty?)
                                            contactInformation.Value?.FirstOrDefault(smc =>
                                                smc.IdShort == "StateCounty"
                                            )
                                    )
                                        ?.Value?.FirstOrDefault(mlp =>
                                            mlp.Language.ToLower() == LangStringValue.DE.ToLower()
                                        )
                                        ?.Text
                                    ?? "";
                                if (String.IsNullOrEmpty(adresse.LaenderCode))
                                {
                                    adresse.Bundesland =
                                        (
                                            (AasCore.Aas3_1.MultiLanguageProperty?)
                                                contactInformation.Value?.FirstOrDefault(smc =>
                                                    smc.IdShort == "StateCounty"
                                                )
                                        )
                                            ?.Value?.FirstOrDefault(mlp =>
                                                mlp.Language.ToLower()
                                                == LangStringValue.EN.ToLower()
                                            )
                                            ?.Text
                                        ?? "";
                                }
                                if (String.IsNullOrEmpty(adresse.Bundesland))
                                {
                                    adresse.Bundesland =
                                        (
                                            (AasCore.Aas3_1.MultiLanguageProperty?)
                                                contactInformation.Value?.FirstOrDefault(smc =>
                                                    smc.IdShort == "StateCounty"
                                                )
                                        )
                                            ?.Value?.FirstOrDefault()
                                            ?.Text
                                        ?? "";
                                }
                            }
                            catch
                            {
                                adresse.Bundesland = string.Empty;
                            }
                            try
                            {
                                adresse.Name =
                                    (
                                        (AasCore.Aas3_1.MultiLanguageProperty?)
                                            submodel.FirstOrDefault(smc =>
                                                smc.IdShort == "ManufacturerName"
                                            )
                                    )
                                        ?.Value?.FirstOrDefault(mlp =>
                                            mlp.Language.ToLower() == LangStringValue.DE.ToLower()
                                        )
                                        ?.Text
                                    ?? "";
                                if (String.IsNullOrEmpty(adresse.Name))
                                {
                                    adresse.Name =
                                        (
                                            (AasCore.Aas3_1.MultiLanguageProperty?)
                                                contactInformation.Value?.FirstOrDefault(smc =>
                                                    smc.IdShort == "ManufacturerName"
                                                )
                                        )
                                            ?.Value?.FirstOrDefault(mlp =>
                                                mlp.Language.ToLower()
                                                == LangStringValue.EN.ToLower()
                                            )
                                            ?.Text
                                        ?? "";
                                }
                                if (String.IsNullOrEmpty(adresse.Name))
                                {
                                    adresse.Name =
                                        (
                                            (AasCore.Aas3_1.MultiLanguageProperty?)
                                                contactInformation.Value?.FirstOrDefault(smc =>
                                                    smc.IdShort == "ManufacturerName"
                                                )
                                        )
                                            ?.Value?.FirstOrDefault()
                                            ?.Text
                                        ?? "";
                                }
                            }
                            catch
                            {
                                adresse.Name = string.Empty;
                            }
                        }
                    }
                }
                catch
                {
                    /* ignore errors */
                }
            }
            return adresse;
        }
    }
}
