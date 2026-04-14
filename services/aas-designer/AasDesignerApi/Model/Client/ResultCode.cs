namespace AasDesignerApi.Model.Client
{
    public enum ResultCode
    {
        UNBEKANNT,
        BENUTZER_EXISTIERT_BEREITS,
        OK,
        ACCOUNT_NICHT_AKTIVIERT,
        EMAIL_NICHT_BESTAETIGT,
        BENUTZERNAME_PASSWORT_FALSCH,
        KEINE_VWS_DATEN_ENTHALTEN,
        NO_TOKEN_FOUND,
        ERROR,
        USER_NOT_FOUND,
        INVALID_TOKEN,
        EXPIRED_TOKEN,
        NO_VALID_ROLES,
        NO_MORE_USERS_ALLOWED,
        NO_EMAIL_FOUND,
        DATENSCHUTZ_NOT_ACCEPTED,
    }
}
