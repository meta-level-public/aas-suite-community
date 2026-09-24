namespace DppGateway;

public static class DppIdentifier
{
    public static string? Decode(string value)
    {
        try
        {
            var decoded = Uri.UnescapeDataString(value).Trim();
            return decoded.Length is > 0 and <= 2048 ? decoded : null;
        }
        catch (UriFormatException)
        {
            return null;
        }
    }
}
