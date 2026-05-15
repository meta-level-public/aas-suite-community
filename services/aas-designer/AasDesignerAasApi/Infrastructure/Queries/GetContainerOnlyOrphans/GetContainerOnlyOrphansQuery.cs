using AasDesignerModel;
using AasShared.Configuration;
using Docker.DotNet;
using Docker.DotNet.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AasDesignerAasApi.Infrastructure.Queries.GetContainerOnlyOrphans;

public class GetContainerOnlyOrphansQuery : IRequest<List<ContainerOnlyOrphanDto>> { }

public class GetContainerOnlyOrphansQueryHandler
    : IRequestHandler<GetContainerOnlyOrphansQuery, List<ContainerOnlyOrphanDto>>
{
    private static readonly string[] JavaPrefixes =
    [
        "aas-suite-aas-env-",
        "aas-suite-aas-registry-",
        "aas-suite-sm-registry-",
        "aas-suite-aas-discovery-",
        "aas-suite-mqtt-",
        "aas-suite-mongo-",
    ];

    private static readonly string[] GoPrefixes =
    [
        "aas-suite-go-aas-env-",
        "aas-suite-go-aas-registry-",
        "aas-suite-go-sm-registry-",
        "aas-suite-go-aas-discovery-",
        "aas-suite-go-mqtt-",
    ];

    private readonly IApplicationDbContext _context;
    private readonly AppSettings _settings;

    public GetContainerOnlyOrphansQueryHandler(IApplicationDbContext context, AppSettings settings)
    {
        _context = context;
        _settings = settings;
    }

    public async Task<List<ContainerOnlyOrphanDto>> Handle(
        GetContainerOnlyOrphansQuery request,
        CancellationToken cancellationToken
    )
    {
        var knownGuids = await _context
            .AasInfrastructureSettings.Where(s =>
                s.IsInternal && !string.IsNullOrWhiteSpace(s.ContainerGuid)
            )
            .Select(s => s.ContainerGuid)
            .ToListAsync(cancellationToken);

        var knownGuidSet = new HashSet<string>(
            knownGuids.Where(g => g != null).Select(g => g!),
            StringComparer.OrdinalIgnoreCase
        );

        var dockerClient = new DockerClientConfiguration(
            new Uri(_settings.DockerHostConnection)
        ).CreateClient();

        IList<ContainerListResponse> containers;
        try
        {
            containers = await dockerClient.Containers.ListContainersAsync(
                new ContainersListParameters
                {
                    All = true,
                    Filters = new Dictionary<string, IDictionary<string, bool>>
                    {
                        ["name"] = new Dictionary<string, bool> { ["aas-suite-"] = true },
                    },
                },
                cancellationToken
            );
        }
        catch
        {
            return [];
        }

        var orphansByGuid = new Dictionary<string, (List<string> Names, bool IsGo)>(
            StringComparer.OrdinalIgnoreCase
        );

        foreach (var container in containers)
        {
            foreach (var rawName in container.Names)
            {
                // Docker-Namen beginnen mit '/'
                var name = rawName.TrimStart('/');

                var (guid, isGo) = ExtractGuid(name);
                if (guid == null)
                    continue;

                if (knownGuidSet.Contains(guid))
                    continue;

                if (!orphansByGuid.TryGetValue(guid, out var entry))
                {
                    entry = ([], isGo);
                    orphansByGuid[guid] = entry;
                }

                if (!entry.Names.Contains(name))
                    entry.Names.Add(name);
            }
        }

        return orphansByGuid
            .Select(kvp => new ContainerOnlyOrphanDto
            {
                ContainerGuid = kvp.Key,
                ContainerNames = kvp.Value.Names,
                IsGoInfrastructure = kvp.Value.IsGo,
            })
            .OrderBy(d => d.ContainerGuid)
            .ToList();
    }

    private static (string? Guid, bool IsGo) ExtractGuid(string containerName)
    {
        foreach (var prefix in GoPrefixes)
        {
            if (
                containerName.StartsWith(prefix, StringComparison.OrdinalIgnoreCase)
                && containerName.Length > prefix.Length
            )
            {
                return (containerName[prefix.Length..], true);
            }
        }

        foreach (var prefix in JavaPrefixes)
        {
            if (
                containerName.StartsWith(prefix, StringComparison.OrdinalIgnoreCase)
                && containerName.Length > prefix.Length
            )
            {
                return (containerName[prefix.Length..], false);
            }
        }

        return (null, false);
    }
}
