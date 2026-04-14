using AasDesignerApi.Model;
using AasDesignerCommon.Utils;
using AasDesignerModel;
using AasShared.Configuration;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AasDesignerAasApi.Infrastructure.Commands.ConfigureAndRecreateContainerBulk;

public class ConfigureAndRecreateContainerBulkCommand : IRequest<bool>
{
    public AppUser AppUser { get; set; } = null!;
    public required List<RecreateContainerData> RecreateList { get; set; }
}

public class ConfigureAndRecreateContainerBulkHandler
    : IRequestHandler<ConfigureAndRecreateContainerBulkCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly AppSettings _appsettings;
    private readonly ILogger<ConfigureAndRecreateContainerBulkHandler> _logger;

    public ConfigureAndRecreateContainerBulkHandler(
        IApplicationDbContext context,
        AppSettings settings,
        ILogger<ConfigureAndRecreateContainerBulkHandler> logger
    )
    {
        _context = context;
        _appsettings = settings;
        _logger = logger;
    }

    public async Task<bool> Handle(
        ConfigureAndRecreateContainerBulkCommand request,
        CancellationToken cancellationToken
    )
    {
        foreach (var singleRequest in request.RecreateList ?? [])
        {
            try
            {
                var infrastructure = await _context
                    .AasInfrastructureSettings.Where(i => i.Id == singleRequest.InfrastructureId)
                    .FirstOrDefaultAsync();

                if (infrastructure == null)
                    throw new Exception("Infrastructure not found");

                // reparatur!
                if (string.IsNullOrWhiteSpace(infrastructure.ContainerGuid))
                {
                    var newGuid = Guid.NewGuid().ToString();
                    infrastructure.ContainerGuid = newGuid;

                    infrastructure.ContainerGuid = newGuid;
                    infrastructure.MongoContainer = $"aas-suite-mongo-{newGuid}";
                    infrastructure.MqttContainer = $"aas-suite-mqtt-{newGuid}";
                    infrastructure.AasEnvContainer = $"aas-suite-aas-env-{newGuid}";
                    infrastructure.AasRegistryContainer = $"aas-suite-aas-registry-{newGuid}";
                    infrastructure.SmRegistryContainer = $"aas-suite-sm-registry-{newGuid}";
                    infrastructure.AasDiscoveryContainer = $"aas-suite-aas-discovery-{newGuid}";
                }

                infrastructure.AasEnvMemory = singleRequest.AasEnvMaxMemSetting;
                infrastructure.AasEnvMemSwap = singleRequest.AasEnvMemSwapSetting;

                infrastructure.DiscoveryMemory = singleRequest.DiscoveryMaxMemSetting;
                infrastructure.DiscoveryMemSwap = singleRequest.DiscoveryMemSwapSetting;

                infrastructure.AasRegistryMemory = singleRequest.AasRegistryMaxMemSetting;
                infrastructure.AasRegistryMemSwap = singleRequest.AasRegistryMemSwapSetting;

                infrastructure.SmRegistryMemory = singleRequest.SmRegistryMaxMemSetting;
                infrastructure.SmRegistryMemSwap = singleRequest.SmRegistryMemSwapSetting;

                infrastructure.MongoMemory = singleRequest.MongoMaxMemSetting;
                infrastructure.MongoMemSwap = singleRequest.MongoMemSwapSetting;

                infrastructure.MqttMemory = singleRequest.MqttMaxMemSetting;
                infrastructure.MqttMemSwap = singleRequest.MqttMemSwapSetting;

                await _context.SaveChangesAsync(cancellationToken);
                var externalUrl =
                    $"{_appsettings.BaseUrl.AppendSlash()}aas-proxy/"
                    + infrastructure.Id
                    + "/aas-repo/";

                InfrastructureChangeRequester.RequestInfrastructureChange(
                    infrastructure.ContainerGuid,
                    _appsettings.ContainerManagerInboxDirectory,
                    infrastructure,
                    externalUrl
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error while processing infrastructure recreation"
                        + singleRequest.InfrastructureId
                );
            }
        }

        return true;
    }
}
