namespace AasDesignerApi.Authorization.Model;

using System.ComponentModel.DataAnnotations;

public class AuthenticateRequest
{
    [Required]
    public string Username { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;

    [Required]
    public bool AcceptPrivacy { get; set; } = false;
}
