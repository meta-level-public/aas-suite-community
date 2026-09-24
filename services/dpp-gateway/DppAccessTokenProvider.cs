using System.Collections.Concurrent;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace DppGateway;

public sealed class DppAccessTokenProvider(IHttpClientFactory httpClientFactory)
{
    private readonly ConcurrentDictionary<string, CachedToken> _tokens = new(
        StringComparer.Ordinal
    );

    public async Task<string?> GetAccessTokenAsync(
        DppOAuthOptions options,
        string? subjectToken,
        CancellationToken cancellationToken
    )
    {
        if (!options.Enabled)
            return null;

        var useTokenExchange =
            options.TokenExchangeEnabled && !string.IsNullOrWhiteSpace(subjectToken);
        var cacheKey = useTokenExchange
            ? $"{options.TokenEndpoint}\n{options.ClientId}\nexchange\n{HashToken(subjectToken!)}"
            : $"{options.TokenEndpoint}\n{options.ClientId}\n{options.Scope}";
        if (
            _tokens.TryGetValue(cacheKey, out var cached)
            && cached.ExpiresAt > DateTimeOffset.UtcNow.AddSeconds(30)
        )
            return cached.AccessToken;

        using var request = new HttpRequestMessage(HttpMethod.Post, options.TokenEndpoint)
        {
            Content = new FormUrlEncodedContent(CreateTokenRequest(options, subjectToken)),
        };
        using var response = await httpClientFactory
            .CreateClient("dpp-oauth")
            .SendAsync(request, cancellationToken);
        response.EnsureSuccessStatusCode();
        using var payload = JsonDocument.Parse(
            await response.Content.ReadAsStringAsync(cancellationToken)
        );
        var token = payload.RootElement.GetProperty("access_token").GetString();
        if (string.IsNullOrWhiteSpace(token))
            throw new InvalidOperationException(
                "The OAuth token response contains no access token."
            );
        var expiresIn = payload.RootElement.TryGetProperty("expires_in", out var expires)
            ? expires.GetInt32()
            : 60;
        _tokens[cacheKey] = new CachedToken(token, DateTimeOffset.UtcNow.AddSeconds(expiresIn));
        return token;
    }

    private static string HashToken(string token) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));

    private static Dictionary<string, string> CreateTokenRequest(
        DppOAuthOptions options,
        string? subjectToken
    )
    {
        var values = new Dictionary<string, string>
        {
            ["client_id"] = options.ClientId,
            ["client_secret"] = options.ClientSecret,
        };
        if (options.TokenExchangeEnabled && !string.IsNullOrWhiteSpace(subjectToken))
        {
            values["grant_type"] = "urn:ietf:params:oauth:grant-type:token-exchange";
            values["subject_token"] = subjectToken;
            values["subject_token_type"] = "urn:ietf:params:oauth:token-type:access_token";
            values["requested_token_type"] = "urn:ietf:params:oauth:token-type:access_token";
            if (!string.IsNullOrWhiteSpace(options.Audience))
                values["audience"] = options.Audience;
        }
        else
        {
            values["grant_type"] = "client_credentials";
        }
        if (!string.IsNullOrWhiteSpace(options.Scope))
            values["scope"] = options.Scope;
        return values;
    }

    private sealed record CachedToken(string AccessToken, DateTimeOffset ExpiresAt);
}
