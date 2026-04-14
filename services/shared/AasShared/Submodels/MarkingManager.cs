using System.IO.Packaging;
using BaSyx.Models.Core.AssetAdministrationShell.Identification;
using BaSyx.Models.Core.AssetAdministrationShell.Implementations;
using BaSyx.Models.Export;

namespace AasShared.Submodels
{
    public class MarkingManager
    {
        public static SubmodelElementCollection? CreateMarking()
        {
            SubmodelElementCollection? markingCollection = null;
            var assemblyDirectory =
                Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().Location)
                ?? throw new DirectoryNotFoundException(
                    "Assembly directory could not be resolved."
                );
            var basePath = assemblyDirectory;
            using (
                AASX aasxTemplate = new AASX(
                    Package.Open(Path.Combine(basePath, "Assets", "Templates", "nameplate_v2.aasx"))
                )
            )
            {
                var nameplate = (Submodel?)
                    aasxTemplate
                        .GetEnvironment_V2_0()
                        .Submodels.FirstOrDefault(sm => sm.IdShort == "Nameplate");
                markingCollection =
                    nameplate?.SubmodelElements.FirstOrDefault(sme => sme.IdShort == "Markings")
                    as SubmodelElementCollection;
                markingCollection = (SubmodelElementCollection?)markingCollection?.FirstOrDefault();
                if (markingCollection != null)
                {
                    Helper.ChangeTypeToInstance(markingCollection);
                }
                else
                {
                    // selbst erstellen?
                    markingCollection = new SubmodelElementCollection("Markings")
                    {
                        SemanticId = new Reference(
                            new Key(
                                KeyElements.ConceptDescription,
                                KeyType.IRI,
                                "https://admin-shell.io/zvei/nameplate/1/0/Nameplate/Markings/Marking",
                                true
                            )
                        ),
                    };
                    var nameProp = new Property("MarkingName")
                    {
                        SemanticId = new Reference(
                            new Key(
                                KeyElements.ConceptDescription,
                                KeyType.IRI,
                                "https://admin-shell.io/zvei/nameplate/1/0/Nameplate/Markings/Marking/MarkingName",
                                true
                            )
                        ),
                    };

                    markingCollection.Add(nameProp);
                    var fileProp =
                        new BaSyx.Models.Core.AssetAdministrationShell.Implementations.File(
                            "MarkingFile"
                        )
                        {
                            SemanticId = new Reference(
                                new Key(
                                    KeyElements.ConceptDescription,
                                    KeyType.IRI,
                                    "https://admin-shell.io/zvei/nameplate/1/0/Nameplate/Markings/Marking/MarkingFile",
                                    true
                                )
                            ),
                        };

                    markingCollection.Add(fileProp);
                    var additionalTextProp = new Property("MarkingAdditionalText")
                    {
                        SemanticId = new Reference(
                            new Key(
                                KeyElements.ConceptDescription,
                                KeyType.IRI,
                                "https://admin-shell.io/zvei/nameplate/1/0/Nameplate/Markings/Marking/MarkingAdditionalText",
                                true
                            )
                        ),
                    };
                    markingCollection.Add(additionalTextProp);
                }
            }

            return markingCollection;
        }
    }
}
