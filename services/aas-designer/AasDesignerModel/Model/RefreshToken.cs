namespace AasDesignerApi.Model;

using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;

[Owned]
public class RefreshToken
{
    [Key]
    [JsonIgnore]
    public int Id { get; set; }
    public string Token { get; set; } = string.Empty;
    public DateTime Expires { get; set; }
    public DateTime Created { get; set; }
    public string CreatedByIp { get; set; } = string.Empty;
    public DateTime? Revoked { get; set; }
    public string? RevokedByIp { get; set; } = string.Empty;
    public string? ReplacedByToken { get; set; } = string.Empty;
    public string? ReasonRevoked { get; set; } = string.Empty;
    public bool IsExpired => DateTime.UtcNow >= Expires;
    public bool IsRevoked => Revoked != null;
    public bool IsActive => !IsRevoked && !IsExpired;
}
