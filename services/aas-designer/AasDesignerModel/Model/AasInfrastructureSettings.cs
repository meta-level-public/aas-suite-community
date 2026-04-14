using AasDesignerApi.Model;

namespace AasDesignerModel.Model
{
    public class AasInfrastructureSettings : IMetadata, IHardDeletable
    {
        public long Id { get; set; }
        public long OrganisationId { get; set; }
        public Organisation Organisation { get; set; } = null!;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;

        public string AasDiscoveryUrl { get; set; } = string.Empty;
        public string AasDiscoveryVersion { get; set; } = string.Empty;
        public string AasDiscoveryHcUrl { get; set; } = string.Empty;
        public bool AasDiscoveryHcEnabled { get; set; } = true;

        public string AasRegistryUrl { get; set; } = string.Empty;
        public string AasRegistryVersion { get; set; } = string.Empty;
        public string AasRegistryHcUrl { get; set; } = string.Empty;
        public bool AasRegistryHcEnabled { get; set; } = true;

        public string AasRepositoryUrl { get; set; } = string.Empty;
        public string AasRepositoryVersion { get; set; } = string.Empty;
        public string AasRepositoryHcUrl { get; set; } = string.Empty;
        public bool AasRepositoryHcEnabled { get; set; } = true;

        public string SubmodelRegistryUrl { get; set; } = string.Empty;
        public string SubmodelRegistryVersion { get; set; } = string.Empty;
        public string SubmodelRegistryHcUrl { get; set; } = string.Empty;
        public bool SubmodelRegistryHcEnabled { get; set; } = true;

        public string SubmodelRepositoryUrl { get; set; } = string.Empty;
        public string SubmodelRepositoryVersion { get; set; } = string.Empty;
        public string SubmodelRepositoryHcUrl { get; set; } = string.Empty;
        public bool SubmodelRepositoryHcEnabled { get; set; } = true;

        public string ConceptDescriptionRepositoryUrl { get; set; } = string.Empty;
        public string ConceptDescriptionRepositoryVersion { get; set; } = string.Empty;
        public string ConceptDescriptionRepositoryHcUrl { get; set; } = string.Empty;
        public bool ConceptDescriptionRepositoryHcEnabled { get; set; } = true;
        public List<HeaderParameter> HeaderParameters { get; set; } = [];

        public byte[]? Certificate { get; set; }
        public string CertificatePassword { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;
        public bool IsInternal { get; set; } = false;
        public bool HandleAsInternal { get; set; } = false;
        public bool IsReadonly { get; set; } = false;

        // public string BasyxVersion { get; set; } = "1.0.0";
        public string AasEnvContainer { get; set; } = string.Empty;
        public int HostPortAasEnv { get; set; }
        public long AasEnvMemory { get; set; } = 768;
        public long AasEnvMemSwap { get; set; } = -1;

        public string AasDiscoveryContainer { get; set; } = string.Empty;
        public int HostPortAasDiscovery { get; set; }
        public long DiscoveryMemory { get; set; } = 512;
        public long DiscoveryMemSwap { get; set; } = -1;

        public string AasRegistryContainer { get; set; } = string.Empty;
        public int HostPortAasRegistry { get; set; }
        public long AasRegistryMemory { get; set; } = 512;
        public long AasRegistryMemSwap { get; set; } = -1;

        public string SmRegistryContainer { get; set; } = string.Empty;
        public int HostPortSmRegistry { get; set; }
        public long SmRegistryMemory { get; set; } = 512;
        public long SmRegistryMemSwap { get; set; } = -1;

        public string MqttContainer { get; set; } = string.Empty;
        public int HostPortMqtt { get; set; }
        public long MqttMemory { get; set; } = 128;
        public long MqttMemSwap { get; set; } = -1;

        public string MongoContainer { get; set; } = string.Empty;
        public long MongoMemory { get; set; } = 128;
        public long MongoMemSwap { get; set; } = -1;

        public string ContainerGuid { get; set; } = string.Empty;

        public int InternalPortAasEnv { get; set; } = 8081;
        public int InternalPortAasRegistry { get; set; } = 8080;
        public int InternalPortAasDiscovery { get; set; } = 8081;
        public int InternalPortMqtt { get; set; } = 1883;
        public int InternalPortSmRegistry { get; set; } = 8080;

        public bool UsesInternalRouting()
        {
            return IsInternal || HandleAsInternal;
        }

        public string GetConfiguredServiceUrl(string type)
        {
            return type switch
            {
                "aas-discovery" => AasDiscoveryUrl,
                "discovery" => AasDiscoveryUrl,
                "aas-repo" => AasRepositoryUrl,
                "aas-repository" => AasRepositoryUrl,
                "aas-reg" => AasRegistryUrl,
                "aas-registry" => AasRegistryUrl,
                "sm-repo" => SubmodelRepositoryUrl,
                "sm-repository" => SubmodelRepositoryUrl,
                "sm-reg" => SubmodelRegistryUrl,
                "sm-registry" => SubmodelRegistryUrl,
                "cd-repo" => ConceptDescriptionRepositoryUrl,
                "cd-repository" => ConceptDescriptionRepositoryUrl,
                _ => throw new ArgumentOutOfRangeException(nameof(type), type, "Unknown type"),
            };
        }

        public string GetResolvedServiceUrl(string type)
        {
            if (UsesInternalRouting())
            {
                var internalUrl = GetInternalServiceUrl(type);
                if (!string.IsNullOrWhiteSpace(internalUrl))
                {
                    return internalUrl;
                }
            }

            return GetConfiguredServiceUrl(type);
        }

        public void ApplyInternalServiceUrls()
        {
            if (!UsesInternalRouting())
            {
                return;
            }

            (AasDiscoveryUrl, AasDiscoveryHcUrl) = ApplyInternalServiceUrl(
                AasDiscoveryUrl,
                AasDiscoveryHcUrl,
                AasDiscoveryContainer,
                InternalPortAasDiscovery
            );
            (AasRegistryUrl, AasRegistryHcUrl) = ApplyInternalServiceUrl(
                AasRegistryUrl,
                AasRegistryHcUrl,
                AasRegistryContainer,
                InternalPortAasRegistry
            );
            (AasRepositoryUrl, AasRepositoryHcUrl) = ApplyInternalServiceUrl(
                AasRepositoryUrl,
                AasRepositoryHcUrl,
                AasEnvContainer,
                InternalPortAasEnv
            );
            (SubmodelRegistryUrl, SubmodelRegistryHcUrl) = ApplyInternalServiceUrl(
                SubmodelRegistryUrl,
                SubmodelRegistryHcUrl,
                SmRegistryContainer,
                InternalPortSmRegistry
            );
            (SubmodelRepositoryUrl, SubmodelRepositoryHcUrl) = ApplyInternalServiceUrl(
                SubmodelRepositoryUrl,
                SubmodelRepositoryHcUrl,
                AasEnvContainer,
                InternalPortAasEnv
            );
            (ConceptDescriptionRepositoryUrl, ConceptDescriptionRepositoryHcUrl) =
                ApplyInternalServiceUrl(
                    ConceptDescriptionRepositoryUrl,
                    ConceptDescriptionRepositoryHcUrl,
                    AasEnvContainer,
                    InternalPortAasEnv
                );
        }

        #region Verwaltungsdaten
        public DateTime AnlageDatum { get; set; } = DateTime.Now;
        public string AnlageBenutzer { get; set; } = string.Empty;
        public DateTime AenderungsDatum { get; set; } = DateTime.Now;
        public string AenderungsBenutzer { get; set; } = string.Empty;
        public bool Geloescht { get; set; } = false;
        public int AenderungsZaehler { get; set; } = 0;

        #endregion

        private string GetInternalServiceUrl(string type)
        {
            return type switch
            {
                "aas-discovery" => BuildInternalBaseUrl(
                    AasDiscoveryContainer,
                    InternalPortAasDiscovery
                ),
                "discovery" => BuildInternalBaseUrl(
                    AasDiscoveryContainer,
                    InternalPortAasDiscovery
                ),
                "aas-repo" => BuildInternalBaseUrl(AasEnvContainer, InternalPortAasEnv),
                "aas-repository" => BuildInternalBaseUrl(AasEnvContainer, InternalPortAasEnv),
                "aas-reg" => BuildInternalBaseUrl(AasRegistryContainer, InternalPortAasRegistry),
                "aas-registry" => BuildInternalBaseUrl(
                    AasRegistryContainer,
                    InternalPortAasRegistry
                ),
                "sm-repo" => BuildInternalBaseUrl(AasEnvContainer, InternalPortAasEnv),
                "sm-repository" => BuildInternalBaseUrl(AasEnvContainer, InternalPortAasEnv),
                "sm-reg" => BuildInternalBaseUrl(SmRegistryContainer, InternalPortSmRegistry),
                "sm-registry" => BuildInternalBaseUrl(SmRegistryContainer, InternalPortSmRegistry),
                "cd-repo" => BuildInternalBaseUrl(AasEnvContainer, InternalPortAasEnv),
                "cd-repository" => BuildInternalBaseUrl(AasEnvContainer, InternalPortAasEnv),
                _ => string.Empty,
            };
        }

        private static (string ServiceUrl, string HealthUrl) ApplyInternalServiceUrl(
            string serviceUrl,
            string healthUrl,
            string containerName,
            int internalPort
        )
        {
            var baseUrl = BuildInternalBaseUrl(containerName, internalPort);
            if (string.IsNullOrWhiteSpace(baseUrl))
            {
                return (serviceUrl, healthUrl);
            }

            return (baseUrl, $"{baseUrl}/health");
        }

        private static string BuildInternalBaseUrl(string containerName, int internalPort)
        {
            if (string.IsNullOrWhiteSpace(containerName) || internalPort <= 0)
            {
                return string.Empty;
            }

            return $"http://{containerName}:{internalPort}";
        }
    }
}
