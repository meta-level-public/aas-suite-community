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
        // Discovery befüllen
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

        if (aas.AssetInformation.GlobalAssetId != null)
        {
            try
            {
                var globalElem = new DiscoveryElement
                {
                    name = "globalAssetId",
                    value = aas.AssetInformation.GlobalAssetId,
                };
                var discoveryJsonString = JsonConvert.SerializeObject(globalElem);
                var discoveryResponse = await client.PostAsync(
                    discoveryUrl,
                    new StringContent(discoveryJsonString, Encoding.UTF8, "application/json"),
                    cancellationToken
                );
            }
            catch (Exception e)
            {
                Console.WriteLine("Error saving discovery: " + e.Message);
            }
        }

        foreach (var id in aas.AssetInformation.SpecificAssetIds ?? [])
        {
            var globalElem = new DiscoveryElement { name = id.Name, value = id.Value };
            var discoveryJsonString = JsonConvert.SerializeObject(globalElem);
            try
            {
                var discoveryResponse = await client.PostAsync(
                    discoveryUrl,
                    new StringContent(discoveryJsonString, Encoding.UTF8, "application/json"),
                    cancellationToken
                );
            }
            catch (Exception e)
            {
                Console.WriteLine("Error saving discovery: " + e.Message);
            }
        }
    }

    public static async Task RemoveFromDiscovery(
        string discoveryService,
        string aasId,
        CancellationToken cancellationToken,
        HttpClient client
    )
    {
        // Discovery befüllen
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
