using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace AasShared.Model.AasApi
{
    public class AasxImportResult
    {
        [JsonPropertyName("aasIds")]
        [JsonProperty("aasIds")]
        public List<string>? AasIds { get; set; }

        [JsonPropertyName("packageId")]
        [JsonProperty("packageId")]
        public long PackageId { get; set; }
    }
}
