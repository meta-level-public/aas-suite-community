using System.Text;
using AasCore.Aas3_1;
using AasDesignerCommon.Model;
using Microsoft.AspNetCore.StaticFiles;

namespace AasDesignerCommon.Utils;

public static class FilesFromAasResolver
{
    public static List<AasFileContent> GetAllAasFiles(
        AasCore.Aas3_1.Environment env,
        string submodelEndpoint,
        string aasEndpoint
    )
    {
        List<AasFileContent> aasFiles = [];

        if (env.Submodels != null)
        {
            foreach (var sm in env.Submodels)
            {
                var smEndpoint =
                    submodelEndpoint.AppendSlash()
                    + "submodels/"
                    + sm.Id.ToBase64UrlEncoded(Encoding.UTF8).AppendSlash()
                    + "submodel-elements";
                if (sm.SubmodelElements != null)
                {
                    GetAllAasFilesRecursively(
                        sm.SubmodelElements,
                        aasFiles,
                        smEndpoint,
                        string.Empty,
                        sm.Id
                    );
                }
            }
        }

        if (env.AssetAdministrationShells != null)
        {
            foreach (var aas in env.AssetAdministrationShells)
            {
                if (aas.AssetInformation == null || aas.AssetInformation.DefaultThumbnail == null)
                    continue;
                var thumbnailEndpoint =
                    aasEndpoint.AppendSlash()
                    + "shells/"
                    + aas.Id.ToBase64UrlEncoded(Encoding.UTF8).AppendSlash()
                    + "asset-information/thumbnail";
                aasFiles.Add(
                    new AasFileContent
                    {
                        Filename = Path.GetFileName(aas.AssetInformation.DefaultThumbnail.Path),
                        Endpoint = thumbnailEndpoint,
                        ContentType =
                            aas.AssetInformation.DefaultThumbnail.ContentType ?? "image/png",
                        idShortPath = string.Empty,
                        IsThumbnail = true,
                        Path = aas.AssetInformation.DefaultThumbnail.Path,
                        SubmodelId = string.Empty,
                    }
                );
            }
        }

        return aasFiles;
    }

    private static void GetAllAasFilesRecursively(
        List<ISubmodelElement> smElements,
        List<AasFileContent> aasFiles,
        string submodelEndpoint,
        string idShortPath,
        string submodelId,
        bool indexed = false
    )
    {
        var counter = 0; // für verschachtelte Collections/Listen innerhalb einer bereits indexierten Liste
        for (var i = 0; i < smElements.Count; i++)
        {
            var smEl = smElements[i];
            if (smEl is SubmodelElementCollection submodelElementCollection)
            {
                var newPath = idShortPath.AppendIdShortPath(
                    submodelElementCollection.IdShort ?? string.Empty
                );
                if (indexed)
                {
                    newPath = idShortPath.AppendIndexPath(counter);
                    counter++;
                }
                if (submodelElementCollection.Value != null)
                {
                    GetAllAasFilesRecursively(
                        submodelElementCollection.Value,
                        aasFiles,
                        submodelEndpoint,
                        newPath,
                        submodelId,
                        false
                    );
                }
            }
            if (smEl is SubmodelElementList submodelElementList)
            {
                var newPath = idShortPath.AppendIdShortPath(
                    submodelElementList.IdShort ?? string.Empty
                );
                if (indexed)
                {
                    newPath = idShortPath.AppendIndexPath(counter);
                    counter++;
                }
                if (submodelElementList.Value != null)
                {
                    GetAllAasFilesRecursively(
                        submodelElementList.Value,
                        aasFiles,
                        submodelEndpoint,
                        newPath,
                        submodelId,
                        true
                    );
                }
            }
            if (smEl is AasCore.Aas3_1.File smFile)
            {
                if (!string.IsNullOrWhiteSpace(smFile.Value))
                {
                    var endpoint =
                        submodelEndpoint.AppendSlash()
                        + idShortPath.AppendIdShortPath(smEl.IdShort ?? string.Empty).ToUrlEncoded()
                        + "/attachment";
                    if (indexed)
                    {
                        endpoint =
                            submodelEndpoint.AppendSlash()
                            + idShortPath.AppendIndexPath(i).ToUrlEncoded()
                            + "/attachment";
                    }
                    aasFiles.Add(
                        new AasFileContent
                        {
                            Filename = Path.GetFileName(smFile.Value),
                            Endpoint = endpoint,
                            ContentType = GetContentType(smFile),
                            idShortPath = indexed
                                ? idShortPath.AppendIndexPath(i)
                                : idShortPath.AppendIdShortPath(smEl.IdShort ?? string.Empty),
                            IsThumbnail = false,
                            Path = smFile.Value,
                            SubmodelId = submodelId,
                        }
                    );
                }
            }
            if (smEl is AasCore.Aas3_1.Entity entity)
            {
                var newPath = idShortPath.AppendIdShortPath(entity.IdShort ?? string.Empty);
                if (indexed)
                {
                    newPath = idShortPath.AppendIndexPath(counter);
                    counter++;
                }
                if (entity.Statements != null)
                {
                    GetAllAasFilesRecursively(
                        entity.Statements,
                        aasFiles,
                        submodelEndpoint,
                        newPath,
                        submodelId,
                        false
                    );
                }
            }
        }
    }

    private static string GetContentType(AasCore.Aas3_1.File file)
    {
        if (!string.IsNullOrWhiteSpace(file.ContentType))
            return file.ContentType;
        else
        {
            var provider = new FileExtensionContentTypeProvider();
            if (!provider.TryGetContentType(file.Value ?? string.Empty, out var contentType))
            {
                contentType = "application/octet-stream";
            }

            if (string.IsNullOrWhiteSpace(contentType))
                contentType = "application/octet-stream";

            return contentType;
        }
    }
}
