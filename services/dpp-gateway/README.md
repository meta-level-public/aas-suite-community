# Public DPP Gateway

Public, read-only entry point for published digital product passports. The service resolves a DPP identifier to an internal tenant DPP API and proxies the standardized JSON representation without exposing tenant container addresses.

## Local start

```bash
DppGateway__PublicationRegistryConnectionString='Host=localhost;Port=5432;Database=dpp_gateway;Username=postgres;Password=postgres' \
  dotnet run --project services/dpp-gateway/dpp-gateway.csproj --urls http://localhost:5090
```

Example request:

```text
GET /dpp/v1/dpps/https%3A%2F%2Fexample.com%2Fids%2Faas%2Fbatterie1
```

The local OSS and Enterprise Compose files expose the service on port `5090` by default.
Public reads are limited per source IP. The defaults are 1,200 requests per 60 seconds and can be
changed with `DppGateway:PublicRateLimitPermitLimit` and
`DppGateway:PublicRateLimitWindowSeconds` without rebuilding the gateway.

The public endpoint returns a passport only when the upstream representation contains the
top-level property `dppStatus` with the value `Active` (case-insensitive). Draft, suspended,
withdrawn, unknown, or status-less passports are hidden with `404 DPP_NOT_PUBLISHED`.

Publication is additionally controlled by the persistent registry configured through
`DppGateway:PublicationRegistryConnectionString`. The gateway creates the PostgreSQL table
`dpp_publications` idempotently on startup. Changing metadata to `Active` does not bypass this
registry. Multiple gateway instances can use the same database and remain stateless.
The Designer calls the internal management endpoint with a short-lived Keycloak service token.
Its signed `tenant_id` claim selects the infrastructure; callers cannot provide an upstream URL or
tenant identifier in the request. Before creating the registry entry, the gateway loads the DPP
from that infrastructure and verifies that its current status is `Active`. Drafting, suspending, or
withdrawing the DPP removes only a registry entry owned by the same tenant.

For single-tenant installations, configure `SingleTenantInfrastructureId` consistently in the
gateway and Designer (the fallback is `single-tenant`). In SaaS mode configure
`MultiTenantUpstreamBaseUrlTemplate`, for example
`http://aas-suite-go-dpp-api-{infrastructureId}:8080`. Dynamic resolution accepts GUID
infrastructure IDs only. Explicit `DppGateway:Infrastructures` entries remain available for stacks
that do not follow the ContainerManager naming convention.

Attachment URLs in DPP responses are replaced with DPP-bound gateway URLs. Configure the matching
internal AAS Environment through `SingleTenantAttachmentBaseUrl` or
`MultiTenantAttachmentBaseUrlTemplate` (for example
`http://aas-suite-go-aas-env-{infrastructureId}:8081`). An attachment is returned only while its
source URL occurs in the caller's current authorized view of the published DPP; the gateway never
accepts an arbitrary upstream host or generic repository path.

The gateway and the dynamically created DPP API containers must share the Docker network
configured as the ContainerManager's `InfrastructureSettings:DockerNetworkName`.

`SingleTenant` forwards published identifiers to the one configured DPP API. `MultiTenant`
resolves published identifiers through administratively managed infrastructure IDs.

For secured BaSyx DPP APIs, configure the corresponding OAuth section with a Client Credentials
token endpoint, client ID, secret and optional scope. In `MultiTenant` mode these settings belong
to each infrastructure entry. Local Compose stacks can opt in with
`docker-compose.dpp-security.yml`; `DPP_GATEWAY_CLIENT_SECRET` is mandatory and no default secret
is stored in the repository. The same overlay passes that secret to the Designer backend. At
startup the backend idempotently provisions the confidential `dpp-gateway` service client in
Keycloak with the `dpp-api` audience and the read-only `viewer` role claim.

The service client is intentionally shared by the central gateway in SaaS mode. Tenant selection
and isolation happen in the gateway's administratively managed DPP routing; secrets are not copied
into customer BaSyx stacks. In single-tenant installations the same client authenticates against
the local Keycloak realm and the gateway routes to the sole DPP API.

Set `TokenExchangeEnabled` on the applicable OAuth configuration to preserve the authorization
context of an authenticated caller. The gateway then exchanges the incoming access token at the
administratively configured token endpoint and requests the configured `Audience` (normally
`dpp-api`). Anonymous requests continue to use Client Credentials and therefore receive only the
public `viewer` permissions. Incoming tokens are never forwarded directly to BaSyx.

The ContainerManager copies the configured DPP security template into
`<BasePath>/dpp-security/<infrastructure-id>` when a stack is created or upgraded. Each DPP API
mounts only its own directory. Existing files are retained, so tenant-specific `access-rules.json`
changes are not overwritten by later ensure operations. Apply rule changes by recreating or
restarting the affected DPP API container.
