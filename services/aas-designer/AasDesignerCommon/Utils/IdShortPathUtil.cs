namespace AasDesignerCommon.Utils;

public static class IdShortPathUtil
{
    public static string AppendIdShortPath(this string idShortPath, string idShort)
    {
        if (string.IsNullOrWhiteSpace(idShortPath))
            return idShort;
        return idShortPath + '.' + idShort;
    }

    public static string AppendIndexPath(this string idShortPath, long count)
    {
        if (string.IsNullOrWhiteSpace(idShortPath))
            return "[" + count + "]";
        return idShortPath + "[" + count + "]";
    }
}
