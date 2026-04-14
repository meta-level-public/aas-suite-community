using System.IO.Packaging;
using BaSyx.Models.Core.AssetAdministrationShell.Generics;
using BaSyx.Models.Core.AssetAdministrationShell.Implementations;
using BaSyx.Models.Export;

namespace AasShared.Submodels
{
    public class IdentificationManager
    {
        public static ISubmodel? CreateEmptyModel()
        {
            // Submodel model = new Submodel("Identification", new BaSyxSubmodelIdentifier("Identification", "2.0.0"))
            // {
            //     SubmodelElements = {
            //         ,
            //         new Property<string>("GLNOfManufacturer", ""),
            //         new Property<string>("ManufacturerProductDesignation", ""),
            //         new Property<string>("ManufacturerProductDescription", ""),
            //         new Property<string>("ManufacturerProductFamily", ""),
            //         new Property<string>("SerialNumber", ""),
            //         new BaSyx.Models.Core.AssetAdministrationShell.Implementations.File("CompanyLogo")
            //         {
            //             Value = "",
            //             MimeType = ""
            //         }
            //     }
            // };
            // return model;

            Submodel? submodel = null;
            var assemblyDirectory =
                Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().Location)
                ?? throw new DirectoryNotFoundException(
                    "Assembly directory could not be resolved."
                );
            var basePath = assemblyDirectory;
            using (
                AASX aasxTemplate = new AASX(
                    Package.Open(
                        Path.Combine(basePath, "Assets", "Templates", "identification.aasx")
                    )
                )
            )
            {
                var env = aasxTemplate.GetEnvironment_V2_0();
                submodel = (Submodel?)
                    env.Submodels.FirstOrDefault(sm => sm.IdShort == "Identification");
            }

            if (submodel != null)
            {
                Helper.ChangeTypeToInstance(submodel);
            }

            return submodel;
        }
    }
}
