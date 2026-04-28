using System.Runtime.CompilerServices;
using System.Text.Json.Nodes;
using AasDesignerModel.Model;

namespace AasDesignerApi.Jobs.Markt;

/// <summary>
/// Lädt Shell-Scan-Einträge aus dem AAS Registry via GET /shell-descriptors.
/// Paginierung: $top + $skip (offset-basiert, AAS API Part 2).
/// </summary>
public sealed class RegistryDescriptorSource : IShellDescriptorSource
{
    private const int PageSize = 100;

    public async IAsyncEnumerable<ShellScanEntry> ScanAsync(
        AasInfrastructureSettings infrastructure,
        HttpClient httpClient,
        [EnumeratorCancellation] CancellationToken cancellationToken
    )
    {
        var baseUrl = infrastructure.AasRegistryUrl!.TrimEnd('/');
        var skip = 0;

        while (!cancellationToken.IsCancellationRequested)
        {
            var url = $"{baseUrl}/shell-descriptors?$top={PageSize}&$skip={skip}";
            HttpResponseMessage response;
            try
            {
                response = await httpClient.GetAsync(url, cancellationToken);
            }
            catch (Exception)
            {
                yield break;
            }

            if (!response.IsSuccessStatusCode)
                yield break;

            var json = await response.Content.ReadAsStringAsync(cancellationToken);
            var node = JsonNode.Parse(json);
            if (node is null)
                yield break;

            var items = node["result"]?.AsArray() ?? node.AsArray();
            if (items.Count == 0)
                yield break;

            foreach (var item in items)
            {
                if (item is null)
                    continue;
                var entry = MapDescriptor(item);
                if (entry is not null)
                    yield return entry;
            }

            if (items.Count < PageSize)
                yield break;

            skip += PageSize;
        }
    }

    private static ShellScanEntry? MapDescriptor(JsonNode descriptor)
    {
        var id = descriptor["id"]?.GetValue<string>();
        if (string.IsNullOrWhiteSpace(id))
            return null;

        // AAS V3 Shell-Descriptor: assetKind, globalAssetId und specificAssetIds liegen auf Top-Level
        // (nicht in assetInformation – das ist das Format des Repository-Shell-Objekts).
        var globalAssetId = descriptor["globalAssetId"]?.GetValue<string>();
        var assetKind = ExtractAssetKindString(descriptor["assetKind"]);

        var specificAssetIds = new List<(string Name, string Value)>();
        var specificArray = descriptor["specificAssetIds"]?.AsArray();
        if (specificArray is not null)
        {
            foreach (var s in specificArray)
            {
                var name = s?["name"]?.GetValue<string>();
                var value = s?["value"]?.GetValue<string>();
                if (!string.IsNullOrWhiteSpace(name) && !string.IsNullOrWhiteSpace(value))
                    specificAssetIds.Add((name, value));
            }
        }

        var semanticIds = new List<string>();
        var submodelDescriptors = descriptor["submodelDescriptors"]?.AsArray();
        if (submodelDescriptors is not null)
        {
            foreach (var sm in submodelDescriptors)
            {
                var semanticId = ExtractFirstKeyValue(sm?["semanticId"]);
                if (!string.IsNullOrWhiteSpace(semanticId))
                    semanticIds.Add(semanticId);
            }
        }

        return new ShellScanEntry
        {
            ShellId = id,
            IdShort = descriptor["idShort"]?.GetValue<string>(),
            GlobalAssetId = globalAssetId,
            AssetKind = assetKind,
            SpecificAssetIds = specificAssetIds,
            SubmodelSemanticIds = semanticIds,
            DisplayNameDe = ExtractLangString(descriptor["displayName"], "de"),
            DisplayNameEn = ExtractLangString(descriptor["displayName"], "en"),
            DescriptionDe = ExtractLangString(descriptor["description"], "de"),
            DescriptionEn = ExtractLangString(descriptor["description"], "en"),
            ThumbnailPath = descriptor["thumbnail"]?["path"]?.GetValue<string>(),
        };
    }

    private static string? ExtractFirstKeyValue(JsonNode? reference) =>
        reference?["keys"]?.AsArray().FirstOrDefault()?["value"]?.GetValue<string>();

    private static string? ExtractAssetKindString(JsonNode? node)
    {
        if (node is null)
            return null;
        // assetKind kann als Integer (0=Type, 1=Instance, ...) oder als String kommen
        // System.Text.Json parst JSON-Integer als long, daher beide Typen prüfen
        if (node is System.Text.Json.Nodes.JsonValue val)
        {
            if (val.TryGetValue<string>(out var s))
                return s;
            long num = 0;
            if (val.TryGetValue<int>(out var i))
                num = i;
            else if (!val.TryGetValue<long>(out num))
                return null;
            return num switch
            {
                0 => "Type",
                1 => "Instance",
                2 => "Role",
                3 => "NotApplicable",
                _ => num.ToString(),
            };
        }
        return null;
    }

    private static string? ExtractLangString(JsonNode? langStrings, string lang)
    {
        if (langStrings is not JsonArray arr)
            return null;
        foreach (var item in arr)
        {
            if (item?["language"]?.GetValue<string>() == lang)
                return item["text"]?.GetValue<string>();
        }
        return null;
    }
}
