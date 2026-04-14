using System.Text.Json.Nodes;

namespace AasDesignerCommon.Utils;

public static class AasJsonNodeParser
{
    public static JsonNode Parse(string json)
    {
        return JsonNode.Parse(json) ?? throw new System.Exception("Could not parse JSON");
    }
}
