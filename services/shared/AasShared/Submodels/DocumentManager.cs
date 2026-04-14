using BaSyx.Models.Core.AssetAdministrationShell.Generics;
using BaSyx.Models.Core.AssetAdministrationShell.Identification;
using BaSyx.Models.Core.AssetAdministrationShell.Identification.BaSyx;
using BaSyx.Models.Core.AssetAdministrationShell.Implementations;

namespace AasShared.Submodels
{
    public class DocumentManager
    {
        public static ISubmodel CreateEmptyModel()
        {
            Submodel model = new Submodel(
                "Documentation",
                new BaSyxSubmodelIdentifier("Documentation", "2.0.0")
            )
            {
                SemanticId = new Reference(
                    new Key(
                        KeyElements.Submodel,
                        KeyType.IRI,
                        "https://www.hsu-hh.de/aut/aas/document",
                        true
                    )
                ),
                SubmodelElements = { },
            };

            return model;
        }

        public static SubmodelElementCollection CreateDocumentElement()
        {
            var smc = new SubmodelElementCollection("")
            {
                SemanticId = new Reference(
                    new Key(
                        KeyElements.ConceptDescription,
                        KeyType.IRDI,
                        IrdiValue.DOCUMENTATTION_ITEM,
                        true
                    )
                ),
                Value =
                {
                    new Property<string>("DocumentType", "")
                    {
                        // SemanticId =  new Reference(new Key(KeyElements.ConceptDescription, KeyType.IRDI, IrdiValue.ADDRESS_COUNTRY_CODE, true))
                    },
                    new Property<string>("VDI2770_DomainId", "")
                    {
                        // SemanticId =  new Reference(new Key(KeyElements.ConceptDescription, KeyType.IRDI, IrdiValue.ADDRESS_COUNTRY_CODE, true))
                    },
                    new Property<string>("VDI2770_IdType", "")
                    {
                        // SemanticId =  new Reference(new Key(KeyElements.ConceptDescription, KeyType.IRDI, IrdiValue.ADDRESS_COUNTRY_CODE, true))
                    },
                    new Property<string>("VDI2770_FileFormat", "")
                    {
                        // SemanticId =  new Reference(new Key(KeyElements.ConceptDescription, KeyType.IRDI, IrdiValue.ADDRESS_COUNTRY_CODE, true))
                    },
                    new Property<string>("VDI2770_Title", "")
                    {
                        // SemanticId =  new Reference(new Key(KeyElements.ConceptDescription, KeyType.IRDI, IrdiValue.ADDRESS_COUNTRY_CODE, true))
                    },
                    new Property<string>("VDI2770_FileName", "")
                    {
                        // SemanticId =  new Reference(new Key(KeyElements.ConceptDescription, KeyType.IRDI, IrdiValue.ADDRESS_COUNTRY_CODE, true))
                    },
                    new BaSyx.Models.Core.AssetAdministrationShell.Implementations.File("File")
                    {
                        // SemanticId =  new Reference(new Key(KeyElements.ConceptDescription, KeyType.IRDI, IrdiValue.ADDRESS_COUNTRY_CODE, true)),
                        Value = "",
                        MimeType = "",
                    },
                },
            };

            return smc;
        }
    }
}
