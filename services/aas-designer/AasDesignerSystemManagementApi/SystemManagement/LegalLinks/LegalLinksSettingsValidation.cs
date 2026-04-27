using AasDesignerSystemManagementApi.SystemManagement.Model;

namespace AasDesignerSystemManagementApi.SystemManagement.LegalLinks;

internal static class LegalLinksSettingsValidation
{
    public static void ValidateForUpdate(UpdateLegalLinksSettingsRequest request)
    {
        ValidateField(
            request.DatenschutzLinkDe,
            request.DatenschutzLinkDeDocument,
            nameof(request.DatenschutzLinkDe)
        );
        ValidateField(
            request.DatenschutzLinkEn,
            request.DatenschutzLinkEnDocument,
            nameof(request.DatenschutzLinkEn)
        );
        ValidateField(request.AgbLinkDe, request.AgbLinkDeDocument, nameof(request.AgbLinkDe));
        ValidateField(request.AgbLinkEn, request.AgbLinkEnDocument, nameof(request.AgbLinkEn));
        ValidateField(request.AvvLinkDe, request.AvvLinkDeDocument, nameof(request.AvvLinkDe));
        ValidateField(request.AvvLinkEn, request.AvvLinkEnDocument, nameof(request.AvvLinkEn));
        ValidateField(
            request.ImprintLink,
            request.ImprintLinkDocument,
            nameof(request.ImprintLink)
        );

        var anyUpload =
            IsUpload(request.DatenschutzLinkDeDocument)
            || IsUpload(request.DatenschutzLinkEnDocument)
            || IsUpload(request.AgbLinkDeDocument)
            || IsUpload(request.AgbLinkEnDocument)
            || IsUpload(request.AvvLinkDeDocument)
            || IsUpload(request.AvvLinkEnDocument)
            || IsUpload(request.ImprintLinkDocument);

        if (anyUpload)
        {
            ValidateServingBaseUrl(request.ServingBaseUrl);
        }
    }

    private static void ValidateField(
        string? urlValue,
        LegalLinksDocumentUploadDto? documentUpload,
        string fieldName
    )
    {
        if (IsUpload(documentUpload))
        {
            if (string.IsNullOrWhiteSpace(documentUpload!.FileName))
            {
                throw new InvalidOperationException(
                    $"The document for '{fieldName}' must have a non-empty file name."
                );
            }

            return;
        }

        ValidateUrl(urlValue, fieldName);
    }

    private static bool IsUpload(LegalLinksDocumentUploadDto? dto) =>
        dto != null && !string.IsNullOrEmpty(dto.ContentBase64);

    private static void ValidateServingBaseUrl(string? servingBaseUrl)
    {
        var normalized = servingBaseUrl?.Trim() ?? string.Empty;
        if (
            normalized == string.Empty
            || !Uri.TryCreate(normalized, UriKind.Absolute, out var uri)
            || (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps)
        )
        {
            throw new InvalidOperationException(
                "The ServingBaseUrl must be an absolute HTTP or HTTPS URL when uploading documents."
            );
        }
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
