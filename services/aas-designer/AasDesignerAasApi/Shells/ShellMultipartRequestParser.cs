using AasDesignerCommon.Model;
using Microsoft.AspNetCore.Http;

namespace AasDesignerAasApi.Shells;

public static class ShellMultipartRequestParser
{
    public static List<ProvidedFile> ParseProvidedFiles(
        IFormCollection data,
        bool allowUnprefixedFilesAsAdded = false
    )
    {
        var files = new List<ProvidedFile>();

        data.Files.ToList()
            .ForEach(file =>
            {
                files.Add(
                    new ProvidedFile
                    {
                        Filename = file.FileName,
                        Stream = file.OpenReadStream(),
                        Type = GetProvidedFileType(file.Name, allowUnprefixedFilesAsAdded),
                        ContentType = file.ContentType,
                    }
                );
            });

        return files;
    }

    public static ProvidedFileType GetProvidedFileType(
        string formFieldName,
        bool allowUnprefixedFilesAsAdded
    )
    {
        var normalizedName = formFieldName.ToLowerInvariant();
        if (normalizedName.StartsWith("addedfiles"))
        {
            return ProvidedFileType.Added;
        }

        if (normalizedName.StartsWith("deletedfiles"))
        {
            return ProvidedFileType.Deleted;
        }

        if (normalizedName.StartsWith("thumbnailfile"))
        {
            return ProvidedFileType.Thumbnail;
        }

        if (allowUnprefixedFilesAsAdded)
        {
            return ProvidedFileType.Added;
        }

        throw new Exception("Invalid file type");
    }
}
