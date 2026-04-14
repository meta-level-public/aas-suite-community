using BaSyx.Models.Core.AssetAdministrationShell.Generics;
using BaSyx.Models.Core.AssetAdministrationShell.Implementations;
using BaSyx.Models.Export;
using BaSyx.Models.Export.Converter;
using BaSyx.Models.Export.EnvironmentSubmodelElements;
using BaSyx.Models.Extensions.Semantics.DataSpecifications;

namespace AasDesignerApi.Import
{
    public class DotnetBasyxValidator
    {
        public static void ConvertToAssetAdministrationShell(
            AssetAdministrationShellEnvironment_V2_0 environment
        )
        {
            foreach (var envAsset in environment.EnvironmentAssets ?? [])
            {
                Asset asset = new Asset(envAsset.IdShort, envAsset.Identification)
                {
                    Administration = envAsset.Administration,
                    Category = envAsset.Category,
                    Description = envAsset.Description,
                    Kind = envAsset.Kind,
                    AssetIdentificationModel =
                        envAsset.AssetIdentificationModelReference?.ToReference_V2_0<ISubmodel>(),
                    BillOfMaterial = envAsset.BillOfMaterial?.ToReference_V2_0<ISubmodel>(),
                };
                environment.Assets.Add(asset);
            }
            foreach (var envConceptDescription in environment.EnvironmentConceptDescriptions ?? [])
            {
                var iec61360 = envConceptDescription
                    .EmbeddedDataSpecification
                    ?.DataSpecificationContent
                    ?.DataSpecificationIEC61360;
                BaSyx.Models.Core.AssetAdministrationShell.Semantics.ConceptDescription conceptDescription =
                    new BaSyx.Models.Core.AssetAdministrationShell.Semantics.ConceptDescription()
                    {
                        Administration = envConceptDescription.Administration,
                        Category = envConceptDescription.Category,
                        Description = envConceptDescription.Description,
                        Identification = envConceptDescription.Identification,
                        IdShort = envConceptDescription.IdShort,
                        IsCaseOf = envConceptDescription.IsCaseOf?.ConvertAll(c =>
                            c.ToReference_V2_0()
                        ),
                        EmbeddedDataSpecifications =
                            iec61360 != null ? new List<DataSpecificationIEC61360>() : null,
                    };
                if (
                    conceptDescription.EmbeddedDataSpecifications
                        is List<DataSpecificationIEC61360> embeddedDataSpecifications
                    && iec61360 != null
                )
                {
                    DataSpecificationIEC61360 dataSpecification =
                        iec61360.ToDataSpecificationIEC61360();

                    embeddedDataSpecifications.Add(dataSpecification);
                }
                environment.ConceptDescriptions.Add(conceptDescription);
            }
            foreach (var envSubmodel in environment.EnvironmentSubmodels ?? [])
            {
                Submodel submodel = new Submodel(envSubmodel.IdShort, envSubmodel.Identification)
                {
                    Administration = envSubmodel.Administration,
                    Category = envSubmodel.Category,
                    Description = envSubmodel.Description,
                    Kind = envSubmodel.Kind,
                    SemanticId = envSubmodel.SemanticId?.ToReference_V2_0(),
                    ConceptDescription = null,
                };
                List<ISubmodelElement?>? smElements = envSubmodel.SubmodelElements?.ConvertAll(c =>
                    c.submodelElement?.ToSubmodelElement(environment.ConceptDescriptions, submodel)
                );
                if (smElements != null)
                    foreach (var smElement in smElements.Where(smElement => smElement != null))
                        submodel.SubmodelElements.Create(smElement);

                environment.Submodels.Add(submodel);
            }
            foreach (
                var envAssetAdministrationShell in environment.EnvironmentAssetAdministrationShells
                    ?? []
            )
            {
                AssetAdministrationShell assetAdministrationShell = new AssetAdministrationShell(
                    envAssetAdministrationShell.IdShort,
                    envAssetAdministrationShell.Identification
                )
                {
                    Administration = envAssetAdministrationShell.Administration,
                    Category = envAssetAdministrationShell.Category,
                    DerivedFrom =
                        envAssetAdministrationShell.DerivedFrom?.ToReference_V2_0<IAssetAdministrationShell>(),
                    Description = envAssetAdministrationShell.Description,
                };

                IAsset? asset = environment.Assets?.Find(a =>
                    a.Identification.Id
                    == envAssetAdministrationShell.AssetReference?.Keys?.FirstOrDefault()?.Value
                );
                assetAdministrationShell.Asset = asset;

                if (envAssetAdministrationShell.SubmodelReferences != null)
                    foreach (var envSubmodelRef in envAssetAdministrationShell.SubmodelReferences)
                    {
                        ISubmodel? submodel = environment.Submodels?.Find(s =>
                            s.Identification.Id == envSubmodelRef.Keys?.FirstOrDefault()?.Value
                        );
                        if (submodel != null)
                            assetAdministrationShell.Submodels.Create(submodel);
                    }

                environment.AssetAdministrationShells.Add(assetAdministrationShell);
            }
        }
    }
}
