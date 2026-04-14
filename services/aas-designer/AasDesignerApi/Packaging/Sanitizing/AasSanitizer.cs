using System.Text.Json.Nodes;

namespace AasDesignerApi.Packaging.Sanitizing
{
    public class AasSanitizer
    {
        public static void SanitizeDescription(JsonNode jsonNode)
        {
            if (jsonNode.GetType() == typeof(JsonArray))
            {
                var jsonArray = (JsonArray)jsonNode;
                jsonArray
                    .ToList()
                    .Where(node => node != null)
                    .ToList()
                    .ForEach(node => SanitizeDescription(node!));
            }
            else if (jsonNode.GetType() == typeof(JsonObject))
            {
                var jsonObject = (JsonObject)jsonNode;
                jsonObject
                    .ToList()
                    .ForEach(node =>
                    {
                        if (node.Key == "description")
                        {
                            // über alle description Einträge iterieren und schauen ob der Text gesetzt ist
                            if (node.Value?.GetType() == typeof(JsonArray))
                            {
                                var arr = (JsonArray)node.Value;
                                arr.ToList()
                                    .Where(descNode => descNode != null)
                                    .ToList()
                                    .ForEach(descNode =>
                                    {
                                        if (descNode?.GetType() == typeof(JsonObject))
                                        {
                                            var desc = (JsonObject)descNode!;
                                            if (!desc.Any(n => n.Key == "text"))
                                            {
                                                desc.Add("text", "");
                                            }
                                        }
                                    });
                            }
                        }
                        else
                        {
                            if (node.Value != null)
                            {
                                SanitizeDescription(node.Value);
                            }
                        }
                    });
            }
        }
    }
}
