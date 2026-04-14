using AasCore.Aas3.Package;
using AasDesignerCommon.Packaging;
using AasDesignerCommon.Packaging.Model;
using AasDesignerCommon.Utils;

namespace AasDesignerApi.Packaging
{
    public class AASXPackager
    {
        public AasxPackage ReadPackage(string path, bool readContent = true)
        {
            using var file = File.OpenRead(path);
            var ms = new MemoryStream();
            file.CopyTo(ms);

            var fixedMs =
                OriginFixUtil.CheckAndFixPackageOrigin(ms)
                ?? throw new InvalidOperationException("Could not normalize package origin.");

            return PackagingUtil.ReadPackage(fixedMs, readContent);
        }
    }
}
