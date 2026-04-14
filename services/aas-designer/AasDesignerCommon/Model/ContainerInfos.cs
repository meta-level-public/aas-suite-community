namespace AasDesignerCommon.Model
{
    public class ContainerInfos
    {
        public string Guid { get; set; } = string.Empty;
        public int HostPortAasEnv { get; set; }
        public string VersionAasEnv { get; set; } = string.Empty;
        public long AasEnvMemory { get; set; } = 512000000;
        public long AasEnvMemorySwap { get; set; } = -1;

        public int HostPortAasRegistry { get; set; }
        public string VersionAasRegistry { get; set; } = string.Empty;
        public long AasRegistryMemory { get; set; } = 512000000;
        public long AasRegistryMemorySwap { get; set; } = -1;

        public int HostPortSmRegistry { get; set; }
        public string VersionSmRegistry { get; set; } = string.Empty;
        public long SmRegistryMemory { get; set; } = 512000000;
        public long SmRegistryMemorySwap { get; set; } = -1;

        public int HostPortAasDiscovery { get; set; }
        public string VersionAasDiscovery { get; set; } = string.Empty;
        public long AasDiscoveryMemory { get; set; } = 256000000;
        public long AasDiscoveryMemorySwap { get; set; } = -1;

        public string VersionCdRepository { get; set; } = string.Empty;

        public int HostPortMqtt { get; set; }
        public long MqttMemory { get; set; } = 128000000;
        public long MqttMemorySwap { get; set; } = -1;

        public long MongoMemory { get; set; } = 128000000;
        public long MongoMemorySwap { get; set; } = -1;

        public string Action { get; set; } = string.Empty;
        public string ContainerStatus { get; set; } = string.Empty;

        // public string BasyxVersion { get; set; } = "1.0.0";
        public string ExternalUrl { get; set; } = string.Empty;
    }
}
