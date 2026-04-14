using Newtonsoft.Json;

namespace AasDesignerCommon.Utils;

public static class DeepCopyUtil
{
    public static T? DeepCopy<T>(this T self)
    {
        var serialized = JsonConvert.SerializeObject(self);
        return JsonConvert.DeserializeObject<T>(serialized);
    }
}
