using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using AasDesignerApi.Model;
using AasShared.Configuration;

namespace AasDesignerApi.Authorization;

public sealed class KeycloakProvisionedUser
{
    public string UserId { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
}

public sealed class KeycloakRealmMailSettings
{
    public string Host { get; init; } = string.Empty;
    public string Port { get; init; } = string.Empty;
    public string From { get; init; } = string.Empty;
    public string FromDisplayName { get; init; } = string.Empty;
    public string ReplyTo { get; init; } = string.Empty;
    public string ReplyToDisplayName { get; init; } = string.Empty;
    public string User { get; init; } = string.Empty;
    public string Password { get; init; } = string.Empty;
    public bool Auth { get; init; }
    public bool StartTls { get; init; }
    public bool Ssl { get; init; }
}

public class KeycloakAdminService
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    };
    private static readonly TimeSpan StartupProvisioningTimeout = TimeSpan.FromSeconds(90);
    private static readonly TimeSpan StartupProvisioningRetryDelay = TimeSpan.FromSeconds(3);

    private readonly IHttpClientFactory _httpClientFactory;
    private readonly AppSettings _appSettings;

    public KeycloakAdminService(IHttpClientFactory httpClientFactory, AppSettings appSettings)
    {
        _httpClientFactory = httpClientFactory;
        _appSettings = appSettings;
    }

    public bool IsProvisioningEnabled =>
        _appSettings.KeycloakEnabled
        && !string.IsNullOrWhiteSpace(_appSettings.KeycloakIssuer)
        && !string.IsNullOrWhiteSpace(_appSettings.KeycloakAdminClientId)
        && !string.IsNullOrWhiteSpace(_appSettings.KeycloakAdminUsername)
        && !string.IsNullOrWhiteSpace(_appSettings.KeycloakAdminPassword);

    public async Task<KeycloakProvisionedUser?> EnsureUserWithOrganisationRolesAsync(
        string email,
        string firstName,
        string lastName,
        long organisationId,
        IReadOnlyCollection<string> roles,
        string? password = null,
        bool temporaryPassword = false,
        CancellationToken cancellationToken = default
    )
    {
        if (!IsProvisioningEnabled)
        {
            return null;
        }

        var normalizedEmail = email.Trim();
        if (string.IsNullOrWhiteSpace(normalizedEmail))
        {
            throw new InvalidOperationException(
                "Cannot provision Keycloak user without e-mail address."
            );
        }

        var token = await GetAdminTokenAsync(cancellationToken);
        var user = await EnsureUserAsync(
            token,
            normalizedEmail,
            firstName,
            lastName,
            password,
            temporaryPassword,
            cancellationToken
        );

        await SyncOrganisationRoleGroupsAsync(
            token,
            user.Id,
            organisationId,
            roles,
            cancellationToken
        );

        return new KeycloakProvisionedUser { UserId = user.Id, Email = normalizedEmail };
    }

    public async Task<KeycloakProvisionedUser?> EnsureUserWithoutRolesAsync(
        string email,
        string firstName,
        string lastName,
        string? password = null,
        bool temporaryPassword = false,
        CancellationToken cancellationToken = default
    )
    {
        if (!IsProvisioningEnabled)
        {
            return null;
        }

        var normalizedEmail = email.Trim();
        if (string.IsNullOrWhiteSpace(normalizedEmail))
        {
            throw new InvalidOperationException(
                "Cannot provision Keycloak user without e-mail address."
            );
        }

        var token = await GetAdminTokenAsync(cancellationToken);
        var user = await EnsureUserAsync(
            token,
            normalizedEmail,
            firstName,
            lastName,
            password,
            temporaryPassword,
            cancellationToken
        );

        return new KeycloakProvisionedUser { UserId = user.Id, Email = normalizedEmail };
    }

    public async Task SyncOrganisationRolesForUserAsync(
        string email,
        string firstName,
        string lastName,
        long organisationId,
        IReadOnlyCollection<string> roles,
        CancellationToken cancellationToken = default
    )
    {
        await EnsureUserWithOrganisationRolesAsync(
            email,
            firstName,
            lastName,
            organisationId,
            roles,
            null,
            false,
            cancellationToken
        );
    }

    public async Task<bool> WaitUntilReadyAsync(CancellationToken cancellationToken = default)
    {
        if (!IsProvisioningEnabled)
        {
            return false;
        }

        var deadline = DateTime.UtcNow.Add(StartupProvisioningTimeout);
        while (DateTime.UtcNow < deadline)
        {
            cancellationToken.ThrowIfCancellationRequested();

            try
            {
                await GetAdminTokenAsync(cancellationToken);
                return true;
            }
            catch (HttpRequestException) { }
            catch (TaskCanceledException) { }
            catch (InvalidOperationException) { }

            await Task.Delay(StartupProvisioningRetryDelay, cancellationToken);
        }

        return false;
    }

    public async Task<KeycloakRealmMailSettings> GetRealmMailSettingsAsync(
        CancellationToken cancellationToken = default
    )
    {
        if (!IsProvisioningEnabled)
        {
            return new KeycloakRealmMailSettings();
        }

        var token = await GetAdminTokenAsync(cancellationToken);
        var realm = await GetRealmRepresentationAsync(token, cancellationToken);
        return MapRealmMailSettings(realm);
    }

    public async Task UpdateRealmMailSettingsAsync(
        KeycloakRealmMailSettings settings,
        CancellationToken cancellationToken = default
    )
    {
        if (!IsProvisioningEnabled)
        {
            return;
        }

        var token = await GetAdminTokenAsync(cancellationToken);
        var realm = await GetRealmRepresentationAsync(token, cancellationToken);

        realm["smtpServer"] = new JsonObject
        {
            ["host"] = settings.Host,
            ["port"] = settings.Port,
            ["from"] = settings.From,
            ["fromDisplayName"] = settings.FromDisplayName,
            ["replyTo"] = settings.ReplyTo,
            ["replyToDisplayName"] = settings.ReplyToDisplayName,
            ["user"] = settings.User,
            ["password"] = settings.Password,
            ["auth"] = settings.Auth ? "true" : "false",
            ["starttls"] = settings.StartTls ? "true" : "false",
            ["ssl"] = settings.Ssl ? "true" : "false",
        };

        using var response = await SendJsonAsync(
            HttpMethod.Put,
            GetAdminRealmBaseUrl(),
            token,
            realm,
            cancellationToken
        );

        if (response.StatusCode != HttpStatusCode.NoContent)
        {
            var body = await response.Content.ReadAsStringAsync(cancellationToken);
            throw new InvalidOperationException(
                $"Failed to update Keycloak realm SMTP settings ({(int)response.StatusCode}): {body}"
            );
        }
    }

    public async Task SendUpdatePasswordTestEmailAsync(
        string email,
        CancellationToken cancellationToken = default
    )
    {
        if (!IsProvisioningEnabled)
        {
            throw new InvalidOperationException(
                "Keycloak provisioning is not enabled in this environment."
            );
        }

        var normalizedEmail = email.Trim();
        if (string.IsNullOrWhiteSpace(normalizedEmail))
        {
            throw new InvalidOperationException(
                "Cannot send a Keycloak test e-mail without a target e-mail address."
            );
        }

        var token = await GetAdminTokenAsync(cancellationToken);
        var user = await FindUserByEmailAsync(token, normalizedEmail, cancellationToken);
        if (user == null)
        {
            throw new InvalidOperationException(
                $"No Keycloak user with the e-mail address '{normalizedEmail}' was found."
            );
        }

        using var response = await SendJsonAsync(
            HttpMethod.Put,
            $"{GetAdminRealmBaseUrl()}/users/{user.Id}/execute-actions-email",
            token,
            new[] { "UPDATE_PASSWORD" },
            cancellationToken
        );

        if (response.StatusCode != HttpStatusCode.NoContent)
        {
            var body = await response.Content.ReadAsStringAsync(cancellationToken);
            throw new InvalidOperationException(
                $"Failed to send Keycloak test e-mail to {normalizedEmail} ({(int)response.StatusCode}): {body}"
            );
        }
    }

    private async Task<string> GetAdminTokenAsync(CancellationToken cancellationToken)
    {
        var tokenEndpoint =
            $"{GetBaseUrl()}/realms/{_appSettings.KeycloakAdminRealm}/protocol/openid-connect/token";
        using var request = new HttpRequestMessage(HttpMethod.Post, tokenEndpoint)
        {
            Content = new FormUrlEncodedContent(BuildTokenRequestData()),
        };

        using var client = _httpClientFactory.CreateClient();
        using var response = await client.SendAsync(request, cancellationToken);
        var content = await response.Content.ReadAsStringAsync(cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException(
                $"Failed to get Keycloak admin token ({(int)response.StatusCode}): {content}"
            );
        }

        var tokenResponse =
            JsonSerializer.Deserialize<TokenResponse>(content, JsonOptions)
            ?? throw new InvalidOperationException(
                "Could not parse Keycloak admin token response."
            );

        if (string.IsNullOrWhiteSpace(tokenResponse.AccessToken))
        {
            throw new InvalidOperationException(
                "Keycloak admin token response did not contain access_token."
            );
        }

        return tokenResponse.AccessToken;
    }

    private Dictionary<string, string> BuildTokenRequestData()
    {
        var values = new Dictionary<string, string>
        {
            ["client_id"] = _appSettings.KeycloakAdminClientId,
            ["grant_type"] = "password",
            ["username"] = _appSettings.KeycloakAdminUsername,
            ["password"] = _appSettings.KeycloakAdminPassword,
        };

        if (!string.IsNullOrWhiteSpace(_appSettings.KeycloakAdminClientSecret))
        {
            values["client_secret"] = _appSettings.KeycloakAdminClientSecret;
        }

        return values;
    }

    private async Task<UserRepresentation> EnsureUserAsync(
        string adminToken,
        string email,
        string firstName,
        string lastName,
        string? password,
        bool temporaryPassword,
        CancellationToken cancellationToken
    )
    {
        var existingUser = await FindUserByEmailAsync(adminToken, email, cancellationToken);
        if (existingUser == null)
        {
            existingUser = await CreateUserAsync(
                adminToken,
                email,
                firstName,
                lastName,
                password,
                temporaryPassword,
                cancellationToken
            );
        }
        else
        {
            await UpdateUserAsync(
                adminToken,
                existingUser.Id,
                email,
                firstName,
                lastName,
                cancellationToken
            );
            if (!string.IsNullOrWhiteSpace(password))
            {
                await ResetPasswordAsync(
                    adminToken,
                    existingUser.Id,
                    password,
                    temporaryPassword,
                    cancellationToken
                );
            }
        }

        return existingUser;
    }

    private async Task<UserRepresentation?> FindUserByEmailAsync(
        string adminToken,
        string email,
        CancellationToken cancellationToken
    )
    {
        var query = $"email={Uri.EscapeDataString(email)}&exact=true&first=0&max=20";
        var users = await GetAsync<List<UserRepresentation>>(
            adminToken,
            $"{GetAdminRealmBaseUrl()}/users?{query}",
            cancellationToken
        );

        return users?.FirstOrDefault(u =>
            string.Equals(u.Email, email, StringComparison.OrdinalIgnoreCase)
            || string.Equals(u.Username, email, StringComparison.OrdinalIgnoreCase)
        );
    }

    private async Task<UserRepresentation> CreateUserAsync(
        string adminToken,
        string email,
        string firstName,
        string lastName,
        string? password,
        bool temporaryPassword,
        CancellationToken cancellationToken
    )
    {
        var payload = new CreateUserRequest
        {
            Username = email,
            Email = email,
            Enabled = true,
            EmailVerified = true,
            FirstName = firstName,
            LastName = lastName,
            Credentials = string.IsNullOrWhiteSpace(password)
                ? null
                :
                [
                    new CredentialRequest
                    {
                        Type = "password",
                        Value = password,
                        Temporary = temporaryPassword,
                    },
                ],
            RequiredActions =
                string.IsNullOrWhiteSpace(password) || temporaryPassword
                    ? ["UPDATE_PASSWORD"]
                    : null,
        };

        using var response = await SendJsonAsync(
            HttpMethod.Post,
            $"{GetAdminRealmBaseUrl()}/users",
            adminToken,
            payload,
            cancellationToken
        );

        if (
            response.StatusCode != HttpStatusCode.Created
            && response.StatusCode != HttpStatusCode.NoContent
        )
        {
            var body = await response.Content.ReadAsStringAsync(cancellationToken);
            throw new InvalidOperationException(
                $"Failed to create Keycloak user ({(int)response.StatusCode}): {body}"
            );
        }

        var location = response.Headers.Location?.ToString();
        if (!string.IsNullOrWhiteSpace(location))
        {
            var idFromLocation = location.Split('/').LastOrDefault();
            if (!string.IsNullOrWhiteSpace(idFromLocation))
            {
                return new UserRepresentation
                {
                    Id = idFromLocation,
                    Email = email,
                    Username = email,
                };
            }
        }

        return await FindUserByEmailAsync(adminToken, email, cancellationToken)
            ?? throw new InvalidOperationException(
                "Created Keycloak user could not be found afterwards."
            );
    }

    private async Task UpdateUserAsync(
        string adminToken,
        string userId,
        string email,
        string firstName,
        string lastName,
        CancellationToken cancellationToken
    )
    {
        var payload = new UpdateUserRequest
        {
            Email = email,
            Enabled = true,
            EmailVerified = true,
            FirstName = firstName,
            LastName = lastName,
        };

        using var response = await SendJsonAsync(
            HttpMethod.Put,
            $"{GetAdminRealmBaseUrl()}/users/{userId}",
            adminToken,
            payload,
            cancellationToken
        );

        if (response.StatusCode != HttpStatusCode.NoContent)
        {
            var body = await response.Content.ReadAsStringAsync(cancellationToken);
            throw new InvalidOperationException(
                $"Failed to update Keycloak user {userId} ({(int)response.StatusCode}): {body}"
            );
        }
    }

    private async Task ResetPasswordAsync(
        string adminToken,
        string userId,
        string password,
        bool temporary,
        CancellationToken cancellationToken
    )
    {
        using var response = await SendJsonAsync(
            HttpMethod.Put,
            $"{GetAdminRealmBaseUrl()}/users/{userId}/reset-password",
            adminToken,
            new CredentialRequest
            {
                Type = "password",
                Value = password,
                Temporary = temporary,
            },
            cancellationToken
        );

        if (response.StatusCode != HttpStatusCode.NoContent)
        {
            var body = await response.Content.ReadAsStringAsync(cancellationToken);
            throw new InvalidOperationException(
                $"Failed to reset Keycloak password for user {userId} ({(int)response.StatusCode}): {body}"
            );
        }
    }

    private async Task SyncOrganisationRoleGroupsAsync(
        string adminToken,
        string userId,
        long organisationId,
        IReadOnlyCollection<string> roles,
        CancellationToken cancellationToken
    )
    {
        var normalizedRoles = roles
            .Where(r => !string.IsNullOrWhiteSpace(r))
            .Select(r => r.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        var validRoles = AuthRoles.GetRoles();
        normalizedRoles = normalizedRoles
            .Where(r => validRoles.Contains(r, StringComparer.OrdinalIgnoreCase))
            .ToList();

        var parentGroup = await EnsureGroupAsync(
            adminToken,
            $"org-{organisationId}",
            cancellationToken
        );
        var childGroups = await EnsureRoleGroupsAsync(
            adminToken,
            parentGroup,
            validRoles,
            cancellationToken
        );

        var userGroups =
            await GetAsync<List<GroupRepresentation>>(
                adminToken,
                $"{GetAdminRealmBaseUrl()}/users/{userId}/groups?first=0&max=500",
                cancellationToken
            ) ?? [];

        var roleGroupIds = childGroups.Values.ToHashSet(StringComparer.OrdinalIgnoreCase);
        var selectedRoleGroupIds = normalizedRoles
            .Where(r => childGroups.ContainsKey(r))
            .Select(r => childGroups[r])
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        foreach (
            var membership in userGroups.Where(g =>
                roleGroupIds.Contains(g.Id) && !selectedRoleGroupIds.Contains(g.Id)
            )
        )
        {
            await SendWithoutBodyAsync(
                HttpMethod.Delete,
                $"{GetAdminRealmBaseUrl()}/users/{userId}/groups/{membership.Id}",
                adminToken,
                cancellationToken
            );
        }

        foreach (
            var groupId in selectedRoleGroupIds.Where(id =>
                userGroups.All(g => !string.Equals(g.Id, id, StringComparison.OrdinalIgnoreCase))
            )
        )
        {
            await SendWithoutBodyAsync(
                HttpMethod.Put,
                $"{GetAdminRealmBaseUrl()}/users/{userId}/groups/{groupId}",
                adminToken,
                cancellationToken
            );
        }
    }

    private async Task<GroupRepresentation> EnsureGroupAsync(
        string adminToken,
        string groupName,
        CancellationToken cancellationToken
    )
    {
        var groups =
            await GetAsync<List<GroupRepresentation>>(
                adminToken,
                $"{GetAdminRealmBaseUrl()}/groups?search={Uri.EscapeDataString(groupName)}&exact=true&first=0&max=100",
                cancellationToken
            ) ?? [];

        var existing = groups.FirstOrDefault(g =>
            string.Equals(g.Name, groupName, StringComparison.OrdinalIgnoreCase)
        );
        if (existing != null)
        {
            return existing;
        }

        using var createResponse = await SendJsonAsync(
            HttpMethod.Post,
            $"{GetAdminRealmBaseUrl()}/groups",
            adminToken,
            new GroupCreateRequest { Name = groupName },
            cancellationToken
        );

        if (
            createResponse.StatusCode != HttpStatusCode.Created
            && createResponse.StatusCode != HttpStatusCode.NoContent
        )
        {
            var body = await createResponse.Content.ReadAsStringAsync(cancellationToken);
            throw new InvalidOperationException(
                $"Failed to create Keycloak group {groupName} ({(int)createResponse.StatusCode}): {body}"
            );
        }

        groups =
            await GetAsync<List<GroupRepresentation>>(
                adminToken,
                $"{GetAdminRealmBaseUrl()}/groups?search={Uri.EscapeDataString(groupName)}&exact=true&first=0&max=100",
                cancellationToken
            ) ?? [];

        return groups.FirstOrDefault(g =>
                string.Equals(g.Name, groupName, StringComparison.OrdinalIgnoreCase)
            )
            ?? throw new InvalidOperationException(
                $"Created group {groupName} could not be resolved."
            );
    }

    private async Task<Dictionary<string, string>> EnsureRoleGroupsAsync(
        string adminToken,
        GroupRepresentation parentGroup,
        IReadOnlyCollection<string> roles,
        CancellationToken cancellationToken
    )
    {
        var children =
            await GetAsync<List<GroupRepresentation>>(
                adminToken,
                $"{GetAdminRealmBaseUrl()}/groups/{parentGroup.Id}/children?first=0&max=200",
                cancellationToken
            ) ?? [];

        var map = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        foreach (var role in roles)
        {
            var child = children.FirstOrDefault(g =>
                string.Equals(g.Name, role, StringComparison.OrdinalIgnoreCase)
            );
            if (child == null)
            {
                using var createResponse = await SendJsonAsync(
                    HttpMethod.Post,
                    $"{GetAdminRealmBaseUrl()}/groups/{parentGroup.Id}/children",
                    adminToken,
                    new GroupCreateRequest { Name = role },
                    cancellationToken
                );

                if (
                    createResponse.StatusCode != HttpStatusCode.Created
                    && createResponse.StatusCode != HttpStatusCode.NoContent
                )
                {
                    var body = await createResponse.Content.ReadAsStringAsync(cancellationToken);
                    throw new InvalidOperationException(
                        $"Failed to create Keycloak role group {role} ({(int)createResponse.StatusCode}): {body}"
                    );
                }

                children =
                    await GetAsync<List<GroupRepresentation>>(
                        adminToken,
                        $"{GetAdminRealmBaseUrl()}/groups/{parentGroup.Id}/children?first=0&max=200",
                        cancellationToken
                    ) ?? [];
                child = children.FirstOrDefault(g =>
                    string.Equals(g.Name, role, StringComparison.OrdinalIgnoreCase)
                );
            }

            if (child == null)
            {
                throw new InvalidOperationException(
                    $"Role group {role} could not be resolved for {parentGroup.Name}."
                );
            }

            map[role] = child.Id;
        }

        return map;
    }

    private async Task SendWithoutBodyAsync(
        HttpMethod method,
        string url,
        string adminToken,
        CancellationToken cancellationToken
    )
    {
        using var client = _httpClientFactory.CreateClient();
        using var request = new HttpRequestMessage(method, url);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);

        using var response = await client.SendAsync(request, cancellationToken);
        if (response.StatusCode == HttpStatusCode.NotFound && method == HttpMethod.Delete)
        {
            return;
        }

        if (response.StatusCode != HttpStatusCode.NoContent)
        {
            var body = await response.Content.ReadAsStringAsync(cancellationToken);
            throw new InvalidOperationException(
                $"Keycloak request {method} {url} failed ({(int)response.StatusCode}): {body}"
            );
        }
    }

    private async Task<HttpResponseMessage> SendJsonAsync(
        HttpMethod method,
        string url,
        string adminToken,
        object payload,
        CancellationToken cancellationToken
    )
    {
        var client = _httpClientFactory.CreateClient();
        var request = new HttpRequestMessage(method, url)
        {
            Content = new StringContent(
                JsonSerializer.Serialize(payload, JsonOptions),
                Encoding.UTF8,
                "application/json"
            ),
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);

        return await client.SendAsync(request, cancellationToken);
    }

    private async Task<T?> GetAsync<T>(
        string adminToken,
        string url,
        CancellationToken cancellationToken
    )
    {
        using var client = _httpClientFactory.CreateClient();
        using var request = new HttpRequestMessage(HttpMethod.Get, url);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);

        using var response = await client.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync(cancellationToken);
            throw new InvalidOperationException(
                $"Keycloak GET {url} failed ({(int)response.StatusCode}): {body}"
            );
        }

        var content = await response.Content.ReadAsStringAsync(cancellationToken);
        if (string.IsNullOrWhiteSpace(content))
        {
            return default;
        }

        return JsonSerializer.Deserialize<T>(content, JsonOptions);
    }

    private async Task<JsonObject> GetRealmRepresentationAsync(
        string adminToken,
        CancellationToken cancellationToken
    )
    {
        using var client = _httpClientFactory.CreateClient();
        using var request = new HttpRequestMessage(HttpMethod.Get, GetAdminRealmBaseUrl());
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);

        using var response = await client.SendAsync(request, cancellationToken);
        var content = await response.Content.ReadAsStringAsync(cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException(
                $"Keycloak GET {GetAdminRealmBaseUrl()} failed ({(int)response.StatusCode}): {content}"
            );
        }

        return JsonNode.Parse(content)?.AsObject()
            ?? throw new InvalidOperationException(
                "Could not parse Keycloak realm representation."
            );
    }

    private static KeycloakRealmMailSettings MapRealmMailSettings(JsonObject realm)
    {
        var smtp = realm["smtpServer"] as JsonObject;
        if (smtp == null)
        {
            return new KeycloakRealmMailSettings();
        }

        return new KeycloakRealmMailSettings
        {
            Host = ReadString(smtp, "host"),
            Port = ReadString(smtp, "port"),
            From = ReadString(smtp, "from"),
            FromDisplayName = ReadString(smtp, "fromDisplayName"),
            ReplyTo = ReadString(smtp, "replyTo"),
            ReplyToDisplayName = ReadString(smtp, "replyToDisplayName"),
            User = ReadString(smtp, "user"),
            Password = ReadString(smtp, "password"),
            Auth = ReadBool(smtp, "auth"),
            StartTls = ReadBool(smtp, "starttls"),
            Ssl = ReadBool(smtp, "ssl"),
        };
    }

    private static string ReadString(JsonObject source, string propertyName)
    {
        return source[propertyName]?.GetValue<string>()?.Trim() ?? string.Empty;
    }

    private static bool ReadBool(JsonObject source, string propertyName)
    {
        return bool.TryParse(source[propertyName]?.GetValue<string>(), out var value) && value;
    }

    private string GetAdminRealmBaseUrl()
    {
        return $"{GetBaseUrl()}/admin/realms/{GetApplicationRealm()}";
    }

    private string GetBaseUrl()
    {
        var issuer = new Uri(_appSettings.KeycloakIssuer);
        return $"{issuer.Scheme}://{issuer.Authority}";
    }

    private string GetApplicationRealm()
    {
        var issuer = new Uri(_appSettings.KeycloakIssuer);
        var segments = issuer.AbsolutePath.Split('/', StringSplitOptions.RemoveEmptyEntries);
        for (var i = 0; i < segments.Length - 1; i++)
        {
            if (string.Equals(segments[i], "realms", StringComparison.OrdinalIgnoreCase))
            {
                return segments[i + 1];
            }
        }

        throw new InvalidOperationException(
            $"Could not derive Keycloak realm from issuer {_appSettings.KeycloakIssuer}."
        );
    }

    private sealed class TokenResponse
    {
        [JsonPropertyName("access_token")]
        public string AccessToken { get; set; } = string.Empty;
    }

    private sealed class UserRepresentation
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty;

        [JsonPropertyName("username")]
        public string Username { get; set; } = string.Empty;

        [JsonPropertyName("email")]
        public string Email { get; set; } = string.Empty;
    }

    private sealed class GroupRepresentation
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty;

        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;
    }

    private sealed class GroupCreateRequest
    {
        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;
    }

    private sealed class CreateUserRequest
    {
        [JsonPropertyName("username")]
        public string Username { get; set; } = string.Empty;

        [JsonPropertyName("email")]
        public string Email { get; set; } = string.Empty;

        [JsonPropertyName("enabled")]
        public bool Enabled { get; set; }

        [JsonPropertyName("emailVerified")]
        public bool EmailVerified { get; set; }

        [JsonPropertyName("firstName")]
        public string FirstName { get; set; } = string.Empty;

        [JsonPropertyName("lastName")]
        public string LastName { get; set; } = string.Empty;

        [JsonPropertyName("credentials")]
        public List<CredentialRequest>? Credentials { get; set; }

        [JsonPropertyName("requiredActions")]
        public List<string>? RequiredActions { get; set; }
    }

    private sealed class UpdateUserRequest
    {
        [JsonPropertyName("email")]
        public string Email { get; set; } = string.Empty;

        [JsonPropertyName("enabled")]
        public bool Enabled { get; set; }

        [JsonPropertyName("emailVerified")]
        public bool EmailVerified { get; set; }

        [JsonPropertyName("firstName")]
        public string FirstName { get; set; } = string.Empty;

        [JsonPropertyName("lastName")]
        public string LastName { get; set; } = string.Empty;
    }

    private sealed class CredentialRequest
    {
        [JsonPropertyName("type")]
        public string Type { get; set; } = "password";

        [JsonPropertyName("value")]
        public string Value { get; set; } = string.Empty;

        [JsonPropertyName("temporary")]
        public bool Temporary { get; set; }
    }
}
