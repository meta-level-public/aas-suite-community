namespace AasDesignerApi.Authorization;

public interface IJwtUtils
{
    long? ValidateJwtToken(string token);
    Task<long?> ValidateExternalJwtToken(string token, string orgaId);
}
