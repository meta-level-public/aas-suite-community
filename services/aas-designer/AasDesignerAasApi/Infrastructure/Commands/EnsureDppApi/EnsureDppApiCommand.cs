using System.Text.Json;
using AasDesignerCommon.Model;
using AasDesignerModel;
using AasShared.Configuration;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;

namespace AasDesignerAasApi.Infrastructure.Commands.EnsureDppApi;

public sealed class EnsureDppApiCommand : IRequest<EnsureDppApiResult>
{
    public long? InfrastructureId { get; init; }
}

public sealed class EnsureDppApiResult
{
    public int Queued { get; init; }
    public int Skipped { get; init; }
}

public sealed class EnsureDppApiCommandHandler
    : IRequestHandler<EnsureDppApiCommand, EnsureDppApiResult>
{
    private readonly IApplicationDbContext _context;
    private readonly AppSettings _settings;

    public EnsureDppApiCommandHandler(
        IApplicationDbContext context,
        AppSettings settings,
        IHostEnvironment environment
    )
    {
        _context = context;
        _settings = settings;
    }

    public async Task<EnsureDppApiResult> Handle(
        EnsureDppApiCommand request,
        CancellationToken cancellationToken
    )
    {
        var query = _context.AasInfrastructureSettings.Where(infrastructure =>
            infrastructure.IsInternal
            && infrastructure.IsGoInfrastructure
            && !infrastructure.Geloescht
        );
        if (request.InfrastructureId.HasValue)
        {
            query = query.Where(infrastructure =>
                infrastructure.Id == request.InfrastructureId.Value
            );
        }

        var infrastructures = await query.ToListAsync(cancellationToken);
        if (request.InfrastructureId.HasValue && infrastructures.Count == 0)
        {
            throw new InvalidOperationException("BaSyx-Go-Infrastruktur wurde nicht gefunden.");
        }

        var requests = new List<ContainerInfos>();
        foreach (var infrastructure in infrastructures)
        {
            if (string.IsNullOrWhiteSpace(infrastructure.ContainerGuid))
            {
                continue;
            }

            var containerName = $"aas-suite-go-dpp-api-{infrastructure.ContainerGuid}";
            var baseUrl = $"http://{containerName}:8080";
            var dppApiVersion = ContainerInfos.DefaultBasyxGoVersion;

            infrastructure.DppApiUrl = baseUrl;
            infrastructure.DppApiVersion = dppApiVersion;
            infrastructure.DppApiHcUrl = $"{baseUrl}/health";
            infrastructure.DppApiHcEnabled = true;

            requests.Add(
                new ContainerInfos
                {
                    Guid = infrastructure.ContainerGuid,
                    BasyxStackVersion = ContainerInfos.DefaultBasyxGoVersion,
                    Action = "ensure-dpp-api",
                    HostPortDppApi = 0,
                    VersionDppApi = dppApiVersion,
                    DppApiMemory = 256_000_000,
                    DppApiMemorySwap = -1,
                }
            );
        }

        if (string.IsNullOrWhiteSpace(_settings.ContainerManagerInboxDirectory))
        {
            throw new InvalidOperationException("ContainerManager-Inbox ist nicht konfiguriert.");
        }
        await _context.SaveChangesAsync(cancellationToken);
        Directory.CreateDirectory(_settings.ContainerManagerInboxDirectory);
        foreach (var containerInfos in requests)
        {
            var path = Path.Combine(
                _settings.ContainerManagerInboxDirectory,
                $"containerInfos-{Guid.NewGuid()}.json"
            );
            await File.WriteAllTextAsync(
                path,
                JsonSerializer.Serialize(containerInfos),
                cancellationToken
            );
        }

        return new EnsureDppApiResult
        {
            Queued = requests.Count,
            Skipped = infrastructures.Count - requests.Count,
        };
    }
}
