using System.Text;
using AasCore.Aas3_1;
using AasDesignerCommon.Utils;
using Newtonsoft.Json;

namespace AasDesignerCommon.Shells;

public class DiscoveryUpdater
{
    public static async Task UpdateDiscoveryAsync(
        string discoveryService,
        AssetAdministrationShell aas,
        CancellationToken cancellationToken,
        HttpClient client
    )
    {
        // populate discovery
        var discoveryUrl =
            discoveryService.AppendSlash()
            + "lookup/shells/"
            + aas.Id.ToBase64UrlEncoded(Encoding.UTF8);
        try
        {
            var discoveryDeleteResponse = await client.DeleteAsync(discoveryUrl, cancellationToken);
        }
        catch (Exception e)
        {
            Console.WriteLine("Error deleting discovery: " + e.Message);
        }

        // The discovery API expects all asset links of a shell as one array;
        // every POST replaces the previously stored links.
        var assetLinks = BuildAssetLinks(aas.AssetInformation);
        if (assetLinks.Count == 0)
        {
            return;
        }

        try
        {
            var discoveryJsonString = JsonConvert.SerializeObject(assetLinks);
            var discoveryResponse = await client.PostAsync(
                discoveryUrl,
                new StringContent(discoveryJsonString, Encoding.UTF8, "application/json"),
                cancellationToken
            );
            if (!discoveryResponse.IsSuccessStatusCode)
            {
                Console.WriteLine("Error saving discovery: " + discoveryResponse.StatusCode);
            }
        }
        catch (Exception e)
        {
            Console.WriteLine("Error saving discovery: " + e.Message);
        }
    }

    private static List<DiscoveryElement> BuildAssetLinks(IAssetInformation assetInformation)
    {
        var assetLinks = new List<DiscoveryElement>();
        if (!string.IsNullOrWhiteSpace(assetInformation.GlobalAssetId))
        {
            assetLinks.Add(
                new DiscoveryElement
                {
                    name = "globalAssetId",
                    value = assetInformation.GlobalAssetId,
                }
            );
        }

        foreach (var id in assetInformation.SpecificAssetIds ?? [])
        {
            assetLinks.Add(new DiscoveryElement { name = id.Name, value = id.Value });
        }

        return assetLinks;
    }

    public static async Task RemoveFromDiscovery(
        string discoveryService,
        string aasId,
        CancellationToken cancellationToken,
        HttpClient client
    )
    {
        // populate discovery
        var discoveryUrl =
            discoveryService.AppendSlash()
            + "lookup/shells/"
            + aasId.ToBase64UrlEncoded(Encoding.UTF8);
        try
        {
            var discoveryDeleteResponse = await client.DeleteAsync(discoveryUrl, cancellationToken);
        }
        catch (Exception e)
        {
            Console.WriteLine("Error deleting discovery: " + e.Message);
        }
    }
}

public class DiscoveryElement
{
    public string name { get; set; } = string.Empty;
    public string value { get; set; } = string.Empty;
}
