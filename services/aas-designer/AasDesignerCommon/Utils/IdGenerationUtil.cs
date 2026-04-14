namespace AasDesignerCommon.Utils;

public enum IdType
{
    Aas,
    Submodel,
    Property,
    Collection,
    Mlp,
    File,
    Asset,
    Other,
    ConceptDescription,
}

public static class IdGenerationUtil
{
    public static string GenerateId(IdType idType, string prefix)
    {
        string generatedIri = prefix + "/ids";
        switch (idType)
        {
            case IdType.Aas:
                generatedIri +=
                    $"/aas/{GetRandomInt(1000, 9999)}_{GetRandomInt(1000, 9999)}_{GetRandomInt(1000, 9999)}_{GetRandomInt(1000, 9999)}";
                break;
            case IdType.Submodel:
                generatedIri +=
                    $"/sm/{GetRandomInt(1000, 9999)}_{GetRandomInt(1000, 9999)}_{GetRandomInt(1000, 9999)}_{GetRandomInt(1000, 9999)}";
                break;
            case IdType.Collection:
                generatedIri +=
                    $"/coll/{GetRandomInt(1000, 9999)}_{GetRandomInt(1000, 9999)}_{GetRandomInt(1000, 9999)}_{GetRandomInt(1000, 9999)}";
                break;
            case IdType.Property:
                generatedIri +=
                    $"/prop/{GetRandomInt(1000, 9999)}_{GetRandomInt(1000, 9999)}_{GetRandomInt(1000, 9999)}_{GetRandomInt(1000, 9999)}";
                break;
            case IdType.Mlp:
                generatedIri +=
                    $"/mlp/{GetRandomInt(1000, 9999)}_{GetRandomInt(1000, 9999)}_{GetRandomInt(1000, 9999)}_{GetRandomInt(1000, 9999)}";
                break;
            case IdType.File:
                generatedIri +=
                    $"/file/{GetRandomInt(1000, 9999)}_{GetRandomInt(1000, 9999)}_{GetRandomInt(1000, 9999)}_{GetRandomInt(1000, 9999)}";
                break;
            case IdType.Asset:
                generatedIri +=
                    $"/asset/{GetRandomInt(1000, 9999)}_{GetRandomInt(1000, 9999)}_{GetRandomInt(1000, 9999)}_{GetRandomInt(1000, 9999)}";
                break;
            case IdType.Other:
                generatedIri +=
                    $"/other/{GetRandomInt(1000, 9999)}_{GetRandomInt(1000, 9999)}_{GetRandomInt(1000, 9999)}_{GetRandomInt(1000, 9999)}";
                break;
            case IdType.ConceptDescription:
                generatedIri +=
                    $"/cd/{GetRandomInt(1000, 9999)}_{GetRandomInt(1000, 9999)}_{GetRandomInt(1000, 9999)}_{GetRandomInt(1000, 9999)}";
                break;
            default:
                throw new ArgumentOutOfRangeException(nameof(idType), idType, null);
        }
        return generatedIri;
    }

    private static int GetRandomInt(int min, int max)
    {
        Random random = new Random();
        return random.Next(min, max + 1);
    }
}
