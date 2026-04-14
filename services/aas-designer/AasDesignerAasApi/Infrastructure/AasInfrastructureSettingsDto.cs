using AasDesignerApi.Model;
using AasDesignerModel.Model;
using AutoMapper;

namespace AasDesignerAasApi.Infrastructure;

public class AasInfrastructureSettingsDto
{
    public long Id { get; set; }
    public long OrganisationId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    public string AasDiscoveryUrl { get; set; } = string.Empty;
    public string OriginalAasDiscoveryUrl { get; set; } = string.Empty;
    public string AasDiscoveryVersion { get; set; } = string.Empty;
    public string AasDiscoveryHcUrl { get; set; } = string.Empty;
    public bool AasDiscoveryHcEnabled { get; set; } = true;

    public string AasRegistryUrl { get; set; } = string.Empty;
    public string OriginalAasRegistryUrl { get; set; } = string.Empty;
    public string AasRegistryVersion { get; set; } = string.Empty;
    public string AasRegistryHcUrl { get; set; } = string.Empty;
    public bool AasRegistryHcEnabled { get; set; } = true;

    public string AasRepositoryUrl { get; set; } = string.Empty;
    public string OriginalAasRepositoryUrl { get; set; } = string.Empty;
    public string AasRepositoryVersion { get; set; } = string.Empty;
    public string AasRepositoryHcUrl { get; set; } = string.Empty;
    public bool AasRepositoryHcEnabled { get; set; } = true;

    public string SubmodelRegistryUrl { get; set; } = string.Empty;
    public string OriginalSubmodelRegistryUrl { get; set; } = string.Empty;
    public string SubmodelRegistryVersion { get; set; } = string.Empty;
    public string SubmodelRegistryHcUrl { get; set; } = string.Empty;
    public bool SubmodelRegistryHcEnabled { get; set; } = true;

    public string SubmodelRepositoryUrl { get; set; } = string.Empty;
    public string OriginalSubmodelRepositoryUrl { get; set; } = string.Empty;
    public string SubmodelRepositoryVersion { get; set; } = string.Empty;
    public string SubmodelRepositoryHcUrl { get; set; } = string.Empty;
    public bool SubmodelRepositoryHcEnabled { get; set; } = true;

    public string ConceptDescriptionRepositoryUrl { get; set; } = string.Empty;
    public string OriginalConceptDescriptionRepositoryUrl { get; set; } = string.Empty;
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

    #region Verwaltungsdaten
    public DateTime AnlageDatum { get; set; } = DateTime.Now;
    public string AnlageBenutzer { get; set; } = string.Empty;
    public DateTime AenderungsDatum { get; set; } = DateTime.Now;
    public string AenderungsBenutzer { get; set; } = string.Empty;
    public bool Geloescht { get; set; } = false;
    public int AenderungsZaehler { get; set; } = 0;

    #endregion

    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<AasInfrastructureSettings, AasInfrastructureSettingsDto>();
            CreateMap<AasInfrastructureSettingsDto, AasInfrastructureSettings>();
        }
    }
}
