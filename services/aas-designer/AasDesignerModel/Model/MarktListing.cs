namespace AasDesignerApi.Model;

/// <summary>An AAS listing published in the marketplace.</summary>
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
    /// If set: this listing was automatically published by the specified regex approval rule
    /// and is managed by the sync job.
    /// If null: the listing was published manually.
    /// </summary>
    public Guid? AutoManagedByRuleId { get; set; }

    public MarktRegexFreigabe? AutoManagedByRule { get; set; }

    public ICollection<MarktListingSubmodel> Submodels { get; set; } = [];

    public ICollection<MarktListingSpecificAssetId> SpecificAssetIds { get; set; } = [];

    /// <summary>
    /// Currently matching regex approval rules for this listing (also for manually published
    /// listings). Serves as a hint flag in the UI.
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
/// Updated by the sync job (also for manually published listings).
/// </summary>
public sealed class MarktListingRuleMatch
{
    public Guid ListingId { get; set; }

    public MarktListing Listing { get; set; } = null!;

    public Guid RuleId { get; set; }

    public MarktRegexFreigabe Rule { get; set; } = null!;
}
