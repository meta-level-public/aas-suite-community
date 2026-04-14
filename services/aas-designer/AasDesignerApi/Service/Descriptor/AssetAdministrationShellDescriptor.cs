using System.Runtime.Serialization;
using System.Text;
using AasCore.Aas3_1;
using Newtonsoft.Json;

namespace IO.Swagger.Model
{
    /// <summary>
    ///
    /// </summary>
    [DataContract]
    public class AssetAdministrationShellDescriptor
    {
        /// <summary>
        /// Gets or Sets Administration
        /// </summary>
        [DataMember(Name = "administration", EmitDefaultValue = false)]
        [JsonProperty(PropertyName = "administration")]
        public AdministrativeInformation? Administration { get; set; }

        /// <summary>
        /// Gets or Sets AssetKind
        /// </summary>
        [DataMember(Name = "assetKind", EmitDefaultValue = false)]
        [JsonProperty(PropertyName = "assetKind")]
        public AssetKind AssetKind { get; set; }

        /// <summary>
        /// Gets or Sets AssetType
        /// </summary>
        [DataMember(Name = "assetType", EmitDefaultValue = false)]
        [JsonProperty(PropertyName = "assetType")]
        public string AssetType { get; set; } = string.Empty;

        /// <summary>
        /// Gets or Sets Endpoints
        /// </summary>
        [DataMember(Name = "endpoints", EmitDefaultValue = false)]
        [JsonProperty(PropertyName = "endpoints")]
        public List<Endpoint> Endpoints { get; set; } = [];

        /// <summary>
        /// Gets or Sets GlobalAssetId
        /// </summary>
        [DataMember(Name = "globalAssetId", EmitDefaultValue = false)]
        [JsonProperty(PropertyName = "globalAssetId")]
        public string GlobalAssetId { get; set; } = string.Empty;

        /// <summary>
        /// Gets or Sets IdShort
        /// </summary>
        [DataMember(Name = "idShort", EmitDefaultValue = false)]
        [JsonProperty(PropertyName = "idShort")]
        public string IdShort { get; set; } = string.Empty;

        /// <summary>
        /// Gets or Sets Id
        /// </summary>
        [DataMember(Name = "id", EmitDefaultValue = false)]
        [JsonProperty(PropertyName = "id")]
        public string Id { get; set; } = string.Empty;

        /// <summary>
        /// Gets or Sets SpecificAssetIds
        /// </summary>
        [DataMember(Name = "specificAssetIds", EmitDefaultValue = false)]
        [JsonProperty(PropertyName = "specificAssetIds")]
        public List<ISpecificAssetId> SpecificAssetIds { get; set; } = [];

        /// <summary>
        /// Gets or Sets SubmodelDescriptors
        /// </summary>
        [DataMember(Name = "submodelDescriptors", EmitDefaultValue = false)]
        [JsonProperty(PropertyName = "submodelDescriptors")]
        public List<SubmodelDescriptor> SubmodelDescriptors { get; set; } = [];

        /// <summary>
        /// Gets or Sets Description
        /// </summary>
        [DataMember(Name = "description", EmitDefaultValue = false)]
        [JsonProperty(PropertyName = "description")]
        public List<ILangStringTextType> Description { get; set; } = [];

        /// <summary>
        /// Gets or Sets DisplayName
        /// </summary>
        [DataMember(Name = "displayName", EmitDefaultValue = false)]
        [JsonProperty(PropertyName = "displayName")]
        public List<ILangStringNameType> DisplayName { get; set; } = [];

        /// <summary>
        /// Gets or Sets Extensions
        /// </summary>
        [DataMember(Name = "extensions", EmitDefaultValue = false)]
        [JsonProperty(PropertyName = "extensions")]
        public List<IExtension> Extensions { get; set; } = [];

        /// <summary>
        /// Get the string presentation of the object
        /// </summary>
        /// <returns>String presentation of the object</returns>
        public override string ToString()
        {
            var sb = new StringBuilder();
            sb.Append("class IOSwaggerRegistryLibV3ModelsAssetAdministrationShellDescriptor {\n");
            sb.Append("  Administration: ").Append(Administration).Append("\n");
            sb.Append("  AssetKind: ").Append(AssetKind).Append("\n");
            sb.Append("  AssetType: ").Append(AssetType).Append("\n");
            sb.Append("  Endpoints: ").Append(Endpoints).Append("\n");
            sb.Append("  GlobalAssetId: ").Append(GlobalAssetId).Append("\n");
            sb.Append("  IdShort: ").Append(IdShort).Append("\n");
            sb.Append("  Id: ").Append(Id).Append("\n");
            sb.Append("  SpecificAssetIds: ").Append(SpecificAssetIds).Append("\n");
            sb.Append("  SubmodelDescriptors: ").Append(SubmodelDescriptors).Append("\n");
            sb.Append("  Description: ").Append(Description).Append("\n");
            sb.Append("  DisplayName: ").Append(DisplayName).Append("\n");
            sb.Append("  Extensions: ").Append(Extensions).Append("\n");
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
