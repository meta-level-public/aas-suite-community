namespace AasDesignerSharedLinksApi.SharedLinks.Commands.CreateSharedLink;

public class CreateSharedLink
{
    public DateTime? Ablaufdatum { get; set; } = null;
    public string Passwort { get; set; } = string.Empty;
    public string AasIdentifier { get; set; } = string.Empty;
    public string Notiz { get; set; } = string.Empty;
}
