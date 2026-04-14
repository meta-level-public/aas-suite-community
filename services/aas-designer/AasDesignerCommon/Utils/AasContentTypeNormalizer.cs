using System.Net.Http.Headers;
using System.Text.Json.Nodes;

namespace AasDesignerCommon.Utils;

public static class AasContentTypeNormalizer
{
    public static void NormalizeJsonContentTypes(JsonNode? node)
    {
        switch (node)
        {
            case JsonObject jsonObject:
                NormalizeObject(jsonObject);
                break;
            case JsonArray jsonArray:
                foreach (var item in jsonArray)
                {
                    NormalizeJsonContentTypes(item);
                }
                break;
        }
    }

    public static string NormalizeMediaType(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return value ?? string.Empty;
        }

        var trimmedValue = value.Trim();
        if (MediaTypeHeaderValue.TryParse(trimmedValue, out var parsedValue))
        {
            return parsedValue.MediaType ?? trimmedValue;
        }

        var separatorIndex = trimmedValue.IndexOf(';');
        if (separatorIndex <= 0)
        {
            return trimmedValue;
        }

        return trimmedValue[..separatorIndex].Trim();
    }

    private static void NormalizeObject(JsonObject jsonObject)
    {
        foreach (var (key, value) in jsonObject.ToList())
        {
            if (
                key.Equals("contentType", StringComparison.OrdinalIgnoreCase)
                && value is JsonValue jsonValue
            )
            {
                var contentType = jsonValue.GetValue<string?>();
                if (!string.IsNullOrWhiteSpace(contentType))
                {
                    jsonObject[key] = NormalizeMediaType(contentType);
                }

                continue;
            }

            NormalizeJsonContentTypes(value);
        }
    }
}
