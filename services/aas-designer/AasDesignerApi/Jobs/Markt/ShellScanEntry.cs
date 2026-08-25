namespace AasDesignerApi.Jobs.Markt;

/// <summary>
/// Common DTO for AAS shell scan results, regardless of whether the data
/// aus der Registry (Descriptors) oder direkt aus dem Repository (Shells) kommen.
/// </summary>
public sealed record ShellScanEntry
{
    public required string ShellId { get; init; }
    public string? IdShort { get; init; }
    public string? GlobalAssetId { get; init; }
    public string? AssetKind { get; init; }
    public IReadOnlyList<string> SubmodelSemanticIds { get; init; } = [];
    public IReadOnlyList<(string Name, string Value)> SpecificAssetIds { get; init; } = [];

    // For auto-listing metadata
    public string? DisplayNameDe { get; init; }
    public string? DisplayNameEn { get; init; }
    public string? DescriptionDe { get; init; }
    public string? DescriptionEn { get; init; }
    public string? ThumbnailPath { get; init; }
}
