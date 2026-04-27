namespace AasShared.Model;

public static class AuthRoles
{
    public const string BENUTZER = "BENUTZER";
    public const string SYSTEM_ADMIN = "SYSTEM_ADMIN";
    public const string SYSTEM_HELP_EDITOR = "SYSTEM_HELP_EDITOR";
    public const string ORGA_ADMIN = "ORGA_ADMIN";
    public const string ORGA_HELP_EDITOR = "ORGA_HELP_EDITOR";
    public const string VIEWER_NUTZER = "VIEWER_NUTZER";
    public const string FEED_MAPPING_USER = "FEED_MAPPING_USER";
    public const string MARKT_PUBLISHER = "MARKT_PUBLISHER";
    public const string INTERNAL_SYSTEM_USER = "INTERNAL_SYSTEM_USER";

    public static List<string> GetRoles()
    {
        return
        [
            BENUTZER,
            ORGA_ADMIN,
            FEED_MAPPING_USER,
            MARKT_PUBLISHER,
            VIEWER_NUTZER,
            ORGA_HELP_EDITOR,
        ];
    }
}
