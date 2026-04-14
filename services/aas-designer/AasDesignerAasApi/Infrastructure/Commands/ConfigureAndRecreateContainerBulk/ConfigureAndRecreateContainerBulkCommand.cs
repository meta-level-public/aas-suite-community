using AasDesignerApi.Model;
using AasDesignerCommon.Utils;
using AasDesignerModel;
using AasShared.Configuration;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AasDesignerAasApi.Infrastructure.Commands.ConfigureAndRecreateContainer;

public class ConfigureAndRecreateContainerCommand : IRequest<bool>
{
    public AppUser AppUser { get; set; } = null!;
    public required RecreateContainerData RecreateData { get; set; }
}

public class ConfigureAndRecreateContainerHandler
    : IRequestHandler<ConfigureAndRecreateContainerCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly AppSettings _appsettings;

    public ConfigureAndRecreateContainerHandler(IApplicationDbContext context, AppSettings settings)
    {
        _context = context;
        _appsettings = settings;
    }

    public async Task<bool> Handle(
        ConfigureAndRecreateContainerCommand request,
        CancellationToken cancellationToken
    )
    {
        var infrastructure = await _context
            .AasInfrastructureSettings.Where(i => i.Id == request.RecreateData.InfrastructureId)
            .FirstOrDefaultAsync();

        if (infrastructure == null)
            throw new Exception("Infrastructure not found");

        if (string.IsNullOrWhiteSpace(infrastructure.ContainerGuid))
        {
            var newGuid = Guid.NewGuid().ToString();
            infrastructure.ContainerGuid = infrastructure.ContainerGuid = newGuid;
            infrastructure.MongoContainer = $"aas-suite-mongo-{newGuid}";
            infrastructure.MqttContainer = $"aas-suite-mqtt-{newGuid}";
            infrastructure.AasEnvContainer = $"aas-suite-aas-env-{newGuid}";
            infrastructure.AasRegistryContainer = $"aas-suite-aas-registry-{newGuid}";
            infrastructure.SmRegistryContainer = $"aas-suite-sm-registry-{newGuid}";
            infrastructure.AasDiscoveryContainer = $"aas-suite-aas-discovery-{newGuid}";
        }

        infrastructure.AasEnvMemory = request.RecreateData.AasEnvMaxMemSetting;
        infrastructure.AasEnvMemSwap = request.RecreateData.AasEnvMemSwapSetting;

        infrastructure.DiscoveryMemory = request.RecreateData.DiscoveryMaxMemSetting;
        infrastructure.DiscoveryMemSwap = request.RecreateData.DiscoveryMemSwapSetting;

        infrastructure.AasRegistryMemory = request.RecreateData.AasRegistryMaxMemSetting;
        infrastructure.AasRegistryMemSwap = request.RecreateData.AasRegistryMemSwapSetting;

        infrastructure.SmRegistryMemory = request.RecreateData.SmRegistryMaxMemSetting;
        infrastructure.SmRegistryMemSwap = request.RecreateData.SmRegistryMemSwapSetting;

        infrastructure.MongoMemory = request.RecreateData.MongoMaxMemSetting;
        infrastructure.MongoMemSwap = request.RecreateData.MongoMemSwapSetting;

        infrastructure.MqttMemory = request.RecreateData.MqttMaxMemSetting;
        infrastructure.MqttMemSwap = request.RecreateData.MqttMemSwapSetting;

        await _context.SaveChangesAsync(cancellationToken);
        var externalUrl =
            $"{_appsettings.BaseUrl.AppendSlash()}aas-proxy/" + infrastructure.Id + "/aas-repo/";

        InfrastructureChangeRequester.RequestInfrastructureChange(
            infrastructure.ContainerGuid,
            _appsettings.ContainerManagerInboxDirectory,
            infrastructure,
            externalUrl
        );

        return true;
    }
}
