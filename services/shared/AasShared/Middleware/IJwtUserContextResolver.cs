using AasShared.Model;
using Microsoft.AspNetCore.Http;

namespace AasShared.Middleware;

public interface IJwtUserContextResolver
{
    Task<ResolvedJwtUserContext?> ResolveAsync(
        HttpContext context,
        Dictionary<string, string> claims,
        string token,
        long userId,
        long organisationId
    );
}

public class ResolvedJwtUserContext
{
    public required AppUser AppUser { get; init; }
    public object? CurrentOrganisation { get; init; }
}
