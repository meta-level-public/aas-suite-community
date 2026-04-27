using System.Text;
using System.Text.Json.Nodes;
using AasCore.Aas3.Package;

namespace AasDesignerCommon.AasxPackaging;

/// <summary>
/// Erstellt ein AASX-Paket aus einer AAS-Umgebung ohne Filesystem-Zugriff und ohne Thumbnail.
/// Wird vom Markt-Service für den anonymen AASX-Download verwendet.
/// </summary>
public static class AasxEnvironmentPackager
{
    /// <summary>
    /// Serialisiert die übergebene Umgebung in ein AASX-Paket und gibt den Stream zurück.
    /// </summary>
    public static MemoryStream CreatePackage(
        AasCore.Aas3_1.Environment env,
        string exportMode,
        string metamodelVersion
    )
    {
        var packaging = new AasCore.Aas3.Package.Packaging();
        var ms = new MemoryStream();
        using (var pkg = packaging.Create(ms))
        {
            var exportAsV30 = IsV30Format(metamodelVersion);
            _ = exportAsV30
                ? CreateAasxPartV30(env, exportMode, pkg)
                : CreateAasxPartV31(env, exportMode, pkg);
            pkg.Flush();
        }

        ms.Seek(0, SeekOrigin.Begin);
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
}
