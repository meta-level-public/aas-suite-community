using AasCore.Aas3_1;

namespace AasDesignerAasApi.Shells;

public static class FilePathForExportModifier
{
    public static void ModifyFilePathForExport(AasCore.Aas3_1.Environment env)
    {
        env.Submodels?.ForEach(sm =>
        {
            if (sm.SubmodelElements != null)
                ModifyFilesRecursively(sm.SubmodelElements);
        });

        env.AssetAdministrationShells?.ForEach(aas =>
        {
            if (aas.AssetInformation == null || aas.AssetInformation.DefaultThumbnail == null)
                return;
            aas.AssetInformation.DefaultThumbnail.Path = GetFixedPath(
                aas.AssetInformation.DefaultThumbnail.Path
            );
        });
    }

    private static void ModifyFilesRecursively(List<ISubmodelElement> smElements)
    {
        smElements.ForEach(smEl =>
        {
            if (smEl is SubmodelElementCollection submodelElementCollection)
            {
                if (submodelElementCollection.Value != null)
                    ModifyFilesRecursively(submodelElementCollection.Value);
            }
            if (smEl is SubmodelElementList submodelElementList)
            {
                if (submodelElementList.Value != null)
                    ModifyFilesRecursively(submodelElementList.Value);
            }
            if (smEl is AasCore.Aas3_1.File smFile)
            {
                if (
                    !string.IsNullOrWhiteSpace(smFile.Value)
                    && !string.IsNullOrWhiteSpace(smEl.IdShort)
                )
                {
                    smFile.Value = GetFixedPath(smFile.Value);
                }
            }
        });
    }

    private static string GetFixedPath(string? path)
    {
        if (
            !string.IsNullOrWhiteSpace(path)
            && !path.StartsWith("/aasx/files/")
            && !path.StartsWith("http")
        )
        {
            path = "/aasx/files/" + path;
        }

        return path ?? string.Empty;
    }
}
