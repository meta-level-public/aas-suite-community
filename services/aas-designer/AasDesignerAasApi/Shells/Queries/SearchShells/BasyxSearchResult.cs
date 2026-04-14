namespace AasDesignerAasApi.Shells.Queries.SearchShells
{
    public class BasyxSearchResult
    {
        public List<AssetAdministrationShellDescriptor> Hits { get; set; } = [];
        public int Total { get; set; }
    }

    public class Key
    {
        public string Type { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
    }

    public class Creator
    {
        public string Type { get; set; } = string.Empty;
        public List<Key> Keys { get; set; } = [];
        public object? ReferredSemanticId { get; set; }
    }

    public class Administration
    {
        public object? EmbeddedDataSpecifications { get; set; }
        public string Version { get; set; } = string.Empty;
        public string Revision { get; set; } = string.Empty;
        public Creator Creator { get; set; } = new();
        public object? TemplateId { get; set; }
    }

    public class ProtocolInformation
    {
        public string Href { get; set; } = string.Empty;
        public string EndpointProtocol { get; set; } = string.Empty;
        public object? EndpointProtocolVersion { get; set; }
        public object? Subprotocol { get; set; }
        public object? SubprotocolBody { get; set; }
        public object? SubprotocolBodyEncoding { get; set; }
        public object? SecurityAttributes { get; set; }
    }

    public class Endpoint
    {
        public string Interface { get; set; } = string.Empty;
        public ProtocolInformation ProtocolInformation { get; set; } = new();
    }

    public class AssetAdministrationShellDescriptor
    {
        public object? Description { get; set; }
        public object? DisplayName { get; set; }
        public object? Extensions { get; set; }
        public Administration Administration { get; set; } = new();
        public string AssetKind { get; set; } = string.Empty;
        public object? AssetType { get; set; }
        public List<Endpoint> Endpoints { get; set; } = [];
        public string GlobalAssetId { get; set; } = string.Empty;
        public string IdShort { get; set; } = string.Empty;
        public string Id { get; set; } = string.Empty;
        public object? SpecificAssetIds { get; set; }
        public object? SubmodelDescriptors { get; set; }
    }
}
