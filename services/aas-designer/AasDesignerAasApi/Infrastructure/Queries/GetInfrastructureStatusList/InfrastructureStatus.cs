namespace AasDesignerAasApi.Infrastructure.Queries.GetInfrastructureStatusList
{
    public class InfrastructureStatus
    {
        public long InfrastructureId { get; set; }
        public string InfrastructureName { get; set; } = string.Empty;
        public int AasEnvPort { get; set; }
        public ContainerStatus AasEnvStatus { get; set; }
        public int AasRegistryPort { get; set; }
        public ContainerStatus AasRegistryStatus { get; set; }
        public int SmRegistryPort { get; set; }
        public ContainerStatus SmRegistryStatus { get; set; }
        public int DiscoveryPort { get; set; }
        public ContainerStatus DiscoveryStatus { get; set; }
        public ContainerStatus MongoStatus { get; set; }
        public ContainerStatus MqttStatus { get; set; }
        public int MqttPort { get; set; }
        public bool IsActive { get; set; }
        public string AasEnvContainerName { get; set; } = string.Empty;
        public string MongoContainerName { get; set; } = string.Empty;
        public string MqttContainerName { get; set; } = string.Empty;
        public string DiscoveryContainerName { get; set; } = string.Empty;
        public string SmRegistryContainerName { get; set; } = string.Empty;
        public string AasRegistryContainerName { get; set; } = string.Empty;
        public string OrgaName { get; set; } = string.Empty;
        public long OrgaId { get; set; }
        public ulong MongoMaxMem { get; set; }
        public ulong MongoMem { get; set; }
        public ulong MqttMaxMem { get; set; }
        public ulong MqttMem { get; set; }
        public ulong DiscoveryMaxMem { get; set; }
        public ulong DiscoveryMem { get; set; }
        public ulong SmRegistryMaxMem { get; set; }
        public ulong SmRegistryMem { get; set; }
        public ulong AasRegistryMaxMem { get; set; }
        public ulong AasRegistryMem { get; set; }
        public ulong AasEnvMaxMem { get; set; }
        public ulong AasEnvMem { get; set; }
        public long MongoMemSwap { get; set; }
        public long MqttMemSwap { get; set; }
        public long DiscoveryMemSwap { get; set; }
        public long SmRegistryMemSwap { get; set; }
        public long AasRegistryMemSwap { get; set; }
        public long AasEnvMemSwap { get; set; }
        public long MongoMemSwapSetting { get; set; }
        public long MongoMaxMemSetting { get; set; }
        public long MqttMemSwapSetting { get; set; }
        public long MqttMaxMemSetting { get; set; }
        public long DiscoveryMemSwapSetting { get; set; }
        public long DiscoveryMaxMemSetting { get; set; }
        public long SmRegistryMemSwapSetting { get; set; }
        public long SmRegistryMaxMemSetting { get; set; }
        public long AasRegistryMemSwapSetting { get; set; }
        public long AasRegistryMaxMemSetting { get; set; }
        public long AasEnvMemSwapSetting { get; set; }
        public long AasEnvMaxMemSetting { get; set; }
    }

    public enum ContainerStatus
    {
        Up,
        Down,
        Unknown,
        Running,
        Exited,
    }
}
