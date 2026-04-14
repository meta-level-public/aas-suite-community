using System.IO.Compression;
using System.Text;

namespace AasDesignerCommon.Utils;

public static class OriginFixUtil
{
    public static MemoryStream? CheckAndFixPackageOrigin(MemoryStream ms)
    {
        var packaging = new AasCore.Aas3.Package.Packaging();

        using var pkgOrErr = packaging.OpenRead(ms);
        try
        {
            var pkg = pkgOrErr.Must();
            var specsByContentType = pkg.SpecsByContentType();
            if (
                !specsByContentType.ContainsKey("application/json")
                && !specsByContentType.ContainsKey("text/xml")
            )
            {
                throw new Exception("no spec found");
            }
        }
        catch (Exception)
        {
            ms.Seek(0, SeekOrigin.Begin);
            using var archive = new ZipArchive(ms, ZipArchiveMode.Update, true);
            var relEntries = archive
                .Entries.Where(e => e.FullName.EndsWith(".rels"))
                .Select(r => r.FullName)
                .ToList();
            relEntries.ForEach(name =>
            {
                var entry = archive.GetEntry(name);

                StringBuilder document;
                if (entry == null)
                {
                    return;
                }

                using (StreamReader reader = new StreamReader(entry.Open()))
                {
                    document = new StringBuilder(reader.ReadToEnd());
                }

                document.Replace(
                    "http://www.admin-shell.io/aasx/relationships/aasx-origin",
                    "http://admin-shell.io/aasx/relationships/aasx-origin"
                );
                document.Replace(
                    "http://www.admin-shell.io/aasx/relationships/aas-spec",
                    "http://admin-shell.io/aasx/relationships/aas-spec"
                );
                document.Replace(
                    "http://www.admin-shell.io/aasx/relationships/aas-suppl",
                    "http://admin-shell.io/aasx/relationships/aas-suppl"
                );
                entry.Delete();

                var newEntry = archive.CreateEntry(entry.FullName);
                using StreamWriter writer = new StreamWriter(newEntry.Open());
                writer.Write(document);
            });
        }

        ms.Seek(0, SeekOrigin.Begin);
        return ms;
    }
}
