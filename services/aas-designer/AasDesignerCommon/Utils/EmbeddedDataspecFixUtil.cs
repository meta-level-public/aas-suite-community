namespace AasDesignerCommon.Utils;

public class EmbeddedDataspecFixUtil
{
    public static string FixEmbeddedDataspec(string dataspec)
    {
        return dataspec.Replace(
            "\"embeddedDataSpecifications\":[{}]",
            "\"embeddedDataSpecifications\":[]"
        );
    }
}
