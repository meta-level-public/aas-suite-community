using System.IO.Compression;
using System.Xml.Linq;

namespace AasDesignerCommon.Utils;

/// <summary>
/// Repairs the <c>[Content_Types].xml</c> of an AASX package.
/// </summary>
/// <remarks>
/// System.IO.Packaging only treats zip entries as parts when their extension (or part name) has a content type in
/// <c>[Content_Types].xml</c>. Packages written by other tools sometimes miss e.g. <c>jpg</c>; reading them then
/// fails with "The relationship ... exists, but the underlying part does not", although the file is in the zip.
/// </remarks>
public static class PackageContentTypesFixUtil
{
    private const string ContentTypesEntryName = "[Content_Types].xml";
    private const string FallbackContentType = "application/octet-stream";

    private static readonly XNamespace ContentTypesNamespace =
        "http://schemas.openxmlformats.org/package/2006/content-types";

    private static readonly Dictionary<string, string> KnownContentTypes = new(
        StringComparer.OrdinalIgnoreCase
    )
    {
        ["rels"] = "application/vnd.openxmlformats-package.relationships+xml",
        ["json"] = "application/json",
        ["xml"] = "text/xml",
        ["aml"] = "text/xml",
        ["png"] = "image/png",
        ["jpg"] = "image/jpeg",
        ["jpeg"] = "image/jpeg",
        ["gif"] = "image/gif",
        ["bmp"] = "image/bmp",
        ["svg"] = "image/svg+xml",
        ["webp"] = "image/webp",
        ["tif"] = "image/tiff",
        ["tiff"] = "image/tiff",
        ["pdf"] = "application/pdf",
        ["txt"] = "text/plain",
        ["csv"] = "text/csv",
        ["html"] = "text/html",
        ["htm"] = "text/html",
        ["zip"] = "application/zip",
        ["mp4"] = "video/mp4",
    };

    /// <summary>
    /// Adds a content type for every zip entry that has none. Packages without <c>[Content_Types].xml</c> and
    /// non-zip streams are left to the package reader.
    /// </summary>
    /// <returns>
    /// The package to read on: <paramref name="ms"/> itself when nothing was missing, otherwise a repaired copy (the
    /// source stream is never written to). <c>Added</c> lists the extensions (Default) or part names (Override).
    /// </returns>
    public static (MemoryStream Stream, IReadOnlyList<string> Added) EnsureContentTypes(
        MemoryStream ms
    )
    {
        try
        {
            XDocument? document;
            List<XElement> missing;

            // Read-only first: rewriting a large package in update mode is expensive and rarely needed
            ms.Seek(0, SeekOrigin.Begin);
            using (var archive = new ZipArchive(ms, ZipArchiveMode.Read, leaveOpen: true))
            {
                document = LoadContentTypes(archive);
                if (document?.Root == null)
                {
                    return (ms, []);
                }

                missing = FindMissingContentTypes(
                    document.Root,
                    archive.Entries.Select(e => e.FullName)
                );
            }

            if (missing.Count == 0)
            {
                return (ms, []);
            }

            document.Root.Add(missing);

            var repaired = new MemoryStream();
            ms.Seek(0, SeekOrigin.Begin);
            ms.CopyTo(repaired);
            repaired.Seek(0, SeekOrigin.Begin);
            using (var archive = new ZipArchive(repaired, ZipArchiveMode.Update, leaveOpen: true))
            {
                archive.GetEntry(ContentTypesEntryName)?.Delete();
                var entry = archive.CreateEntry(ContentTypesEntryName);
                using var stream = entry.Open();
                document.Save(stream);
            }

            repaired.Seek(0, SeekOrigin.Begin);
            var added = missing
                .Select(e =>
                    (string?)e.Attribute("Extension")
                    ?? (string?)e.Attribute("PartName")
                    ?? string.Empty
                )
                .ToList();
            return (repaired, added);
        }
        catch (InvalidDataException)
        {
            // Not a valid zip file: leave it to the package reader to report the error
            return (ms, []);
        }
        finally
        {
            ms.Seek(0, SeekOrigin.Begin);
        }
    }

    private static XDocument? LoadContentTypes(ZipArchive archive)
    {
        var entry = archive.GetEntry(ContentTypesEntryName);
        if (entry == null)
        {
            return null;
        }

        using var stream = entry.Open();
        return XDocument.Load(stream);
    }

    private static List<XElement> FindMissingContentTypes(
        XElement types,
        IEnumerable<string> entryNames
    )
    {
        var defaults = types
            .Elements(ContentTypesNamespace + "Default")
            .Select(e => (string?)e.Attribute("Extension") ?? string.Empty)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);
        var overrides = types
            .Elements(ContentTypesNamespace + "Override")
            .Select(e => (string?)e.Attribute("PartName") ?? string.Empty)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var missing = new List<XElement>();
        foreach (var name in entryNames)
        {
            if (name.EndsWith('/') || name == ContentTypesEntryName)
            {
                continue;
            }

            var partName = "/" + name.TrimStart('/');
            if (overrides.Contains(partName))
            {
                continue;
            }

            var extension = Path.GetExtension(name).TrimStart('.');
            if (extension.Length == 0)
            {
                overrides.Add(partName);
                missing.Add(
                    new XElement(
                        ContentTypesNamespace + "Override",
                        new XAttribute("PartName", partName),
                        new XAttribute("ContentType", FallbackContentType)
                    )
                );
            }
            else if (defaults.Add(extension))
            {
                missing.Add(
                    new XElement(
                        ContentTypesNamespace + "Default",
                        new XAttribute("Extension", extension.ToLowerInvariant()),
                        new XAttribute(
                            "ContentType",
                            KnownContentTypes.GetValueOrDefault(extension, FallbackContentType)
                        )
                    )
                );
            }
        }

        return missing;
    }
}
