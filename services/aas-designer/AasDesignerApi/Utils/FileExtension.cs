using Microsoft.AspNetCore.StaticFiles;

namespace AasDesignerApi.Utils
{
    public class FileExtension
    {
        public static bool IsFileFromExtensionType(
            string fileName,
            string fileExtension,
            string contentType
        )
        {
            FileExtensionContentTypeProvider provider = new();
            AddOrUpdateMapping(provider, fileExtension, contentType);
            return provider.TryGetContentType(fileName, out _);
        }

        private static void AddOrUpdateMapping(
            FileExtensionContentTypeProvider provider,
            string fileExtension,
            string contentType
        )
        {
            if (!provider.Mappings.TryGetValue(fileExtension, out var _))
            {
                provider.Mappings.Add(fileExtension, contentType);
            }
            else
            {
                provider.Mappings[fileExtension] = contentType;
            }
        }
    }
}
