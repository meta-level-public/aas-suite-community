using Newtonsoft.Json;

namespace AasDesignerAasApi.Shells.Queries.DiscoverShells;

public class BasyxDiscoveryResult
{
    [JsonProperty("paging_metadata")]
    public object? PagingMetadata { get; set; }

    [JsonProperty("result")]
    public List<string> Result { get; set; } = [];
}
