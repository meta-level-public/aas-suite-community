using AasDesignerApi.Model.Client;

namespace AasDesignerApi.Instantiation
{
    public class Instantiator
    {
        public static void Instantiate(
            AasCore.Aas3_1.Environment environment,
            CreateInstanceItem item
        )
        {
            var submodel = environment.Submodels?.Find(sm => sm.IdShort == "Nameplate");
            var serial = (AasCore.Aas3_1.Property?)(
                submodel?.SubmodelElements?.Find(sme => sme.IdShort == "SerialNumber")
            );
            if (serial != null)
            {
                serial.Value = item.SerialNumber;
            }
            else
            {
                submodel?.SubmodelElements?.Add(
                    new AasCore.Aas3_1.Property(AasCore.Aas3_1.DataTypeDefXsd.String)
                    {
                        IdShort = "SerialNumber",
                        Value = item.SerialNumber,
                    }
                );
            }
            var yearOfManufacturing = (AasCore.Aas3_1.Property?)(
                submodel?.SubmodelElements?.Find(sme => sme.IdShort == "YearOfConstruction")
            );
            if (serial != null)
            {
                serial.Value = item.SerialNumber;
            }
            else
            {
                submodel?.SubmodelElements?.Add(
                    new AasCore.Aas3_1.Property(AasCore.Aas3_1.DataTypeDefXsd.Integer)
                    {
                        IdShort = "YearOfConstruction",
                        Value = item.YearOfConstruction.ToString(),
                    }
                );
            }
            environment.AssetAdministrationShells?.ForEach(
                (aas) =>
                {
                    aas.AssetInformation.AssetKind = AasCore.Aas3_1.AssetKind.Instance;
                    aas.AssetInformation.AssetType = aas.AssetInformation.GlobalAssetId;
                    aas.AssetInformation.GlobalAssetId = Guid.NewGuid().ToString();

                    var keys = new List<AasCore.Aas3_1.IKey>();
                    keys.Add(
                        new AasCore.Aas3_1.Key(AasCore.Aas3_1.KeyTypes.GlobalReference, aas.Id)
                    );

                    aas.DerivedFrom = new AasCore.Aas3_1.Reference(
                        AasCore.Aas3_1.ReferenceTypes.ExternalReference,
                        keys
                    );
                    aas.Id = Guid.NewGuid().ToString();
                }
            );
        }
    }
}
