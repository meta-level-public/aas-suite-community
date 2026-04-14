namespace AasDesignerAasApi.Infrastructure.Commands
{
    public class RecreateContainerData
    {
        public long InfrastructureId { get; set; }
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
}
