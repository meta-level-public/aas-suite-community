using System.Text;
using AasCore.Aas3_1;
using AasDesignerCommon.Model;
using Microsoft.AspNetCore.StaticFiles;

namespace AasDesignerCommon.Utils;

public static class ImportFilePathsFixer
{
    public static AasCore.Aas3_1.Environment FixFilePaths(AasCore.Aas3_1.Environment env)
    {
        env.AssetAdministrationShells?.ForEach(aas =>
        {
            if (aas.AssetInformation == null || aas.AssetInformation.DefaultThumbnail == null)
                return;
            aas.AssetInformation.DefaultThumbnail.Path = FixPath(
                aas.AssetInformation.DefaultThumbnail.Path
            );
        });

        env.Submodels?.ForEach(sm =>
        {
            if (sm.SubmodelElements != null)
                FixFilePathsRecursively(sm.SubmodelElements);
        });

        return env;
    }

    private static string FixPath(string path)
    {
        path = path.Replace("file:/aasx/files/", "")
            .Replace("/aasx/files/", "")
            .Replace("/aasx/suppl/", "");
        if (path.StartsWith('/'))
        {
            path = path.Substring(1);
        }

        return path;
    }

    private static void FixFilePathsRecursively(List<ISubmodelElement> smElements)
    {
        smElements.ForEach(smEl =>
        {
            if (smEl is SubmodelElementCollection submodelElementCollection)
            {
                if (submodelElementCollection.Value != null)
                    FixFilePathsRecursively(submodelElementCollection.Value);
            }
            if (smEl is SubmodelElementList submodelElementList)
            {
                if (submodelElementList.Value != null)
                    FixFilePathsRecursively(submodelElementList.Value);
            }
            if (smEl is AasCore.Aas3_1.File smFile)
            {
                if (!string.IsNullOrWhiteSpace(smFile.Value))
                {
                    smFile.Value = FixPath(smFile.Value);
                }
            }
        });
    }
}
