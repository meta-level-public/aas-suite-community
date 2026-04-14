using AasCore.Aas3_1;

namespace AasDesignerCommon.Registry;

public class ProtocolInformation
{
    public required string Href { get; set; }
    public string? EndpointProtocol { get; set; }
    public List<string>? EndpointProtocolVersion { get; set; }
    public string? Subprotocol { get; set; }
    public string? SubprotocolBody { get; set; }
    public string? SubprotocolBodyEncoding { get; set; }
    public object? SecurityAttributes { get; set; }
}

public class ProtocolInformationSecurityAttribute
{
    public required ProtocolInformationSecurityAttributeType Type { get; set; }
    public required string Key { get; set; }
    public required string Value { get; set; }
}

public enum ProtocolInformationSecurityAttributeType
{
    NONE,
    RFC_TLSA,
    W3C_DID,
}

public class Endpoint
{
    public string Interface { get; set; } = "AAS-3.0";
    public ProtocolInformation? ProtocolInformation { get; set; }
}

public class SubmodelDescriptor
{
    public List<LangStringTextType>? Description { get; set; }
    public List<LangStringNameType>? DisplayName { get; set; }
    public MyAdministrativeInformation? Administration { get; set; }
    public string? IdShort { get; set; }
    public required string Id { get; set; }
    public MyReference? SemanticId { get; set; }
    public List<MyReference>? SupplementalSemanticIds { get; set; }
    public required List<Endpoint> Endpoints { get; set; }
}

public class AssetAdministrationShellDescriptor
{
    public List<LangStringTextType>? Description { get; set; }
    public List<LangStringNameType>? DisplayName { get; set; }
    public MyAdministrativeInformation? Administration { get; set; }
    public AssetKind AssetKind { get; set; }
    public string? AssetType { get; set; }
    public required List<Endpoint> Endpoints { get; set; }
    public string? GlobalAssetId { get; set; }
    public string? IdShort { get; set; }
    public required string Id { get; set; }
    public List<MySpecificAssetId>? SpecificAssetIds { get; set; }
    public List<SubmodelDescriptor>? SubmodelDescriptors { get; set; }
}

public class MyAdministrativeInformation
{
    public MyAdministrativeInformation(IAdministrativeInformation? administration)
    {
        if (administration == null)
            return;
        EmbeddedDataSpecifications = administration
            .EmbeddedDataSpecifications?.Cast<EmbeddedDataSpecification>()
            .ToList();
        if (administration.Creator != null)
        {
            var refObj = new MyReference(administration.Creator);
            if (refObj != null)
                Creator = refObj;
        }

        Revision = administration.Revision;
        TemplateId = administration.TemplateId;
        Version = administration.Version;
    }

    public List<EmbeddedDataSpecification>? EmbeddedDataSpecifications { get; set; }
    public string? Version { get; set; }
    public string? Revision { get; set; }
    public MyReference? Creator { get; set; }
    public string? TemplateId { get; set; }
}

public class MySpecificAssetId
{
    public MySpecificAssetId(ISpecificAssetId specificAssetId)
    {
        if (specificAssetId == null)
            return;
        SemanticId = new MyReference(specificAssetId.SemanticId);
        Name = specificAssetId.Name;
        Value = specificAssetId.Value;
        ExternalSubjectId = new MyReference(specificAssetId.ExternalSubjectId);
    }

    public MyReference? SemanticId { get; set; }
    public List<MyReference>? SupplementalSemanticIds { get; set; }
    public string? Name { get; set; }
    public string? Value { get; set; }
    public MyReference? ExternalSubjectId { get; set; }
}

public class MyReference
{
    public MyReference(IReference? externalSubjectId)
    {
        if (externalSubjectId == null || externalSubjectId.Keys == null)
            return;
        Type = externalSubjectId.Type;
        ReferredSemanticId = (MyReference?)externalSubjectId.ReferredSemanticId;
        Keys = externalSubjectId.Keys?.Cast<Key>().ToList();
    }

    public ReferenceTypes Type { get; set; }
    public MyReference? ReferredSemanticId { get; set; }
    public List<Key>? Keys { get; set; }
}
