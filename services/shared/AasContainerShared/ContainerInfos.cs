namespace AasDesignerCommon.Model;

/// <summary>
/// Represents the configuration for a set of BaSyx infrastructure containers.
/// This class is the shared contract between the AAS Designer backend and the
/// DesignerContainerManager tool. It is serialized as JSON into the inbox directory
/// and read by the ContainerManager worker.
/// </summary>
public class ContainerInfos
{
    public string Guid { get; set; } = string.Empty;

    public int HostPortAasEnv { get; set; }
    public string VersionAasEnv { get; set; } = string.Empty;
    public long AasEnvMemory { get; set; } = 768_000_000;
    public long AasEnvMemorySwap { get; set; } = -1;

    public int HostPortAasRegistry { get; set; }
    public string VersionAasRegistry { get; set; } = string.Empty;
    public long AasRegistryMemory { get; set; } = 512_000_000;
    public long AasRegistryMemorySwap { get; set; } = -1;

    public int HostPortSmRegistry { get; set; }
    public string VersionSmRegistry { get; set; } = string.Empty;
    public long SmRegistryMemory { get; set; } = 512_000_000;
    public long SmRegistryMemorySwap { get; set; } = -1;

    public int HostPortAasDiscovery { get; set; }
    public string VersionAasDiscovery { get; set; } = string.Empty;
    public long AasDiscoveryMemory { get; set; } = 512_000_000;
    public long AasDiscoveryMemorySwap { get; set; } = -1;

    public string VersionCdRepository { get; set; } = string.Empty;

    public int HostPortMqtt { get; set; }
    public long MqttMemory { get; set; } = 128_000_000;
    public long MqttMemorySwap { get; set; } = -1;

    public long MongoMemory { get; set; } = 128_000_000;
    public long MongoMemorySwap { get; set; } = -1;

    public string Action { get; set; } = string.Empty;
    public string ContainerStatus { get; set; } = string.Empty;

    public string ExternalUrl { get; set; } = string.Empty;

    public bool IsGoInfrastructure { get; set; } = false;
    public string GoPostgresDbName { get; set; } = string.Empty;
    public string GoPostgresUser { get; set; } = string.Empty;
    public string GoPostgresPassword { get; set; } = string.Empty;
}
