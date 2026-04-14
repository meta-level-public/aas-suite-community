using Newtonsoft.Json;

namespace AasShared.Model;

public class Apikey
{
    public long Id { get; set; }
    public Guid Key { get; set; } = Guid.Empty;
    public DateTime? ValidUntil { get; set; }
    public bool Active { get; set; }
    public string Notice { get; set; } = string.Empty;
    public List<string> Scopes { get; set; } = [];
    public long? OrganisationId { get; set; }
    public long? AasInfrastructureSettingsId { get; set; }
    public long? BenutzerId { get; set; }
}
