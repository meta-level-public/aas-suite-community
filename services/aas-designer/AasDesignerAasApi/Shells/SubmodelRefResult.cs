using AasCore.Aas3_1;
using Newtonsoft.Json;

namespace AasDesignerAasApi.Shells.Queries.GetContainedSubmodels
{
    public class ResultItem
    {
        public List<Key> Keys { get; set; } = [];
        public string Type { get; set; } = string.Empty;
    }

    public class SubmodelRefResult
    {
        [JsonProperty("paging_metadata")]
        public object? PagingMetadata { get; set; }

        [JsonProperty("result")]
        public List<ResultItem> ResultItem { get; set; } = [];
    }
}
