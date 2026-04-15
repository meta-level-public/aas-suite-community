using System.Text.Json;
using AasDesignerApi.Model;
using AasDesignerCommon.Model;
using AasDesignerCommon.Utils;
using AasDesignerModel;
using AasDesignerModel.Model;
using AasShared.Configuration;
using Microsoft.Extensions.Hosting;

namespace AasDesignerApi.Orga
{
    public class InfrastructureRequester
    {
        private readonly AppSettings _appsSettings;
        private readonly IApplicationDbContext _context;
        private readonly ILogger<InfrastructureRequester> _logger;
        private readonly IHostEnvironment _env;

        public InfrastructureRequester(
            AppSettings appSettings,
            IApplicationDbContext context,
            ILogger<InfrastructureRequester> logger,
            IHostEnvironment env
        )
        {
            _appsSettings = appSettings;
            _context = context;
            _logger = logger;
            _env = env;
        }

        public void RequestInfrastructure(Organisation organisation, string status = "started")
        {
            // Request infrastructure
            var maxPort = _context.Organisations.Max(o => o.MaxHostPort);
            if (maxPort == 0)
            {
                maxPort = _appsSettings.StartContainerPort;
            }

            var containerInfos = new ContainerInfos
            {
                Guid = Guid.NewGuid().ToString(),
                HostPortAasEnv = maxPort + 1,
                HostPortAasRegistry = maxPort + 2,
                HostPortSmRegistry = maxPort + 3,
                HostPortAasDiscovery = maxPort + 4,
                HostPortMqtt = maxPort + 5,
                VersionAasDiscovery = "2.0.0-milestone-04",
                VersionAasRegistry = "2.0.0-milestone-04",
                VersionAasEnv = "2.0.0-milestone-04",
                VersionSmRegistry = "2.0.0-milestone-04",
                Action = "create",
                ContainerStatus = status,
                ExternalUrl = $"{_appsSettings.BaseUrl.AppendSlash()}aas-proxy/aas-repo/",
            };

            organisation.MaxHostPort = maxPort + 5;
            organisation.InternalAasInfrastructureGuid = containerInfos.Guid;

            var aasEnvContainer = $"aas-suite-aas-env-{containerInfos.Guid}";
            var aasRegistryContainer = $"aas-suite-aas-registry-{containerInfos.Guid}";
            var smRegistryContainer = $"aas-suite-sm-registry-{containerInfos.Guid}";
            var aasDiscoveryContainer = $"aas-suite-aas-discovery-{containerInfos.Guid}";

            var aasEnvBaseUrl = _env.IsDevelopment()
                ? $"{_appsSettings.ContainerHost}:{containerInfos.HostPortAasEnv}"
                : $"http://{aasEnvContainer}:8081";
            var aasRegistryBaseUrl = _env.IsDevelopment()
                ? $"{_appsSettings.ContainerHost}:{containerInfos.HostPortAasRegistry}"
                : $"http://{aasRegistryContainer}:8080";
            var smRegistryBaseUrl = _env.IsDevelopment()
                ? $"{_appsSettings.ContainerHost}:{containerInfos.HostPortSmRegistry}"
                : $"http://{smRegistryContainer}:8080";
            var aasDiscoveryBaseUrl = _env.IsDevelopment()
                ? $"{_appsSettings.ContainerHost}:{containerInfos.HostPortAasDiscovery}"
                : $"http://{aasDiscoveryContainer}:8081";

            var infra = new AasInfrastructureSettings
            {
                AasDiscoveryUrl = aasDiscoveryBaseUrl,
                AasDiscoveryVersion = containerInfos.VersionAasDiscovery,
                AasDiscoveryHcUrl = $"{aasDiscoveryBaseUrl}/health",
                AasDiscoveryHcEnabled = true,

                AasRegistryUrl = aasRegistryBaseUrl,
                AasRegistryVersion = containerInfos.VersionAasRegistry,
                AasRegistryHcUrl = $"{aasRegistryBaseUrl}/health",
                AasRegistryHcEnabled = true,

                AasRepositoryUrl = aasEnvBaseUrl,
                AasRepositoryVersion = containerInfos.VersionAasEnv,
                AasRepositoryHcUrl = $"{aasEnvBaseUrl}/health",
                AasRepositoryHcEnabled = true,

                SubmodelRegistryUrl = smRegistryBaseUrl,
                SubmodelRegistryVersion = containerInfos.VersionSmRegistry,
                SubmodelRegistryHcUrl = $"{smRegistryBaseUrl}/health",
                SubmodelRegistryHcEnabled = true,

                SubmodelRepositoryUrl = aasEnvBaseUrl,
                SubmodelRepositoryVersion = containerInfos.VersionAasEnv,
                SubmodelRepositoryHcUrl = $"{aasEnvBaseUrl}/health",
                SubmodelRepositoryHcEnabled = true,

                ConceptDescriptionRepositoryUrl = aasEnvBaseUrl,
                ConceptDescriptionRepositoryVersion = containerInfos.VersionAasEnv,
                ConceptDescriptionRepositoryHcUrl = $"{aasEnvBaseUrl}/health",
                ConceptDescriptionRepositoryHcEnabled = true,

                ContainerGuid = containerInfos.Guid,
                MongoContainer = $"aas-suite-mongo-{containerInfos.Guid}",
                MqttContainer = $"aas-suite-mqtt-{containerInfos.Guid}",
                AasEnvContainer = aasEnvContainer,
                AasRegistryContainer = aasRegistryContainer,
                SmRegistryContainer = smRegistryContainer,
                AasDiscoveryContainer = aasDiscoveryContainer,

                // BasyxVersion = "1.0.0",
                HostPortAasEnv = containerInfos.HostPortAasEnv,
                HostPortAasRegistry = containerInfos.HostPortAasRegistry,
                HostPortAasDiscovery = containerInfos.HostPortAasDiscovery,
                HostPortMqtt = containerInfos.HostPortMqtt,
                HostPortSmRegistry = containerInfos.HostPortSmRegistry,
                InternalPortAasEnv = 8081,
                InternalPortAasRegistry = 8080,
                InternalPortAasDiscovery = 8081,
                InternalPortMqtt = 1883,
                InternalPortSmRegistry = 8080,
                IsInternal = true,
                IsActive = status == "started",
                IsReadonly = false,
                Name = "Internal Infrastructure",
                Description = "Internal Infrastructure",

                OrganisationId = organisation.Id,
            };

            _logger.LogInformation(
                "Requesting infrastructure for organisation {OrganisationId} with GUID {Guid}",
                organisation.Id,
                containerInfos.Guid
            );
            _logger.LogInformation(
                "ContainerInfos: {ContainerInfos}",
                JsonSerializer.Serialize(containerInfos)
            );

            _context.AasInfrastructureSettings.Add(infra);
            _context.SaveChanges();

            // URLs in DB must remain the real target endpoints.
            // Proxy URLs are derived at response time for UI display.

            // Infodatei schreiben
            var infoString = JsonSerializer.Serialize(containerInfos);
            var inboxDirectory = _appsSettings.ContainerManagerInboxDirectory;
            if (!string.IsNullOrWhiteSpace(inboxDirectory))
            {
                Directory.CreateDirectory(inboxDirectory);
            }

            var path = Path.Combine(inboxDirectory, $"containerInfos-{Guid.NewGuid()}.json");
            System.IO.File.WriteAllText(path, infoString);

            _logger.LogInformation("ContainerInfos written to {Path}", path);
        }
    }
}
