using Newtonsoft.Json;

namespace AasDesignerApi.Model;

public static class DBJsonConverter
{
    public static string? Serialize(object? v)
    {
        if (v == null)
            return null;

        return JsonConvert.SerializeObject(v);
    }

    public static T Deserialize<T>(string? v)
    {
        if (v == null)
        {
            return Activator.CreateInstance<T>();
        }
        var deserialized = JsonConvert.DeserializeObject<T>(v);
        if (deserialized == null)
        {
            return Activator.CreateInstance<T>();
        }
        else
        {
            return deserialized;
        }
    }
}
