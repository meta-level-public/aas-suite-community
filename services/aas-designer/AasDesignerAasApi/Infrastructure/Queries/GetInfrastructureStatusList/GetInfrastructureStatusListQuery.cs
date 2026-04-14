using AasDesignerApi.Model;
using AasDesignerModel;
using AasShared.Configuration;
using AutoMapper;
using Docker.DotNet;
using Docker.DotNet.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;

namespace AasDesignerAasApi.Infrastructure.Queries.GetInfrastructureStatusList;

public class GetInfrastructureStatusListQuery : IRequest<List<InfrastructureStatus>>
{
    public AppUser AppUser { get; set; } = null!;
}

public class GetInfrastructureStatusListQueryHandler
    : IRequestHandler<GetInfrastructureStatusListQuery, List<InfrastructureStatus>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly AppSettings _settings;

    public GetInfrastructureStatusListQueryHandler(
        IApplicationDbContext context,
        IMapper mapper,
        AppSettings settings
    )
    {
        _context = context;
        _mapper = mapper;
        _settings = settings;
    }

    public async Task<List<InfrastructureStatus>> Handle(
        GetInfrastructureStatusListQuery request,
        CancellationToken cancellationToken
    )
    {
        var result = new List<InfrastructureStatus>();
        var infrastructures = await _context
            .AasInfrastructureSettings.Where(i => !i.Geloescht && i.IsInternal)
            .ToListAsync(cancellationToken);

        var dockerClient = new DockerClientConfiguration(
            new Uri(_settings.DockerHostConnection)
        ).CreateClient();
        foreach (var infrastructure in infrastructures)
        {
            var orga = await _context.Organisations.FirstOrDefaultAsync(
                o => o.AasInfrastructureSettings.Any(x => x.Id == infrastructure.Id),
                cancellationToken
            );
            if (orga == null || orga.Geloescht)
            {
                continue;
            }
            var status = new InfrastructureStatus
            {
                OrgaName = orga.Name,
                OrgaId = orga.Id,
                InfrastructureId = infrastructure.Id,
                InfrastructureName = infrastructure.Name,

                AasEnvPort = infrastructure.HostPortAasEnv,
                AasEnvStatus = ContainerStatus.Unknown,
                AasEnvContainerName = infrastructure.AasEnvContainer,
                AasEnvMem = 0,
                AasEnvMaxMem = 0,
                AasEnvMaxMemSetting = infrastructure.AasEnvMemory,
                AasEnvMemSwap = 0,
                AasEnvMemSwapSetting = infrastructure.AasEnvMemSwap,

                AasRegistryPort = infrastructure.HostPortAasRegistry,
                AasRegistryStatus = ContainerStatus.Unknown,
                AasRegistryContainerName = infrastructure.AasRegistryContainer,
                AasRegistryMem = 0,
                AasRegistryMaxMem = 0,
                AasRegistryMaxMemSetting = infrastructure.AasRegistryMemory,
                AasRegistryMemSwap = 0,
                AasRegistryMemSwapSetting = infrastructure.AasRegistryMemSwap,

                SmRegistryPort = infrastructure.HostPortSmRegistry,
                SmRegistryStatus = ContainerStatus.Unknown,
                SmRegistryContainerName = infrastructure.SmRegistryContainer,
                SmRegistryMem = 0,
                SmRegistryMaxMem = 0,
                SmRegistryMaxMemSetting = infrastructure.SmRegistryMemory,
                SmRegistryMemSwap = 0,
                SmRegistryMemSwapSetting = infrastructure.SmRegistryMemSwap,

                DiscoveryPort = infrastructure.HostPortAasDiscovery,
                DiscoveryStatus = ContainerStatus.Unknown,
                DiscoveryContainerName = infrastructure.AasDiscoveryContainer,
                DiscoveryMem = 0,
                DiscoveryMaxMem = 0,
                DiscoveryMaxMemSetting = infrastructure.DiscoveryMemory,
                DiscoveryMemSwap = 0,
                DiscoveryMemSwapSetting = infrastructure.DiscoveryMemSwap,

                MqttPort = infrastructure.HostPortMqtt,
                MqttStatus = ContainerStatus.Unknown,
                MqttContainerName = infrastructure.MqttContainer,
                MqttMem = 0,
                MqttMaxMem = 0,
                MqttMaxMemSetting = infrastructure.MqttMemory,
                MqttMemSwap = 0,
                MqttMemSwapSetting = infrastructure.MqttMemSwap,

                MongoStatus = ContainerStatus.Unknown,
                MongoContainerName = infrastructure.MongoContainer,
                MongoMem = 0,
                MongoMaxMem = 0,
                MongoMaxMemSetting = infrastructure.MongoMemory,
                MongoMemSwap = 0,
                MongoMemSwapSetting = infrastructure.MongoMemSwap,

                IsActive = infrastructure.IsActive,
            };

            if (infrastructure.IsActive)
            {
                if (!string.IsNullOrEmpty(infrastructure.AasEnvContainer))
                {
                    var res = await GetContainerStatus(
                        dockerClient,
                        infrastructure.AasEnvContainer,
                        cancellationToken
                    );
                    status.AasEnvStatus =
                        res != null ? GetContainerStatusEnum(res) : ContainerStatus.Unknown;
                    status.AasEnvMemSwap = res?.HostConfig?.MemorySwap ?? 0;
                    var stats = await GetContainerStats(
                        dockerClient,
                        infrastructure.AasEnvContainer,
                        cancellationToken
                    );
                    status.AasEnvMem = stats?.MemoryStats?.Usage ?? 0;
                    status.AasEnvMaxMem = stats?.MemoryStats?.Limit ?? 0;
                }
                if (!string.IsNullOrEmpty(infrastructure.AasRegistryContainer))
                {
                    var res = await GetContainerStatus(
                        dockerClient,
                        infrastructure.AasRegistryContainer,
                        cancellationToken
                    );
                    status.AasRegistryStatus =
                        res != null ? GetContainerStatusEnum(res) : ContainerStatus.Unknown;
                    status.AasRegistryMemSwap = res?.HostConfig?.MemorySwap ?? 0;
                    var stats = await GetContainerStats(
                        dockerClient,
                        infrastructure.AasRegistryContainer,
                        cancellationToken
                    );
                    status.AasRegistryMem = stats?.MemoryStats?.Usage ?? 0;
                    status.AasRegistryMaxMem = stats?.MemoryStats?.Limit ?? 0;
                }
                if (!string.IsNullOrEmpty(infrastructure.SmRegistryContainer))
                {
                    var res = await GetContainerStatus(
                        dockerClient,
                        infrastructure.SmRegistryContainer,
                        cancellationToken
                    );
                    status.SmRegistryStatus =
                        res != null ? GetContainerStatusEnum(res) : ContainerStatus.Unknown;
                    status.SmRegistryMemSwap = res?.HostConfig?.MemorySwap ?? 0;
                    var stats = await GetContainerStats(
                        dockerClient,
                        infrastructure.SmRegistryContainer,
                        cancellationToken
                    );
                    status.SmRegistryMem = stats?.MemoryStats?.Usage ?? 0;
                    status.SmRegistryMaxMem = stats?.MemoryStats?.Limit ?? 0;
                }
                if (!string.IsNullOrEmpty(infrastructure.AasDiscoveryContainer))
                {
                    var res = await GetContainerStatus(
                        dockerClient,
                        infrastructure.AasDiscoveryContainer,
                        cancellationToken
                    );
                    status.DiscoveryStatus =
                        res != null ? GetContainerStatusEnum(res) : ContainerStatus.Unknown;
                    status.DiscoveryMemSwap = res?.HostConfig?.MemorySwap ?? 0;
                    var stats = await GetContainerStats(
                        dockerClient,
                        infrastructure.AasDiscoveryContainer,
                        cancellationToken
                    );
                    status.DiscoveryMem = stats?.MemoryStats?.Usage ?? 0;
                    status.DiscoveryMaxMem = stats?.MemoryStats?.Limit ?? 0;
                }
                if (!string.IsNullOrEmpty(infrastructure.MqttContainer))
                {
                    var res = await GetContainerStatus(
                        dockerClient,
                        infrastructure.MqttContainer,
                        cancellationToken
                    );
                    status.MqttStatus =
                        res != null ? GetContainerStatusEnum(res) : ContainerStatus.Unknown;
                    status.MqttMemSwap = res?.HostConfig?.MemorySwap ?? 0;
                    var stats = await GetContainerStats(
                        dockerClient,
                        infrastructure.MqttContainer,
                        cancellationToken
                    );
                    status.MqttMem = stats?.MemoryStats?.Usage ?? 0;
                    status.MqttMaxMem = stats?.MemoryStats?.Limit ?? 0;
                }
                if (!string.IsNullOrEmpty(infrastructure.MongoContainer))
                {
                    var res = await GetContainerStatus(
                        dockerClient,
                        infrastructure.MongoContainer,
                        cancellationToken
                    );
                    status.MongoStatus =
                        res != null ? GetContainerStatusEnum(res) : ContainerStatus.Unknown;
                    status.MongoMemSwap = res?.HostConfig?.MemorySwap ?? 0;
                    var stats = await GetContainerStats(
                        dockerClient,
                        infrastructure.MongoContainer,
                        cancellationToken
                    );
                    status.MongoMem = stats?.MemoryStats?.Usage ?? 0;
                    status.MongoMaxMem = stats?.MemoryStats?.Limit ?? 0;
                }
            }

            result.Add(status);
        }

        return result;
    }

    private async Task<ContainerInspectResponse?> GetContainerStatus(
        DockerClient dockerClient,
        string containerName,
        CancellationToken cancellationToken
    )
    {
        try
        {
            return await dockerClient.Containers.InspectContainerAsync(
                containerName,
                cancellationToken
            );
        }
        catch
        {
            return null;
        }
    }

    private ContainerStatus GetContainerStatusEnum(
        ContainerInspectResponse containerInspectResponse
    )
    {
        return containerInspectResponse.State.Status switch
        {
            "running" => ContainerStatus.Running,
            "exited" => ContainerStatus.Exited,
            _ => ContainerStatus.Unknown,
        };
    }

    private async Task<ContainerStatsResponse?> GetContainerStats(
        DockerClient dockerClient,
        string containerName,
        CancellationToken cancellationToken
    )
    {
        try
        {
            ContainerStatsResponse? containerStats = null;
            var progress = new Progress<ContainerStatsResponse>(message =>
                containerStats = message
            );
            await dockerClient.Containers.GetContainerStatsAsync(
                containerName,
                new ContainerStatsParameters { Stream = false, OneShot = true },
                progress,
                cancellationToken
            );

            return containerStats;
        }
        catch
        {
            return null;
        }
    }
}
