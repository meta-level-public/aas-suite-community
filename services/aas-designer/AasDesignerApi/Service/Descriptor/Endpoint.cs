using System.Runtime.Serialization;
using System.Text;
using Newtonsoft.Json;

namespace IO.Swagger.Model
{
    /// <summary>
    ///
    /// </summary>
    [DataContract]
    public class Endpoint
    {
        /// <summary>
        /// Gets or Sets _Interface
        /// </summary>
        [DataMember(Name = "interface", EmitDefaultValue = false)]
        [JsonProperty(PropertyName = "interface")]
        public string _Interface { get; set; } = string.Empty;

        /// <summary>
        /// Gets or Sets ProtocolInformation
        /// </summary>
        [DataMember(Name = "protocolInformation", EmitDefaultValue = false)]
        [JsonProperty(PropertyName = "protocolInformation")]
        public ProtocolInformation ProtocolInformation { get; set; } = new();

        /// <summary>
        /// Get the string presentation of the object
        /// </summary>
        /// <returns>String presentation of the object</returns>
        public override string ToString()
        {
            var sb = new StringBuilder();
            sb.Append("class IOSwaggerRegistryLibV3ModelsEndpoint {\n");
            sb.Append("  _Interface: ").Append(_Interface).Append("\n");
            sb.Append("  ProtocolInformation: ").Append(ProtocolInformation).Append("\n");
            sb.Append("}\n");
            return sb.ToString();
        }

        /// <summary>
        /// Get the JSON string presentation of the object
        /// </summary>
        /// <returns>JSON string presentation of the object</returns>
        public string ToJson()
        {
            return JsonConvert.SerializeObject(this, Formatting.Indented);
        }
    }
}
