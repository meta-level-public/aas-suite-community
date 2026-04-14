using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;

namespace AasDesignerCommon.Utils;

/// <summary>
/// Utility class for extracting file names from URLs and determining content types.
/// </summary>
public static class FileFromUrlExtractor
{
    private static readonly Dictionary<string, string> MimeTypeMap = new()
    {
        // Images
        { ".jpg", "image/jpeg" },
        { ".jpeg", "image/jpeg" },
        { ".png", "image/png" },
        { ".gif", "image/gif" },
        { ".bmp", "image/bmp" },
        { ".webp", "image/webp" },
        { ".svg", "image/svg+xml" },
        { ".ico", "image/x-icon" },
        // Documents
        { ".pdf", "application/pdf" },
        { ".doc", "application/msword" },
        { ".docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
        { ".xls", "application/vnd.ms-excel" },
        { ".xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
        { ".ppt", "application/vnd.ms-powerpoint" },
        { ".pptx", "application/vnd.openxmlformats-officedocument.presentationml.presentation" },
        // Text files
        { ".txt", "text/plain" },
        { ".html", "text/html" },
        { ".htm", "text/html" },
        { ".css", "text/css" },
        { ".js", "text/javascript" },
        { ".json", "application/json" },
        { ".xml", "application/xml" },
        { ".csv", "text/csv" },
        // Archives
        { ".zip", "application/zip" },
        { ".rar", "application/x-rar-compressed" },
        { ".7z", "application/x-7z-compressed" },
        { ".tar", "application/x-tar" },
        { ".gz", "application/gzip" },
        // Audio/Video
        { ".mp3", "audio/mpeg" },
        { ".wav", "audio/wav" },
        { ".mp4", "video/mp4" },
        { ".avi", "video/x-msvideo" },
        { ".mov", "video/quicktime" },
        // Others
        { ".exe", "application/octet-stream" },
        { ".dll", "application/octet-stream" },
        { ".bin", "application/octet-stream" },
    };

    /// <summary>
    /// Result containing extracted filename and content type information.
    /// </summary>
    public class FileExtractionResult
    {
        public string FileName { get; set; } = string.Empty;
        public string ContentType { get; set; } = "application/octet-stream";
        public bool IsGeneratedName { get; set; } = false;
        public string? OriginalUrl { get; set; }
    }

    /// <summary>
    /// Extracts a filename from a URL or generates a random hash if no meaningful filename is found.
    /// </summary>
    /// <param name="url">The URL to extract the filename from</param>
    /// <param name="fallbackExtension">Optional fallback extension if none can be determined</param>
    /// <returns>FileExtractionResult containing filename and content type</returns>
    public static FileExtractionResult ExtractFileInfo(string url, string? fallbackExtension = null)
    {
        if (string.IsNullOrWhiteSpace(url))
        {
            return CreateFallbackResult(url, fallbackExtension);
        }

        try
        {
            var uri = new Uri(url);
            var path = uri.AbsolutePath;

            // Remove query parameters and fragments
            var cleanPath = path.Split('?')[0].Split('#')[0];

            // Get the last segment of the path
            var segments = cleanPath.Split('/', StringSplitOptions.RemoveEmptyEntries);
            var lastSegment = segments.LastOrDefault();

            // Check if this is a proxy/image service URL with an embedded URL in query parameters
            if (!string.IsNullOrWhiteSpace(uri.Query))
            {
                var query = uri.Query.TrimStart('?');
                var queryParams = query.Split('&');

                foreach (var param in queryParams)
                {
                    var keyValue = param.Split('=', 2);
                    if (
                        keyValue.Length == 2
                        && keyValue[0].Equals("url", StringComparison.OrdinalIgnoreCase)
                    )
                    {
                        try
                        {
                            var decodedUrl = Uri.UnescapeDataString(keyValue[1]);
                            if (Uri.TryCreate(decodedUrl, UriKind.Absolute, out var embeddedUri))
                            {
                                var embeddedPath = embeddedUri.AbsolutePath;
                                var embeddedSegments = embeddedPath.Split(
                                    '/',
                                    StringSplitOptions.RemoveEmptyEntries
                                );
                                var embeddedLastSegment = embeddedSegments.LastOrDefault();

                                if (
                                    !string.IsNullOrWhiteSpace(embeddedLastSegment)
                                    && IsValidFileName(embeddedLastSegment)
                                )
                                {
                                    lastSegment = embeddedLastSegment;
                                    break;
                                }
                            }
                        }
                        catch
                        {
                            // Continue with original logic if URL decoding fails
                        }
                    }
                }
            }

            // Additional check: if lastSegment somehow contains protocol, use the original url approach
            if (
                !string.IsNullOrWhiteSpace(lastSegment)
                && (
                    lastSegment.StartsWith("http://", StringComparison.OrdinalIgnoreCase)
                    || lastSegment.StartsWith("https://", StringComparison.OrdinalIgnoreCase)
                )
            )
            {
                // If the segment contains a protocol, it means the URL parsing didn't work correctly
                // Try to extract filename from the end of the URL string directly
                var urlParts = url.Split('/');
                lastSegment = urlParts.LastOrDefault();
                if (!string.IsNullOrWhiteSpace(lastSegment))
                {
                    lastSegment = lastSegment.Split('?')[0].Split('#')[0];
                }
            }

            if (string.IsNullOrWhiteSpace(lastSegment))
            {
                return CreateFallbackResult(url, fallbackExtension);
            }

            // Check if the last segment looks like a filename (contains a dot and has a reasonable extension)
            if (IsValidFileName(lastSegment))
            {
                var extension = Path.GetExtension(lastSegment).ToLowerInvariant();
                var contentType = GetContentTypeFromExtension(extension);

                return new FileExtractionResult
                {
                    FileName = SanitizeFileName(lastSegment),
                    ContentType = contentType,
                    IsGeneratedName = false,
                    OriginalUrl = url,
                };
            }

            // If we have a fallback extension, try to use the last segment as filename with that extension
            if (!string.IsNullOrWhiteSpace(fallbackExtension))
            {
                var sanitizedSegment = SanitizeFileName(lastSegment);
                if (!fallbackExtension.StartsWith("."))
                {
                    fallbackExtension = "." + fallbackExtension;
                }

                var fileName = sanitizedSegment + fallbackExtension;
                var contentType = GetContentTypeFromExtension(fallbackExtension);

                return new FileExtractionResult
                {
                    FileName = fileName,
                    ContentType = contentType,
                    IsGeneratedName = true,
                    OriginalUrl = url,
                };
            }

            return CreateFallbackResult(url, fallbackExtension);
        }
        catch (UriFormatException)
        {
            // If URL is malformed, create fallback result
            return CreateFallbackResult(url, fallbackExtension);
        }
    }

    /// <summary>
    /// Extracts filename from a URL asynchronously and attempts to determine content type via HTTP HEAD request.
    /// </summary>
    /// <param name="url">The URL to extract the filename from</param>
    /// <param name="httpClient">HttpClient instance for making the HEAD request</param>
    /// <param name="fallbackExtension">Optional fallback extension</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>FileExtractionResult with potentially more accurate content type from HTTP headers</returns>
    public static async Task<FileExtractionResult> ExtractFileInfoAsync(
        string url,
        HttpClient httpClient,
        string? fallbackExtension = null,
        CancellationToken cancellationToken = default
    )
    {
        var basicResult = ExtractFileInfo(url, fallbackExtension);

        try
        {
            // Try to get content type from HTTP headers
            var request = new HttpRequestMessage(HttpMethod.Head, url);
            var response = await httpClient.SendAsync(request, cancellationToken);

            if (response.IsSuccessStatusCode)
            {
                // Update content type from HTTP headers if available
                if (response.Content.Headers.ContentType?.MediaType != null)
                {
                    basicResult.ContentType = response.Content.Headers.ContentType.MediaType;
                }

                // Try to get filename from Content-Disposition header
                var contentDisposition = response.Content.Headers.ContentDisposition;
                if (contentDisposition?.FileName != null)
                {
                    var headerFileName = contentDisposition.FileName.Trim('"');
                    if (IsValidFileName(headerFileName))
                    {
                        basicResult.FileName = SanitizeFileName(headerFileName);
                        basicResult.IsGeneratedName = false;

                        // Update content type based on the filename from header
                        var extension = Path.GetExtension(headerFileName).ToLowerInvariant();
                        if (MimeTypeMap.TryGetValue(extension, out var mimeType))
                        {
                            basicResult.ContentType = mimeType;
                        }
                    }
                }
            }
        }
        catch (Exception)
        {
            // If HTTP request fails, just return the basic result
            // We don't want to fail the entire operation because of network issues
        }

        return basicResult;
    }

    /// <summary>
    /// Determines if a string looks like a valid filename.
    /// </summary>
    private static bool IsValidFileName(string fileName)
    {
        if (string.IsNullOrWhiteSpace(fileName))
            return false;

        // Must contain a dot and have at least one character before and after the dot
        var dotIndex = fileName.LastIndexOf('.');
        if (dotIndex <= 0 || dotIndex >= fileName.Length - 1)
            return false;

        var extension = fileName.Substring(dotIndex + 1);

        // Extension should be 1-10 characters and contain only alphanumeric characters
        return extension.Length >= 1
            && extension.Length <= 10
            && Regex.IsMatch(extension, @"^[a-zA-Z0-9]+$");
    }

    /// <summary>
    /// Sanitizes a filename by removing or replacing invalid characters.
    /// </summary>
    private static string SanitizeFileName(string fileName)
    {
        if (string.IsNullOrWhiteSpace(fileName))
            return "file";

        // Remove http:// and https:// prefixes if they exist
        if (fileName.StartsWith("http://", StringComparison.OrdinalIgnoreCase))
            fileName = fileName.Substring(7);
        else if (fileName.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
            fileName = fileName.Substring(8);

        // Remove invalid path characters
        var invalidChars = Path.GetInvalidFileNameChars();
        var sanitized = string.Join(
            "_",
            fileName.Split(invalidChars, StringSplitOptions.RemoveEmptyEntries)
        );

        // Ensure it's not empty and not too long
        if (string.IsNullOrWhiteSpace(sanitized))
            return "file";

        if (sanitized.Length > 255)
            sanitized = sanitized.Substring(0, 255);

        return sanitized;
    }

    /// <summary>
    /// Gets the content type for a file extension.
    /// </summary>
    private static string GetContentTypeFromExtension(string extension)
    {
        if (string.IsNullOrWhiteSpace(extension))
            return "application/octet-stream";

        extension = extension.ToLowerInvariant();
        if (!extension.StartsWith("."))
            extension = "." + extension;

        return MimeTypeMap.TryGetValue(extension, out var contentType)
            ? contentType
            : "application/octet-stream";
    }

    /// <summary>
    /// Creates a fallback result with a generated filename.
    /// </summary>
    private static FileExtractionResult CreateFallbackResult(string? url, string? fallbackExtension)
    {
        var hash = GenerateRandomHash();
        var extension = string.IsNullOrWhiteSpace(fallbackExtension)
            ? ""
            : (fallbackExtension.StartsWith(".") ? fallbackExtension : "." + fallbackExtension);

        var fileName = hash + extension;
        var contentType = GetContentTypeFromExtension(extension);

        return new FileExtractionResult
        {
            FileName = fileName,
            ContentType = contentType,
            IsGeneratedName = true,
            OriginalUrl = url,
        };
    }

    /// <summary>
    /// Generates a random hash string for use as a filename.
    /// </summary>
    private static string GenerateRandomHash()
    {
        using var rng = RandomNumberGenerator.Create();
        var bytes = new byte[16]; // 128 bits
        rng.GetBytes(bytes);

        // Convert to hex string
        var sb = new StringBuilder();
        foreach (var b in bytes)
        {
            sb.Append(b.ToString("x2"));
        }

        return sb.ToString();
    }

    /// <summary>
    /// Gets all supported file extensions.
    /// </summary>
    public static IReadOnlyCollection<string> GetSupportedExtensions()
    {
        return MimeTypeMap.Keys.ToList().AsReadOnly();
    }

    /// <summary>
    /// Checks if a file extension is supported for content type detection.
    /// </summary>
    public static bool IsExtensionSupported(string extension)
    {
        if (string.IsNullOrWhiteSpace(extension))
            return false;

        extension = extension.ToLowerInvariant();
        if (!extension.StartsWith("."))
            extension = "." + extension;

        return MimeTypeMap.ContainsKey(extension);
    }
}
