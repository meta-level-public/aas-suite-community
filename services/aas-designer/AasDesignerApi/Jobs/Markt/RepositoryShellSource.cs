using System.Runtime.CompilerServices;
using System.Text.Json.Nodes;
using AasDesignerModel.Model;

namespace AasDesignerApi.Jobs.Markt;

/// <summary>
/// Lädt Shell-Scan-Einträge direkt aus dem AAS Repository via GET /shells.
/// Paginierung: cursor-basiert aus paging_metadata.cursor (AAS API Part 2).
/// </summary>
public sealed class RepositoryShellSource : IShellDescriptorSource
{
    private const int PageSize = 100;

    public async IAsyncEnumerable<ShellScanEntry> ScanAsync(
        AasInfrastructureSettings infrastructure,
        HttpClient httpClient,
        [EnumeratorCancellation] CancellationToken cancellationToken
    )
    {
        var baseUrl = infrastructure.AasRepositoryUrl!.TrimEnd('/');
        string? cursor = null;

        while (!cancellationToken.IsCancellationRequested)
        {
            var url = cursor is null
                ? $"{baseUrl}/shells?$top={PageSize}"
                : $"{baseUrl}/shells?$top={PageSize}&$cursor={Uri.EscapeDataString(cursor)}";

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
                var entry = MapShell(item);
                if (entry is not null)
                    yield return entry;
            }

            cursor = node["paging_metadata"]?["cursor"]?.GetValue<string>();
            if (string.IsNullOrWhiteSpace(cursor) || items.Count < PageSize)
                yield break;
        }
    }

    private static ShellScanEntry? MapShell(JsonNode shell)
    {
        var id = shell["id"]?.GetValue<string>();
        if (string.IsNullOrWhiteSpace(id))
            return null;

        var assetInfo = shell["assetInformation"];
        var globalAssetId = assetInfo?["globalAssetId"]?.GetValue<string>();
        var assetKind = ExtractAssetKindString(assetInfo?["assetKind"]);

        var specificAssetIds = new List<(string Name, string Value)>();
        var specificArray = assetInfo?["specificAssetIds"]?.AsArray();
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
        var submodelRefs = shell["submodels"]?.AsArray();
        // Im Repository-Shell sind Submodel-Referenzen vorhanden, aber keine SemanticIds.
        // SemanticIds sind nur in den eigentlichen Submodel-Objekten – wir überspringen sie hier.

        return new ShellScanEntry
        {
            ShellId = id,
            IdShort = shell["idShort"]?.GetValue<string>(),
            GlobalAssetId = globalAssetId,
            AssetKind = assetKind,
            SpecificAssetIds = specificAssetIds,
            SubmodelSemanticIds = semanticIds,
            DisplayNameDe = ExtractLangString(shell["displayName"], "de"),
            DisplayNameEn = ExtractLangString(shell["displayName"], "en"),
            DescriptionDe = ExtractLangString(shell["description"], "de"),
            DescriptionEn = ExtractLangString(shell["description"], "en"),
            ThumbnailPath = assetInfo?["defaultThumbnail"]?["path"]?.GetValue<string>(),
        };
    }

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
