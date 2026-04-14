using System.Globalization;
using System.Net;
using System.Text;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.WebUtilities;

namespace AasDesignerCommon.Utils;

public static class StringExtension
{
    public static string UpercaseFirst(this string input)
    {
        if (string.IsNullOrEmpty(input))
            return input;

        return input.Substring(0, 1).ToUpper(CultureInfo.CurrentCulture)
            + input.Substring(1, input.Length - 1);
    }

    public static string SanitizeFilename(this string input)
    {
        if (string.IsNullOrEmpty(input))
            return input;

        return input.Replace(" ", "_");
    }

    public static string ToBase64(this string text)
    {
        return text.ToBase64(Encoding.UTF8);
    }

    public static string ToBase64(this string text, Encoding encoding)
    {
        if (string.IsNullOrEmpty(text))
        {
            return text;
        }

        byte[] textAsBytes = encoding.GetBytes(text);
        return Convert.ToBase64String(textAsBytes);
    }

    public static string ToBase64UrlEncoded(this string text, Encoding encoding)
    {
        return Base64UrlTextEncoder.Encode(encoding.GetBytes(text));
    }

    public static string ToUrlEncoded(this string text)
    {
        return text.ToUrlEncoded(Encoding.UTF8);
    }

    public static string ToUrlEncoded(this string text, Encoding encoding)
    {
        return WebUtility.UrlEncode(encoding.GetString(encoding.GetBytes(text)));
    }

    public static bool TryParseBase64(this string text, out string decodedText)
    {
        return text.TryParseBase64(Encoding.UTF8, out decodedText);
    }

    public static bool TryParseBase64(this string text, Encoding encoding, out string decodedText)
    {
        if (string.IsNullOrEmpty(text))
        {
            decodedText = text;
            return false;
        }

        try
        {
            byte[] textAsBytes = Convert.FromBase64String(text);
            decodedText = encoding.GetString(textAsBytes);
            return true;
        }
        catch (Exception)
        {
            decodedText = string.Empty;
            return false;
        }
    }

    public static bool TryParseBase64Urlencoded(
        this string text,
        Encoding encoding,
        out string decodedText
    )
    {
        try
        {
            decodedText = encoding.GetString(Base64UrlTextEncoder.Decode(text));
            return true;
        }
        catch (Exception)
        {
            decodedText = string.Empty;
            return false;
        }
    }

    public static string MakeValidFileName(this string name)
    {
        Regex rgx = new Regex("[^a-zA-Z0-9_.]");
        name = name.Replace("https://", string.Empty);
        name = name.Replace("http://", string.Empty);
        return rgx.Replace(name, "_");
    }
}
