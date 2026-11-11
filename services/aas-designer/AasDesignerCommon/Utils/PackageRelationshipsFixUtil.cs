using System.IO.Compression;
using System.IO.Packaging;
using System.Xml.Linq;

namespace AasDesignerCommon.Utils;

/// <summary>
/// Repairs the relationship parts (<c>*.rels</c>) of an AASX package.
/// </summary>
/// <remarks>
/// OPC allows relative relationship targets (e.g. <c>Target="aasx/aasx-origin"</c> or <c>Target="../files/a.pdf"</c>),
/// which are resolved against the source part. AasCore.Aas3.Package passes <c>TargetUri</c> unresolved to
/// <c>Package.GetPart</c>, which fails with "Part URI must start with a forward slash" (seen in Siemens packages).
/// Relationships to parts that do not exist in the package (e.g. a missing thumbnail) make reading fail as well and
/// are removed.
/// </remarks>
public static class PackageRelationshipsFixUtil
{
    private const string RelsExtension = ".rels";
    private const string RelsFolder = "_rels/";

    private static readonly XNamespace RelationshipsNamespace =
        "http://schemas.openxmlformats.org/package/2006/relationships";

    private static readonly Uri PackageRootUri = new("/", UriKind.Relative);

    /// <summary>
    /// Rewrites relative internal relationship targets to absolute part names and removes internal relationships
    /// whose target part does not exist. Non-zip streams are left to the package reader.
    /// </summary>
    /// <returns>
    /// The package to read on: <paramref name="ms"/> itself when nothing had to be changed, otherwise a repaired copy
    /// (the source stream is never written to). <c>Changed</c> lists the changed relationships as
    /// <c>"&lt;rels part&gt;: &lt;old target&gt; -&gt; &lt;new target or (removed)&gt;"</c>.
    /// </returns>
    public static (MemoryStream Stream, IReadOnlyList<string> Changed) EnsureAbsoluteTargets(
        MemoryStream ms
    )
    {
        try
        {
            var repairedDocuments = new Dictionary<string, XDocument>();
            var changed = new List<string>();

            // Read-only first: rewriting a large package in update mode is expensive and rarely needed
            ms.Seek(0, SeekOrigin.Begin);
            using (var archive = new ZipArchive(ms, ZipArchiveMode.Read, leaveOpen: true))
            {
                var partNames = archive
                    .Entries.Where(e => !e.FullName.EndsWith('/'))
                    .Select(e => "/" + e.FullName.TrimStart('/'))
                    .ToHashSet(StringComparer.OrdinalIgnoreCase);

                foreach (
                    var entry in archive.Entries.Where(e =>
                        e.FullName.EndsWith(RelsExtension, StringComparison.OrdinalIgnoreCase)
                    )
                )
                {
                    var sourceUri = GetSourceUri(entry.FullName);
                    if (sourceUri == null)
                    {
                        continue;
                    }

                    XDocument document;
                    using (var stream = entry.Open())
                    {
                        document = XDocument.Load(stream);
                    }

                    if (FixRelationships(document, sourceUri, partNames, entry.FullName, changed))
                    {
                        repairedDocuments[entry.FullName] = document;
                    }
                }
            }

            if (repairedDocuments.Count == 0)
            {
                return (ms, []);
            }

            var repaired = new MemoryStream();
            ms.Seek(0, SeekOrigin.Begin);
            ms.CopyTo(repaired);
            repaired.Seek(0, SeekOrigin.Begin);
            using (var archive = new ZipArchive(repaired, ZipArchiveMode.Update, leaveOpen: true))
            {
                foreach (var (name, document) in repairedDocuments)
                {
                    archive.GetEntry(name)?.Delete();
                    var entry = archive.CreateEntry(name);
                    using var stream = entry.Open();
                    document.Save(stream);
                }
            }

            repaired.Seek(0, SeekOrigin.Begin);
            return (repaired, changed);
        }
        catch (Exception e) when (e is InvalidDataException or System.Xml.XmlException)
        {
            // Not a valid zip file or broken rels XML: leave it to the package reader to report the error
            return (ms, []);
        }
        finally
        {
            ms.Seek(0, SeekOrigin.Begin);
        }
    }

    /// <summary>
    /// Maps a rels entry to the part it belongs to: <c>_rels/.rels</c> -> <c>/</c>,
    /// <c>aasx/xml/_rels/content.xml.rels</c> -> <c>/aasx/xml/content.xml</c>.
    /// </summary>
    private static Uri? GetSourceUri(string relsEntryName)
    {
        var name = relsEntryName.TrimStart('/');
        var folderIndex = name.LastIndexOf(RelsFolder, StringComparison.OrdinalIgnoreCase);
        if (folderIndex < 0 || name.IndexOf('/', folderIndex + RelsFolder.Length) >= 0)
        {
            return null;
        }

        var directory = name[..folderIndex];
        var sourceName = name[(folderIndex + RelsFolder.Length)..^RelsExtension.Length];
        if (directory.Length == 0 && sourceName.Length == 0)
        {
            return PackageRootUri;
        }

        return sourceName.Length == 0
            ? null
            : new Uri("/" + directory + sourceName, UriKind.Relative);
    }

    private static bool FixRelationships(
        XDocument document,
        Uri sourceUri,
        HashSet<string> partNames,
        string relsEntryName,
        List<string> changed
    )
    {
        var anyChange = false;
        var relationships = document
            .Root?.Elements(RelationshipsNamespace + "Relationship")
            .ToList();
        foreach (var relationship in relationships ?? [])
        {
            var targetAttribute = relationship.Attribute("Target");
            var target = targetAttribute?.Value;
            if (
                targetAttribute == null
                || string.IsNullOrWhiteSpace(target)
                || string.Equals(
                    (string?)relationship.Attribute("TargetMode"),
                    nameof(TargetMode.External),
                    StringComparison.OrdinalIgnoreCase
                )
                || Uri.TryCreate(target, UriKind.Absolute, out var absolute) && !absolute.IsFile
            )
            {
                continue;
            }

            var partName = ResolvePartName(sourceUri, target);
            if (partName == null)
            {
                continue;
            }

            if (
                !partNames.Contains(Uri.UnescapeDataString(partName))
                && !partNames.Contains(partName)
            )
            {
                relationship.Remove();
                changed.Add($"{relsEntryName}: {target} -> (removed)");
                anyChange = true;
            }
            else if (partName != target)
            {
                targetAttribute.Value = partName;
                changed.Add($"{relsEntryName}: {target} -> {partName}");
                anyChange = true;
            }
        }

        return anyChange;
    }

    private static string? ResolvePartName(Uri sourceUri, string target)
    {
        try
        {
            if (target.StartsWith('/'))
            {
                return target;
            }

            return PackUriHelper
                .ResolvePartUri(sourceUri, new Uri(target, UriKind.Relative))
                .OriginalString;
        }
        catch (Exception e) when (e is ArgumentException or UriFormatException)
        {
            return null;
        }
    }
}
