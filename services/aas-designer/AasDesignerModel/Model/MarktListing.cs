namespace AasDesignerApi.Model;

/// <summary>Ein im Markt veröffentlichtes AAS-Listing.</summary>
public sealed class MarktListing
{
    public Guid Id { get; set; }

    public required string SourceShellId { get; set; }

    public required string Title { get; set; }

    public required string OrganizationName { get; set; }

    public required string Summary { get; set; }

    public string? ViewerUrl { get; set; }

    public long? AasInfrastrukturId { get; set; }

    public required string SourceType { get; set; }

    public bool IsExternal { get; set; }

    /// <summary>Loose FK to Organisation.Id in AasSuiteContext (same DB, no EF navigation).</summary>
    public long? OrganisationId { get; set; }

    /// <summary>Loose FK to Benutzer.Id in AasSuiteContext (same DB, no EF navigation).</summary>
    public long? PublisherId { get; set; }

    public DateTimeOffset PublishedAt { get; set; }

    public string? LastModifiedBy { get; set; }

    public DateTimeOffset LastModifiedAt { get; set; }

    public bool IsFeatured { get; set; }

    public byte[]? ThumbnailData { get; set; }

    public string? ThumbnailContentType { get; set; }

    public string? AssetKind { get; set; }

    public string? GlobalAssetId { get; set; }

    /// <summary>
    /// Wenn gesetzt: dieses Listing wurde durch die angegebene Regex-Freigaberegel automatisch
    /// publiziert und wird durch den Sync-Job verwaltet.
    /// Wenn null: das Listing wurde manuell publiziert.
    /// </summary>
    public Guid? AutoManagedByRuleId { get; set; }

    public MarktRegexFreigabe? AutoManagedByRule { get; set; }

    public ICollection<MarktListingSubmodel> Submodels { get; set; } = [];

    public ICollection<MarktListingSpecificAssetId> SpecificAssetIds { get; set; } = [];

    /// <summary>
    /// Aktuell auf dieses Listing passende Regex-Freigaberegeln (auch für manuell publizierte
    /// Listings). Dient als Hinweis-Flag in der UI.
    /// </summary>
    public ICollection<MarktListingRuleMatch> RuleMatches { get; set; } = [];
}

public sealed class MarktListingSpecificAssetId
{
    public Guid Id { get; set; }

    public Guid ListingId { get; set; }

    public MarktListing Listing { get; set; } = null!;

    public required string Name { get; set; }

    public required string Value { get; set; }
}

public sealed class MarktListingSubmodel
{
    public Guid Id { get; set; }

    public Guid ListingId { get; set; }

    public MarktListing Listing { get; set; } = null!;

    public required string SemanticId { get; set; }
}

/// <summary>
/// Junction-Tabelle: welche Regex-Freigaberegeln passen aktuell auf welche Listings.
/// Wird durch den Sync-Job aktualisiert (auch für manuell publizierte Listings).
/// </summary>
public sealed class MarktListingRuleMatch
{
    public Guid ListingId { get; set; }

    public MarktListing Listing { get; set; } = null!;

    public Guid RuleId { get; set; }

    public MarktRegexFreigabe Rule { get; set; } = null!;
}
