using System.Text;
using AasCore.Aas3_1;
using AasDesignerCommon.Shells;
using AasDesignerCommon.Utils;
using AasDesignerModel.Model;

namespace AasDesignerCommon.Registry;

public class DescriptorUpdater
{
    public static void UpdateAasDescriptor(
        AssetAdministrationShellDescriptor aasDescriptor,
        EditorDescriptor editorDescriptor,
        IAssetAdministrationShell aas,
        List<Submodel> submodels
    )
    {
        aasDescriptor.Id = aas.Id;
        aasDescriptor.IdShort = aas.IdShort;
        aasDescriptor.DisplayName = aas.DisplayName?.Cast<LangStringNameType>().ToList();
        aasDescriptor.Description = aas.Description?.Cast<LangStringTextType>().ToList();
        aasDescriptor.AssetKind = aas.AssetInformation?.AssetKind ?? default;
        aasDescriptor.AssetType = aas.AssetInformation?.AssetType;
        aasDescriptor.GlobalAssetId = aas.AssetInformation?.GlobalAssetId;
        aasDescriptor.SpecificAssetIds = aas
            .AssetInformation?.SpecificAssetIds?.Select(specificAssetId => new MySpecificAssetId(
                specificAssetId
            ))
            .ToList();
        aasDescriptor.Administration =
            aas.Administration != null ? new MyAdministrativeInformation(aas.Administration) : null;

        aasDescriptor.SubmodelDescriptors ??= [];
        var activeSubmodelIds = submodels.Select(submodel => submodel.Id).ToHashSet();
        aasDescriptor.SubmodelDescriptors.RemoveAll(smDescriptor =>
        {
            var matchingEntry = FindDescriptorEntry(
                editorDescriptor.SubmodelDescriptorEntries,
                smDescriptor.Id
            );
            var activeId = matchingEntry?.NewId ?? smDescriptor.Id;
            return !activeSubmodelIds.Contains(activeId);
        });

        foreach (var submodel in submodels)
        {
            var editorDescriptorEntry = FindDescriptorEntry(
                editorDescriptor.SubmodelDescriptorEntries,
                submodel.Id
            );
            var existingDescriptor = aasDescriptor.SubmodelDescriptors.FirstOrDefault(
                smDescriptor => MatchesDescriptor(smDescriptor, submodel.Id, editorDescriptorEntry)
            );

            if (existingDescriptor != null)
            {
                UpdateSubmodelDescriptor(existingDescriptor, submodel, editorDescriptorEntry);
                continue;
            }

            if (editorDescriptorEntry == null)
            {
                continue;
            }

            aasDescriptor.SubmodelDescriptors.Add(
                DescriptorCreator.CreateSubmodelDescriptorWithFullUrl(
                    submodel,
                    GetDesiredEndpointHref(editorDescriptorEntry)
                )
            );
        }

        aasDescriptor.Endpoints ??= [];
        UpdateEndpointList(aasDescriptor.Endpoints, editorDescriptor.AasDescriptorEntry, "AAS-3.0");
    }

    public static void UpdateSubmodelDescriptor(
        SubmodelDescriptor smDescriptor,
        Submodel submodel,
        EditorDescriptorEntry? editorDescriptorEntry
    )
    {
        smDescriptor.Id = submodel.Id;
        smDescriptor.IdShort = submodel.IdShort;
        smDescriptor.DisplayName = submodel.DisplayName?.Cast<LangStringNameType>().ToList();
        smDescriptor.Description = submodel.Description?.Cast<LangStringTextType>().ToList();
        smDescriptor.SemanticId = new MyReference(submodel.SemanticId);
        smDescriptor.SupplementalSemanticIds = submodel
            .SupplementalSemanticIds?.Select(supplmentalSemanticId => new MyReference(
                supplmentalSemanticId
            ))
            .ToList();

        smDescriptor.Endpoints ??= [];
        if (editorDescriptorEntry != null)
        {
            UpdateEndpointList(smDescriptor.Endpoints, editorDescriptorEntry, "SUBMODEL-3.0");
        }
    }

    public static string GetDesiredEndpointHref(EditorDescriptorEntry entry)
    {
        var endpoint = NormalizeEndpointUrl(entry.Endpoint);
        if (string.IsNullOrWhiteSpace(endpoint) || entry.OldId == entry.NewId)
        {
            return endpoint;
        }

        return ReplaceEncodedId(endpoint, entry.OldId, entry.NewId);
    }

    private static EditorDescriptorEntry? FindDescriptorEntry(
        IEnumerable<EditorDescriptorEntry> entries,
        string identifier
    )
    {
        return entries.FirstOrDefault(entry =>
            string.Equals(entry.NewId, identifier, StringComparison.Ordinal)
            || string.Equals(entry.OldId, identifier, StringComparison.Ordinal)
        );
    }

    private static bool MatchesDescriptor(
        SubmodelDescriptor smDescriptor,
        string submodelId,
        EditorDescriptorEntry? editorDescriptorEntry
    )
    {
        if (smDescriptor.Id == submodelId)
        {
            return true;
        }

        if (editorDescriptorEntry == null)
        {
            return false;
        }

        if (
            string.Equals(smDescriptor.Id, editorDescriptorEntry.OldId, StringComparison.Ordinal)
            || string.Equals(smDescriptor.Id, editorDescriptorEntry.NewId, StringComparison.Ordinal)
        )
        {
            return true;
        }

        var candidateHrefs = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            NormalizeEndpointUrl(editorDescriptorEntry.Endpoint),
            NormalizeEndpointUrl(GetDesiredEndpointHref(editorDescriptorEntry)),
            NormalizeEndpointUrl(GetHistoricalEndpointHref(editorDescriptorEntry)),
        };

        return smDescriptor.Endpoints.Any(endpoint =>
            candidateHrefs.Contains(NormalizeEndpointUrl(endpoint.ProtocolInformation?.Href))
        );
    }

    private static void UpdateEndpointList(
        List<Endpoint> endpoints,
        EditorDescriptorEntry entry,
        string descriptorInterface
    )
    {
        var desiredHref = GetDesiredEndpointHref(entry);
        if (string.IsNullOrWhiteSpace(desiredHref))
        {
            return;
        }

        var matchCandidates = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            NormalizeEndpointUrl(entry.Endpoint),
            NormalizeEndpointUrl(desiredHref),
            NormalizeEndpointUrl(GetHistoricalEndpointHref(entry)),
        };

        var matchingEndpoint = endpoints.FirstOrDefault(endpoint =>
            matchCandidates.Contains(NormalizeEndpointUrl(endpoint.ProtocolInformation?.Href))
        );

        if (matchingEndpoint == null)
        {
            if (
                endpoints.All(endpoint =>
                    !string.Equals(
                        NormalizeEndpointUrl(endpoint.ProtocolInformation?.Href),
                        NormalizeEndpointUrl(desiredHref),
                        StringComparison.OrdinalIgnoreCase
                    )
                )
            )
            {
                endpoints.Add(CreateEndpoint(desiredHref, descriptorInterface));
            }

            return;
        }

        matchingEndpoint.Interface = descriptorInterface;
        matchingEndpoint.ProtocolInformation ??= new ProtocolInformation { Href = desiredHref };
        matchingEndpoint.ProtocolInformation.Href = desiredHref;
        matchingEndpoint.ProtocolInformation.EndpointProtocol = GetEndpointProtocol(
            desiredHref,
            matchingEndpoint.ProtocolInformation.EndpointProtocol
        );
    }

    private static Endpoint CreateEndpoint(string href, string descriptorInterface)
    {
        return new Endpoint
        {
            Interface = descriptorInterface,
            ProtocolInformation = new ProtocolInformation
            {
                Href = href,
                EndpointProtocol = GetEndpointProtocol(href),
            },
        };
    }

    private static string GetHistoricalEndpointHref(EditorDescriptorEntry entry)
    {
        var endpoint = NormalizeEndpointUrl(entry.Endpoint);
        if (string.IsNullOrWhiteSpace(endpoint) || entry.OldId == entry.NewId)
        {
            return endpoint;
        }

        return ReplaceEncodedId(endpoint, entry.NewId, entry.OldId);
    }

    private static string ReplaceEncodedId(string endpoint, string sourceId, string targetId)
    {
        if (string.IsNullOrWhiteSpace(endpoint) || string.IsNullOrWhiteSpace(sourceId))
        {
            return endpoint;
        }

        var sourceIdBase64 = sourceId.ToBase64UrlEncoded(Encoding.UTF8);
        var targetIdBase64 = targetId.ToBase64UrlEncoded(Encoding.UTF8);
        return endpoint.Replace(sourceIdBase64, targetIdBase64, StringComparison.Ordinal);
    }

    private static string NormalizeEndpointUrl(string? endpoint)
    {
        return (endpoint ?? string.Empty).Replace("//", "/").Replace(":/", "://");
    }

    private static string GetEndpointProtocol(string href, string? fallback = null)
    {
        if (href.Contains("://", StringComparison.Ordinal))
        {
            return href.Split("://")[0];
        }

        if (!string.IsNullOrWhiteSpace(fallback))
        {
            return fallback.Split("://")[0];
        }

        return "https";
    }

    public static Endpoint CreateSmEndpoint(string baseHref, string id)
    {
        return new Endpoint()
        {
            Interface = "SUBMODEL-3.0",
            ProtocolInformation = new ProtocolInformation()
            {
                Href = baseHref + id.ToBase64UrlEncoded(Encoding.UTF8),
                // EndpointProtocol = baseHref.Split("://")[0] + "://",
                EndpointProtocol = baseHref.Split("://")[0],
            },
        };
    }

    public static Endpoint CreateAasEndpoint(string baseHref, string id)
    {
        return new Endpoint()
        {
            Interface = "AAS-3.0",
            ProtocolInformation = new ProtocolInformation()
            {
                Href = baseHref + id.ToBase64UrlEncoded(Encoding.UTF8),
                // EndpointProtocol = baseHref.Split("://")[0] + "://",
                EndpointProtocol = baseHref.Split("://")[0],
            },
        };
    }
}
