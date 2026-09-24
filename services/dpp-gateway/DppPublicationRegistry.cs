using Microsoft.Extensions.Diagnostics.HealthChecks;
using Npgsql;

namespace DppGateway;

public sealed record DppPublication(
    string DppId,
    string InfrastructureId,
    DateTimeOffset PublishedAt
);

public interface IDppPublicationRegistry
{
    ValueTask<bool> IsPublishedAsync(string dppId, CancellationToken cancellationToken);
    ValueTask<string?> GetInfrastructureIdAsync(string dppId, CancellationToken cancellationToken);
    Task PublishAsync(string dppId, string infrastructureId, CancellationToken cancellationToken);
    Task UnpublishAsync(string dppId, CancellationToken cancellationToken);
}

public sealed class DppPublicationRegistry(NpgsqlDataSource dataSource)
    : IDppPublicationRegistry,
        IHealthCheck
{
    public async Task InitializeAsync(CancellationToken cancellationToken)
    {
        await using var command = dataSource.CreateCommand(
            """
            CREATE TABLE IF NOT EXISTS dpp_publications (
                dpp_id TEXT PRIMARY KEY,
                infrastructure_id TEXT NOT NULL,
                published_at TIMESTAMPTZ NOT NULL
            );
            CREATE INDEX IF NOT EXISTS ix_dpp_publications_infrastructure_id
                ON dpp_publications (infrastructure_id);
            """
        );
        await command.ExecuteNonQueryAsync(cancellationToken);
    }

    public async ValueTask<bool> IsPublishedAsync(
        string dppId,
        CancellationToken cancellationToken
    ) => await GetInfrastructureIdAsync(dppId, cancellationToken) != null;

    public async ValueTask<string?> GetInfrastructureIdAsync(
        string dppId,
        CancellationToken cancellationToken
    )
    {
        await using var command = dataSource.CreateCommand(
            "SELECT infrastructure_id FROM dpp_publications WHERE dpp_id = $1"
        );
        command.Parameters.AddWithValue(dppId);
        return await command.ExecuteScalarAsync(cancellationToken) as string;
    }

    public async Task PublishAsync(
        string dppId,
        string infrastructureId,
        CancellationToken cancellationToken
    )
    {
        await using var command = dataSource.CreateCommand(
            """
            INSERT INTO dpp_publications (dpp_id, infrastructure_id, published_at)
            VALUES ($1, $2, $3)
            ON CONFLICT (dpp_id) DO UPDATE SET
                infrastructure_id = EXCLUDED.infrastructure_id,
                published_at = EXCLUDED.published_at
            """
        );
        command.Parameters.AddWithValue(dppId);
        command.Parameters.AddWithValue(infrastructureId);
        command.Parameters.AddWithValue(DateTimeOffset.UtcNow);
        await command.ExecuteNonQueryAsync(cancellationToken);
    }

    public async Task UnpublishAsync(string dppId, CancellationToken cancellationToken)
    {
        await using var command = dataSource.CreateCommand(
            "DELETE FROM dpp_publications WHERE dpp_id = $1"
        );
        command.Parameters.AddWithValue(dppId);
        await command.ExecuteNonQueryAsync(cancellationToken);
    }

    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            await using var command = dataSource.CreateCommand("SELECT 1");
            await command.ExecuteScalarAsync(cancellationToken);
            return HealthCheckResult.Healthy();
        }
        catch (Exception exception)
        {
            return HealthCheckResult.Unhealthy(
                "The DPP publication registry is unavailable.",
                exception
            );
        }
    }
}
