using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AasDesignerCommon.Model;
using AasDesignerModel;
using AasDesignerModel.Model;

namespace AasDesignerApi.Utils
{
    public class SingleTenantInfrastructureUtil
    {
        private static string VersionOrDash(string? value)
        {
            return string.IsNullOrWhiteSpace(value) ? "-" : value;
        }

        public static void CreateSingleTenantInfrastructure(
            Model.Organisation orga,
            IApplicationDbContext context,
            AasShared.Configuration.AppSettings appSettings
        )
        {
            // Create single tenant infrastructure

            orga.InternalAasInfrastructureGuid = Guid.NewGuid().ToString();

            orga.AasInfrastructureSettings.Add(
                new AasInfrastructureSettings
                {
                    AasDiscoveryUrl = appSettings.InitialAasDiscoveryUrl,
                    AasDiscoveryVersion = VersionOrDash(appSettings.InitialAasDiscoveryVersion),
                    AasDiscoveryHcUrl = appSettings.InitialAasDiscoveryHcUrl,
                    AasDiscoveryHcEnabled = true,

                    AasRegistryUrl = appSettings.InitialAasRegistryUrl,
                    AasRegistryVersion = VersionOrDash(appSettings.InitialAasRegistryVersion),
                    AasRegistryHcUrl = appSettings.InitialAasRegistryHcUrl,
                    AasRegistryHcEnabled = true,

                    AasRepositoryUrl = appSettings.InitialAasRepositoryUrl,
                    AasRepositoryVersion = VersionOrDash(appSettings.InitialAasRepositoryVersion),
                    AasRepositoryHcUrl = appSettings.InitialAasRepositoryHcUrl,
                    AasRepositoryHcEnabled = true,

                    SubmodelRegistryUrl = appSettings.InitialSubmodelRegistryUrl,
                    SubmodelRegistryVersion = VersionOrDash(
                        appSettings.InitialSubmodelRegistryVersion
                    ),
                    SubmodelRegistryHcUrl = appSettings.InitialSubmodelRegistryHcUrl,
                    SubmodelRegistryHcEnabled = true,

                    SubmodelRepositoryUrl = appSettings.InitialSubmodelRepositoryUrl,
                    SubmodelRepositoryVersion = VersionOrDash(
                        appSettings.InitialSubmodelRepositoryVersion
                    ),
                    SubmodelRepositoryHcUrl = appSettings.InitialSubmodelRepositoryHcUrl,
                    SubmodelRepositoryHcEnabled = true,

                    ConceptDescriptionRepositoryUrl =
                        appSettings.InitialConceptDescriptionRepositoryUrl,
                    ConceptDescriptionRepositoryVersion = VersionOrDash(
                        appSettings.InitialConceptDescriptionRepositoryVersion
                    ),
                    ConceptDescriptionRepositoryHcUrl =
                        appSettings.InitialConceptDescriptionRepositoryHcUrl,
                    ConceptDescriptionRepositoryHcEnabled = true,

                    AasEnvContainer = appSettings.InitialAasRepositoryContainer,
                    SmRegistryContainer = appSettings.InitialSubmodelRegistryContainer,
                    AasRegistryContainer = appSettings.InitialAasRegistryContainer,
                    AasDiscoveryContainer = appSettings.InitialAasDiscoveryContainer,

                    // BasyxVersion = "1.0.0",
                    HostPortAasEnv = appSettings.InitialAasRepositoryContainerPort,
                    HostPortAasRegistry = appSettings.InitialAasRegistryContainerPort,
                    HostPortAasDiscovery = appSettings.InitialAasDiscoveryContainerPort,
                    HostPortSmRegistry = appSettings.InitialSubmodelRegistryContainerPort,
                    HostPortMqtt = 0,
                    IsInternal = appSettings.HandleInitialInfrastructureAsInternal,
                    HandleAsInternal = false,
                    InternalPortAasEnv = appSettings.InitialAasRepositoryContainerPort,
                    InternalPortAasRegistry = appSettings.InitialAasRegistryContainerPort,
                    InternalPortAasDiscovery = appSettings.InitialAasDiscoveryContainerPort,
                    InternalPortSmRegistry = appSettings.InitialSubmodelRegistryContainerPort,
                    IsActive = true,
                    IsReadonly = false,
                    Name = "Internal Infrastructure",
                    Description = "Internal Infrastructure",
                }
            );

            context.SaveChanges();
        }

        public static void SynchronizeSingleTenantInfrastructureVersions(
            IApplicationDbContext context,
            AasShared.Configuration.AppSettings appSettings
        )
        {
            var infraSettings = context
                .AasInfrastructureSettings.Where(i =>
                    i.IsActive
                    && (i.IsInternal || i.HandleAsInternal || i.Name == "Internal Infrastructure")
                )
                .ToList();

            if (!infraSettings.Any())
            {
                return;
            }

            var discoveryVersion = VersionOrDash(appSettings.InitialAasDiscoveryVersion);
            var registryVersion = VersionOrDash(appSettings.InitialAasRegistryVersion);
            var repositoryVersion = VersionOrDash(appSettings.InitialAasRepositoryVersion);
            var submodelRegistryVersion = VersionOrDash(appSettings.InitialSubmodelRegistryVersion);
            var submodelRepositoryVersion = VersionOrDash(
                appSettings.InitialSubmodelRepositoryVersion
            );
            var conceptDescriptionVersion = VersionOrDash(
                appSettings.InitialConceptDescriptionRepositoryVersion
            );
            var discoveryHcUrl = appSettings.InitialAasDiscoveryHcUrl;
            var registryHcUrl = appSettings.InitialAasRegistryHcUrl;
            var repositoryHcUrl = appSettings.InitialAasRepositoryHcUrl;
            var submodelRegistryHcUrl = appSettings.InitialSubmodelRegistryHcUrl;
            var submodelRepositoryHcUrl = appSettings.InitialSubmodelRepositoryHcUrl;
            var conceptDescriptionHcUrl = appSettings.InitialConceptDescriptionRepositoryHcUrl;

            foreach (var infra in infraSettings)
            {
                infra.IsInternal = appSettings.HandleInitialInfrastructureAsInternal;
                infra.HandleAsInternal = false;
                infra.AasDiscoveryUrl = appSettings.InitialAasDiscoveryUrl;
                infra.AasDiscoveryVersion = discoveryVersion;
                infra.AasDiscoveryHcUrl = discoveryHcUrl;
                infra.AasDiscoveryHcEnabled = true;
                infra.AasRegistryUrl = appSettings.InitialAasRegistryUrl;
                infra.AasRegistryVersion = registryVersion;
                infra.AasRegistryHcUrl = registryHcUrl;
                infra.AasRegistryHcEnabled = true;
                infra.AasRepositoryUrl = appSettings.InitialAasRepositoryUrl;
                infra.AasRepositoryVersion = repositoryVersion;
                infra.AasRepositoryHcUrl = repositoryHcUrl;
                infra.AasRepositoryHcEnabled = true;
                infra.SubmodelRegistryUrl = appSettings.InitialSubmodelRegistryUrl;
                infra.SubmodelRegistryVersion = submodelRegistryVersion;
                infra.SubmodelRegistryHcUrl = submodelRegistryHcUrl;
                infra.SubmodelRegistryHcEnabled = true;
                infra.SubmodelRepositoryUrl = appSettings.InitialSubmodelRepositoryUrl;
                infra.SubmodelRepositoryVersion = submodelRepositoryVersion;
                infra.SubmodelRepositoryHcUrl = submodelRepositoryHcUrl;
                infra.SubmodelRepositoryHcEnabled = true;
                infra.ConceptDescriptionRepositoryUrl =
                    appSettings.InitialConceptDescriptionRepositoryUrl;
                infra.ConceptDescriptionRepositoryVersion = conceptDescriptionVersion;
                infra.ConceptDescriptionRepositoryHcUrl = conceptDescriptionHcUrl;
                infra.ConceptDescriptionRepositoryHcEnabled = true;
            }
        }
    }
}
