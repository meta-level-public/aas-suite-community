namespace AasDesignerApi.Model;

/// <summary>
/// Which AAS attribute should be checked via regex for automatic marketplace approval.
/// </summary>
public enum MarktRegexTargetAttribute
{
    /// <summary>AAS-Shell-ID (id)</summary>
    ShellId,

    /// <summary>AAS idShort</summary>
    IdShort,

    /// <summary>globalAssetId from AssetInformation</summary>
    GlobalAssetId,

    /// <summary>Value of a SpecificAssetId entry (optionally filtered by name)</summary>
    SpecificAssetIdValue,

    /// <summary>SemanticId eines Submodells</summary>
    SubmodelSemanticId,
}

/// <summary>
/// Configured regex approval rule for the marketplace. Defines which AAS from an
/// infrastructure are automatically published in the marketplace.
/// </summary>
public sealed class MarktRegexFreigabe
{
    public Guid Id { get; set; }

    /// <summary>Loose FK zu Organisation.Id (same DB, no EF navigation).</summary>
    public long OrganisationId { get; set; }

    /// <summary>Loose FK zu AasInfrastructureSettings.Id (same DB, no EF navigation).</summary>
    public long AasInfrastrukturId { get; set; }

    /// <summary>Human-readable name of the rule.</summary>
    public required string Label { get; set; }

    /// <summary>Which attribute of the AAS shell should be checked via regex.</summary>
    public MarktRegexTargetAttribute TargetAttribute { get; set; }

    /// <summary>
    /// Nur relevant wenn TargetAttribute == SpecificAssetIdValue:
    /// Filter on the name of the SpecificAssetId entry (equality comparison, not regex).
    /// If null: regex is checked against all SpecificAssetId values (OR semantics).
    /// </summary>
    public string? SpecificAssetIdName { get; set; }

    /// <summary>.NET regex pattern (validated on save).</summary>
    public required string RegexPattern { get; set; }

    /// <summary>Whether the rule is active. Inactive rules are not executed.</summary>
    public bool IsActive { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public required string CreatedBy { get; set; }

    public DateTimeOffset? LastRunAt { get; set; }

    /// <summary>
    /// Result of the last sync run, e.g. "OK:12added,2removed" or "InfraUnreachable".
    /// </summary>
    public string? LastRunResult { get; set; }

    public ICollection<MarktListing> AutoManagedListings { get; set; } = [];

    public ICollection<MarktListingRuleMatch> ListingMatches { get; set; } = [];
}
