namespace AasShared.Model;

public static class ApiScopes
{
    public const string CREATE_BACKUP = "CREATE_BACKUP";
    public const string RESTORE_BACKUP = "RESTORE_BACKUP";
    public const string CREATE_FROM_MAPPING = "CREATE_FROM_MAPPING";
    public const string AASX_WRITE_API = "AASX_WRITE_API";
    public const string AASX_READ_API = "AASX_READ_API";

    public static List<string> GetOrgaScopes()
    {
        return [CREATE_BACKUP, RESTORE_BACKUP, CREATE_FROM_MAPPING, AASX_WRITE_API, AASX_READ_API];
    }
}
