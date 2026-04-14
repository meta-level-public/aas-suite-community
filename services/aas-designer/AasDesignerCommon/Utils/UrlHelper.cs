namespace AasDesignerCommon.Utils;

public static class UrlHelper
{
    public static string AppendSlash(this string url)
    {
        if (url.EndsWith("/"))
        {
            return url;
        }
        return url + "/";
    }
}
