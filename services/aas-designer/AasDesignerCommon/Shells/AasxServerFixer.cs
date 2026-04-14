using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AasCore.Aas3_1;
using AasDesignerApi.Model;
using AasDesignerCommon.Serialization;
using AasDesignerCommon.Utils;
using AasDesignerModel;

namespace AasDesignerCommon.Shells
{
    public class AasxServerFixer
    {
        public static async Task FixAasxServerSubmodelReferences(
            AppUser appUser,
            IAssetAdministrationShell aas,
            AasCore.Aas3_1.Environment environment,
            IApplicationDbContext context,
            CancellationToken cancellationToken
        )
        {
            var aasLoadedFromServer = await ShellLoader.LoadShellOnly(
                appUser.CurrentInfrastructureSettings,
                aas.Id,
                cancellationToken,
                appUser
            );

            var newSubmodelRefs = new List<IReference>();
            foreach (var smRef in aasLoadedFromServer?.Submodels ?? [])
            {
                if (newSubmodelRefs.Any(x => x.Keys.First().Value == smRef.Keys.First().Value))
                {
                    continue;
                }
                newSubmodelRefs.Add(smRef);
            }

            if (newSubmodelRefs.Count() != aasLoadedFromServer?.Submodels?.Count())
            {
                aas.Submodels = newSubmodelRefs;
                try
                {
                    using var client = HttpClientCreator.CreateHttpClient(appUser);
                    var editorDescriptor = new EditorDescriptor()
                    {
                        AasDescriptorEntry = new EditorDescriptorEntry()
                        {
                            Endpoint =
                                appUser.CurrentInfrastructureSettings.AasRepositoryUrl.AppendSlash()
                                + "shells/"
                                + aas.Id.ToBase64UrlEncoded(Encoding.UTF8),
                            NewId = aas.Id,
                            OldId = aas.Id,
                            IdShort = aas.IdShort ?? "",
                        },
                    };
                    var url =
                        appUser.CurrentInfrastructureSettings.AasRepositoryUrl.AppendSlash()
                        + "shells/"
                        + aas.Id.ToBase64UrlEncoded(Encoding.UTF8);
                    ;

                    var aasJsonString = BasyxSerializer.Serialize(aas);
                    var response = await client.PutAsync(
                        url,
                        new StringContent(aasJsonString, Encoding.UTF8, "application/json"),
                        cancellationToken
                    );
                    var content = await response.Content.ReadAsStringAsync();
                    response.EnsureSuccessStatusCode();
                }
                catch (Exception)
                {
                    // ignorieren
                }
            }
        }
    }
}
