namespace AasDesignerApi.Model;

/// <summary>
/// Welches AAS-Attribut soll per Regex für die automatische Markt-Freigabe geprüft werden.
/// </summary>
public enum MarktRegexTargetAttribute
{
    /// <summary>AAS-Shell-ID (id)</summary>
    ShellId,

    /// <summary>AAS idShort</summary>
    IdShort,

    /// <summary>globalAssetId aus AssetInformation</summary>
    GlobalAssetId,

    /// <summary>Wert eines SpecificAssetId-Eintrags (optional gefiltert nach Name)</summary>
    SpecificAssetIdValue,

    /// <summary>SemanticId eines Submodells</summary>
    SubmodelSemanticId,
}

/// <summary>
/// Konfigurierte Regex-Freigaberegel für den Markt. Definiert, welche AAS aus einer
/// Infrastruktur automatisch im Markt publiziert werden.
/// </summary>
public sealed class MarktRegexFreigabe
{
    public Guid Id { get; set; }

    /// <summary>Loose FK zu Organisation.Id (same DB, no EF navigation).</summary>
    public long OrganisationId { get; set; }

    /// <summary>Loose FK zu AasInfrastructureSettings.Id (same DB, no EF navigation).</summary>
    public long AasInfrastrukturId { get; set; }

    /// <summary>Menschenlesbarer Name der Regel.</summary>
    public required string Label { get; set; }

    /// <summary>Welches Attribut der AAS-Shell soll per Regex geprüft werden.</summary>
    public MarktRegexTargetAttribute TargetAttribute { get; set; }

    /// <summary>
    /// Nur relevant wenn TargetAttribute == SpecificAssetIdValue:
    /// Filter auf den Namen des SpecificAssetId-Eintrags (Gleichheitsvergleich, kein Regex).
    /// Wenn null: Regex wird gegen alle SpecificAssetId-Werte geprüft (OR-Semantik).
    /// </summary>
    public string? SpecificAssetIdName { get; set; }

    /// <summary>.NET-Regex-Pattern (wird beim Speichern validiert).</summary>
    public required string RegexPattern { get; set; }

    /// <summary>Ob die Regel aktiv ist. Inaktive Regeln werden nicht ausgeführt.</summary>
    public bool IsActive { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public required string CreatedBy { get; set; }

    public DateTimeOffset? LastRunAt { get; set; }

    /// <summary>
    /// Ergebnis des letzten Sync-Laufs, z.B. "OK:12added,2removed" oder "InfraUnreachable".
    /// </summary>
    public string? LastRunResult { get; set; }

    public ICollection<MarktListing> AutoManagedListings { get; set; } = [];

    public ICollection<MarktListingRuleMatch> ListingMatches { get; set; } = [];
}
