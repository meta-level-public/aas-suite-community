using System.IO.Packaging;

namespace AasDesignerApi.Import.AasxParser
{
    public interface IAasxParser
    {
        object? GetAasxObject(Package package, out List<string> errorMessages);
    }
}
