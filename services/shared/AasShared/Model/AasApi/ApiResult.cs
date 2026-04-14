using System.Text.Json.Serialization;
using Newtonsoft.Json;

namespace AasShared.Model.AasApi
{
    public class AasApiResult<T>
    {
        [JsonPropertyName("result")]
        [JsonProperty("result")]
        public T? Result { get; set; }

        [JsonPropertyName("paging_metadata")]
        [JsonProperty("paging_metadata")]
        public PagingMetadata PagingMetadata { get; set; } = new PagingMetadata();
    }

    public class PagingMetadata
    {
        public string? cursor { get; set; }
    }
}
