using System.Text;
using System.Text.Json.Nodes;
using AasCore.Aas3.Package;
using AasDesignerApi.Model;
using AasDesignerCommon.Model;
using Microsoft.Extensions.Logging;

namespace AasDesignerAasApi.Shells;

public class AasxPackager
{
    public static MemoryStream CreateAasxPackage(
        AasCore.Aas3_1.Environment env,
        List<AasFileContent> files,
        string exportMode,
        string metamodelVersion,
        AppUser appUser,
        ILogger logger
    )
    {
        var packaging = new Packaging();
        var ms = new MemoryStream();
        using (var pkg = packaging.Create(ms))
        {
            var thumb = files.FirstOrDefault(f => f.IsThumbnail);
            // nur nicht-HTTP-Links
            if (thumb != null && !thumb.Path.StartsWith("http"))
            {
                CreateThumbnail(thumb, pkg, appUser);
            }

            var exportAsV30 = IsV30Format(metamodelVersion);
            Part? aasxPart = exportAsV30
                ? CreateAasxPartV30(env, exportMode, pkg)
                : CreateAasxPartV31(env, exportMode, pkg);

            files
                .Where(f => !f.IsThumbnail)
                .ToList()
                .ForEach(f =>
                {
                    var file = FileLoader.LoadFile(f, appUser);
                    if (file != null && file.Length > 0)
                    {
                        CreateFile(pkg, file, f, aasxPart, logger);
                    }
                });
            pkg.Flush();
        }

        return ms;
    }

    private static Part CreateAasxPartV31(
        AasCore.Aas3_1.Environment environment,
        string exportMode,
        PackageReadWrite pkg
    )
    {
        if (exportMode == "JSON")
        {
            return CreateAasxJson(environment, pkg);
        }

        return CreateAasxXml(environment, pkg);
    }

    private static Part CreateAasxPartV30(
        AasCore.Aas3_1.Environment environment,
        string exportMode,
        PackageReadWrite pkg
    )
    {
        var env30 = ConvertToV30(environment);
        if (exportMode == "JSON")
        {
            return CreateAasxJson(env30, pkg);
        }

        return CreateAasxXml(env30, pkg);
    }

    private static Part CreateAasxXml(AasCore.Aas3_1.Environment environment, PackageReadWrite pkg)
    {
        var aasxUri = new Uri("/aasx/data.xml", UriKind.Relative);

        var outputBuilder = new StringBuilder();

        using var writer = System.Xml.XmlWriter.Create(
            outputBuilder,
            new System.Xml.XmlWriterSettings() { Encoding = Encoding.UTF8 }
        );

        AasCore.Aas3_1.Xmlization.Serialize.To(environment, writer);
        writer.Flush();

        var content = outputBuilder.ToString() ?? string.Empty;
        content = content.Replace("utf-16", "utf-8");
        // TODO: Remove this hack, Prüfen, wieso überhaupt utf-16 drin steht

        var part = pkg.PutPart(aasxUri, "text/xml", Encoding.UTF8.GetBytes(content));

        pkg.MakeSpec(part);

        return part;
    }

    private static Part CreateAasxXml(AasCore.Aas3_0.Environment environment, PackageReadWrite pkg)
    {
        var aasxUri = new Uri("/aasx/data.xml", UriKind.Relative);

        var outputBuilder = new StringBuilder();

        using var writer = System.Xml.XmlWriter.Create(
            outputBuilder,
            new System.Xml.XmlWriterSettings() { Encoding = Encoding.UTF8 }
        );

        AasCore.Aas3_0.Xmlization.Serialize.To(environment, writer);
        writer.Flush();

        var content = outputBuilder.ToString() ?? string.Empty;
        content = content.Replace("utf-16", "utf-8");

        var part = pkg.PutPart(aasxUri, "text/xml", Encoding.UTF8.GetBytes(content));
        pkg.MakeSpec(part);
        return part;
    }

    private static Part CreateAasxJson(AasCore.Aas3_1.Environment environment, PackageReadWrite pkg)
    {
        var aasxUri = new Uri("/aasx/data.json", UriKind.Relative);

        var content = AasCore.Aas3_1.Jsonization.Serialize.ToJsonObject(environment).ToString();

        var part = pkg.PutPart(aasxUri, "text/xml", Encoding.UTF8.GetBytes(content));

        pkg.MakeSpec(part);

        return part;
    }

    private static Part CreateAasxJson(AasCore.Aas3_0.Environment environment, PackageReadWrite pkg)
    {
        var aasxUri = new Uri("/aasx/data.json", UriKind.Relative);
        var content = AasCore.Aas3_0.Jsonization.Serialize.ToJsonObject(environment).ToString();
        var part = pkg.PutPart(aasxUri, "text/xml", Encoding.UTF8.GetBytes(content));
        pkg.MakeSpec(part);
        return part;
    }

    private static AasCore.Aas3_0.Environment ConvertToV30(AasCore.Aas3_1.Environment environment)
    {
        try
        {
            var jsonString = AasCore
                .Aas3_1.Jsonization.Serialize.ToJsonObject(environment)
                .ToJsonString();
            var jsonNode =
                JsonNode.Parse(jsonString)
                ?? throw new InvalidOperationException("Could not parse environment JSON.");
            return AasCore.Aas3_0.Jsonization.Deserialize.EnvironmentFrom(jsonNode);
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException(
                "Export in AAS metamodel 3.0 is not possible for this shell. It likely contains 3.1-only structures.",
                ex
            );
        }
    }

    private static bool IsV30Format(string? metamodelVersion)
    {
        var normalized = metamodelVersion?.Trim().ToLowerInvariant();
        return normalized == "3.0" || normalized == "v3.0" || normalized == "v3_0";
    }

    private static void CreateThumbnail(
        AasFileContent? thumb,
        PackageReadWrite pkg,
        AppUser appUser
    )
    {
        if (thumb != null)
        {
            var thumbFile = FileLoader.LoadFile(thumb, appUser);
            if (thumbFile != null && thumbFile.Length > 0)
            {
                var thumbnail = pkg.PutPart(
                    CreatePackagePartUri(thumb.Path),
                    thumb.ContentType,
                    thumbFile
                );
                pkg.MakeThumbnail(thumbnail);
            }
            else
            {
                CreateDefaultThumbnail(pkg);
            }
        }
        else
        {
            CreateDefaultThumbnail(pkg);
        }
    }

    private static void CreateDefaultThumbnail(PackageReadWrite pkg)
    {
        var path = Path.Combine("Packaging", "Thumbnail.png");
        using (FileStream fileStream = new FileStream(path, FileMode.Open, FileAccess.Read))
        {
            var thumbnail = pkg.PutPart(
                new Uri("/aasx/files/Thumbnail.png", UriKind.Relative),
                "image/png",
                fileStream
            );
            pkg.MakeThumbnail(thumbnail);
        }
    }

    private static void CreateFile(
        PackageReadWrite pkg,
        Stream file,
        AasFileContent fileContent,
        Part aasxPart,
        ILogger logger
    )
    {
        var uriString = fileContent.Path.Trim();
        if (Uri.TryCreate(uriString, UriKind.Absolute, out var absoluteUri))
        {
            uriString = absoluteUri.AbsolutePath;
        }

        uriString = uriString
            .Replace("file:///aasx", "/aasx", StringComparison.OrdinalIgnoreCase)
            .Replace("file:/aasx", "/aasx", StringComparison.OrdinalIgnoreCase)
            .Split('#')[0]
            .Split('?')[0]
            .Replace('\\', '/');

        if (!uriString.StartsWith("/aasx/files/", StringComparison.OrdinalIgnoreCase))
        {
            var safeFileName = Path.GetFileName(uriString);
            if (string.IsNullOrWhiteSpace(safeFileName))
            {
                safeFileName = Path.GetFileName(fileContent.Filename);
            }
            if (string.IsNullOrWhiteSpace(safeFileName))
            {
                safeFileName = "file";
            }

            uriString = "/aasx/files/" + safeFileName;
            logger.LogWarning(
                "File path was not under /aasx/files/, adjusted to: {UriString}",
                uriString
            );
        }

        var uri = CreatePackagePartUri(uriString);
        var part = pkg.PutPart(uri, fileContent.ContentType, file);

        pkg.RelateSupplementaryToSpec(part, aasxPart);
    }

    private static Uri CreatePackagePartUri(string rawPath)
    {
        var normalized = rawPath.Trim().Replace('\\', '/');
        if (!normalized.StartsWith('/'))
        {
            normalized = "/" + normalized.TrimStart('/');
        }

        var escapedSegments = normalized
            .Split('/', StringSplitOptions.RemoveEmptyEntries)
            .Select(segment => Uri.EscapeDataString(Uri.UnescapeDataString(segment)));

        return new Uri("/" + string.Join('/', escapedSegments), UriKind.Relative);
    }
}
