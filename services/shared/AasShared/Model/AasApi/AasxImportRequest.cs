using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;

namespace AasShared.Model.AasApi
{
    public class AasxImportRequest
    {
        [JsonPropertyName("file")]
        [JsonProperty("file")]
        public IFormFile? File { get; set; }

        [JsonPropertyName("fileName")]
        [JsonProperty("fileName")]
        public string? FileName { get; set; }

        [JsonPropertyName("aasIds")]
        [JsonProperty("aasIds")]
        public List<string>? AasIds { get; set; }
    }
}
