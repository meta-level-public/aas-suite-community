using System.Text.Json;
using AasDesignerCommon.Model;
using AasDesignerModel.Model;

namespace AasDesignerAasApi.Infrastructure;

public class InfrastructureChangeRequester
{
    public static void RequestInfrastructureDisabling(string guid, string containerInboxPath)
    {
        var containerInfos = new ContainerInfos { Guid = guid, Action = "disable" };

        // Infodatei schreiben
        var infoString = JsonSerializer.Serialize(containerInfos);
        var path = Path.Combine(containerInboxPath, $"containerInfos-{Guid.NewGuid()}.json");
        File.WriteAllText(path, infoString);
    }

    public static void RequestInfrastructureEnabling(string guid, string containerInboxPath)
    {
        var containerInfos = new ContainerInfos { Guid = guid, Action = "enable" };

        // Infodatei schreiben
        var infoString = JsonSerializer.Serialize(containerInfos);
        var path = Path.Combine(containerInboxPath, $"containerInfos-{Guid.NewGuid()}.json");
        File.WriteAllText(path, infoString);
    }

    public static void RequestInfrastructureRemoval(string guid, string containerInboxPath)
    {
        var containerInfos = new ContainerInfos { Guid = guid, Action = "delete" };

        // Infodatei schreiben
        var infoString = JsonSerializer.Serialize(containerInfos);
        var path = Path.Combine(containerInboxPath, $"containerInfos-{Guid.NewGuid()}.json");
        File.WriteAllText(path, infoString);
    }

    public static void RequestInfrastructureChange(
        string guid,
        string containerInboxPath,
        AasInfrastructureSettings settings,
        string externalUrl
    )
    {
        var containerInfos = new ContainerInfos
        {
            Guid = guid,
            HostPortAasEnv = settings.HostPortAasEnv,
            HostPortAasRegistry = settings.HostPortAasRegistry,
            HostPortSmRegistry = settings.HostPortSmRegistry,
            HostPortAasDiscovery = settings.HostPortAasDiscovery,
            HostPortMqtt = settings.HostPortMqtt,
            VersionAasEnv = settings.AasRepositoryVersion,
            VersionAasRegistry = settings.AasRegistryVersion,
            VersionSmRegistry = settings.SubmodelRegistryVersion,
            VersionAasDiscovery = settings.AasDiscoveryVersion,
            VersionCdRepository = settings.ConceptDescriptionRepositoryVersion,

            AasDiscoveryMemory = settings.DiscoveryMemory * 1000 * 1000,
            AasDiscoveryMemorySwap =
                settings.DiscoveryMemSwap != -1 ? settings.DiscoveryMemSwap * 1000 * 1000 : -1,
            AasEnvMemory = settings.AasEnvMemory * 1000 * 1000,
            AasEnvMemorySwap =
                settings.AasEnvMemSwap != -1 ? settings.AasEnvMemSwap * 1000 * 1000 : -1,
            AasRegistryMemory = settings.AasRegistryMemory * 1000 * 1000,
            AasRegistryMemorySwap =
                settings.AasRegistryMemSwap != -1 ? settings.AasRegistryMemSwap * 1000 * 1000 : -1,
            SmRegistryMemory = settings.SmRegistryMemory * 1000 * 1000,
            SmRegistryMemorySwap =
                settings.SmRegistryMemSwap != -1 ? settings.SmRegistryMemSwap * 1000 * 1000 : -1,
            MqttMemory = settings.MqttMemory * 1000 * 1000,
            MqttMemorySwap = settings.MqttMemSwap != -1 ? settings.MqttMemSwap * 1000 * 1000 : -1,
            MongoMemory = settings.MongoMemory * 1000 * 1000,
            MongoMemorySwap =
                settings.MongoMemSwap != -1 ? settings.MongoMemSwap * 1000 * 1000 : -1,

            Action = "change",
            ContainerStatus = "started",
            ExternalUrl = externalUrl,
        };

        // Infodatei schreiben
        var infoString = JsonSerializer.Serialize(containerInfos);
        var path = Path.Combine(containerInboxPath, $"containerInfos-{Guid.NewGuid()}.json");
        File.WriteAllText(path, infoString);
    }
}
