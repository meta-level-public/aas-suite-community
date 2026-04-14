using System.Runtime.Serialization;
using System.Text;
using Newtonsoft.Json;

namespace IO.Swagger.Model
{
    /// <summary>
    ///
    /// </summary>
    [DataContract]
    public class ProtocolInformation
    {
        /// <summary>
        /// Gets or Sets Href
        /// </summary>
        [DataMember(Name = "href", EmitDefaultValue = false)]
        [JsonProperty(PropertyName = "href")]
        public string Href { get; set; } = string.Empty;

        /// <summary>
        /// Gets or Sets EndpointProtocol
        /// </summary>
        [DataMember(Name = "endpointProtocol", EmitDefaultValue = false)]
        [JsonProperty(PropertyName = "endpointProtocol")]
        public string EndpointProtocol { get; set; } = string.Empty;

        /// <summary>
        /// Gets or Sets EndpointProtocolVersion
        /// </summary>
        [DataMember(Name = "endpointProtocolVersion", EmitDefaultValue = false)]
        [JsonProperty(PropertyName = "endpointProtocolVersion")]
        public List<string> EndpointProtocolVersion { get; set; } = [];

        /// <summary>
        /// Gets or Sets Subprotocol
        /// </summary>
        [DataMember(Name = "subprotocol", EmitDefaultValue = false)]
        [JsonProperty(PropertyName = "subprotocol")]
        public string Subprotocol { get; set; } = string.Empty;

        /// <summary>
        /// Gets or Sets SubprotocolBody
        /// </summary>
        [DataMember(Name = "subprotocolBody", EmitDefaultValue = false)]
        [JsonProperty(PropertyName = "subprotocolBody")]
        public string SubprotocolBody { get; set; } = string.Empty;

        /// <summary>
        /// Gets or Sets SubprotocolBodyEncoding
        /// </summary>
        [DataMember(Name = "subprotocolBodyEncoding", EmitDefaultValue = false)]
        [JsonProperty(PropertyName = "subprotocolBodyEncoding")]
        public string SubprotocolBodyEncoding { get; set; } = string.Empty;

        /// <summary>
        /// Gets or Sets SecurityAttributes
        /// </summary>
        [DataMember(Name = "securityAttributes", EmitDefaultValue = false)]
        [JsonProperty(PropertyName = "securityAttributes")]
        public List<ProtocolInformationSecurityAttributes> SecurityAttributes { get; set; } = [];

        /// <summary>
        /// Get the string presentation of the object
        /// </summary>
        /// <returns>String presentation of the object</returns>
        public override string ToString()
        {
            var sb = new StringBuilder();
            sb.Append("class IOSwaggerRegistryLibV3ModelsProtocolInformation {\n");
            sb.Append("  Href: ").Append(Href).Append("\n");
            sb.Append("  EndpointProtocol: ").Append(EndpointProtocol).Append("\n");
            sb.Append("  EndpointProtocolVersion: ").Append(EndpointProtocolVersion).Append("\n");
            sb.Append("  Subprotocol: ").Append(Subprotocol).Append("\n");
            sb.Append("  SubprotocolBody: ").Append(SubprotocolBody).Append("\n");
            sb.Append("  SubprotocolBodyEncoding: ").Append(SubprotocolBodyEncoding).Append("\n");
            sb.Append("  SecurityAttributes: ").Append(SecurityAttributes).Append("\n");
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
