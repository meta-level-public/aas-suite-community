using AasDesignerSystemManagementApi.SystemManagement.Model;

namespace AasDesignerSystemManagementApi.SystemManagement.LegalLinks;

internal static class LegalLinksSettingsValidation
{
    public static void ValidateForUpdate(LegalLinksSettingsDto settings)
    {
        ValidateUrl(settings.DatenschutzLinkDe, nameof(settings.DatenschutzLinkDe));
        ValidateUrl(settings.DatenschutzLinkEn, nameof(settings.DatenschutzLinkEn));
        ValidateUrl(settings.AgbLinkDe, nameof(settings.AgbLinkDe));
        ValidateUrl(settings.AgbLinkEn, nameof(settings.AgbLinkEn));
        ValidateUrl(settings.AvvLinkDe, nameof(settings.AvvLinkDe));
        ValidateUrl(settings.AvvLinkEn, nameof(settings.AvvLinkEn));
        ValidateUrl(settings.ImprintLink, nameof(settings.ImprintLink));
    }

    private static void ValidateUrl(string? value, string fieldName)
    {
        var normalizedValue = value?.Trim() ?? string.Empty;
        if (normalizedValue == string.Empty)
        {
            return;
        }

        if (
            !Uri.TryCreate(normalizedValue, UriKind.Absolute, out var uri)
            || (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps)
        )
        {
            throw new InvalidOperationException(
                $"The value for '{fieldName}' must be an absolute HTTP or HTTPS URL."
            );
        }
    }
}
