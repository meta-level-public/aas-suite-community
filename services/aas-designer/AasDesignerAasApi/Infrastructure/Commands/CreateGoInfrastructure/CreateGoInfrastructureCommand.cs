using AasDesignerCommon.Model;
using AasDesignerCommon.Utils;
using AasDesignerModel;
using AasDesignerModel.Model;
using AasShared.Configuration;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace AasDesignerAasApi.Infrastructure.Commands.CreateGoInfrastructure;

public class CreateGoInfrastructureCommand : IRequest<bool>
{
    public long OrganisationId { get; set; }
}

public class CreateGoInfrastructureHandler : IRequestHandler<CreateGoInfrastructureCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly AppSettings _appSettings;
    private readonly IHostEnvironment _env;
    private readonly ILogger<CreateGoInfrastructureHandler> _logger;

    public CreateGoInfrastructureHandler(
        IApplicationDbContext context,
        AppSettings appSettings,
        IHostEnvironment env,
        ILogger<CreateGoInfrastructureHandler> logger
    )
    {
        _context = context;
        _appSettings = appSettings;
        _env = env;
        _logger = logger;
    }

    public async Task<bool> Handle(
        CreateGoInfrastructureCommand request,
        CancellationToken cancellationToken
    )
    {
        var orga = await _context
            .Organisations.Where(o => o.Id == request.OrganisationId)
            .FirstOrDefaultAsync(cancellationToken);

        if (orga == null)
            throw new Exception("Organisation not found");

        var alreadyHasGoInfra = await _context.AasInfrastructureSettings.AnyAsync(
            s => s.OrganisationId == orga.Id && s.IsGoInfrastructure && !s.Geloescht,
            cancellationToken
        );

        if (alreadyHasGoInfra)
            throw new InvalidOperationException(
                "Organisation already has a BaSyx Go infrastructure."
            );

        var maxPort = _context.Organisations.Max(o => o.MaxHostPort);
        if (maxPort == 0)
            maxPort = _appSettings.StartContainerPort;

        var guid = Guid.NewGuid().ToString();
        var guidShort = guid.Replace("-", "")[..12];
        var dbName = $"basyx_{guidShort}";
        var dbUser = $"gouser_{guidShort}";
        var dbPassword = Convert
            .ToHexString(System.Security.Cryptography.RandomNumberGenerator.GetBytes(24))
            .ToLower();

        var containerInfos = new ContainerInfos
        {
            Guid = guid,
            HostPortAasEnv = maxPort + 1,
            HostPortAasRegistry = maxPort + 2,
            HostPortSmRegistry = maxPort + 3,
            HostPortAasDiscovery = maxPort + 4,
            HostPortMqtt = maxPort + 5,
            VersionAasDiscovery = "SNAPSHOT",
            VersionAasRegistry = "SNAPSHOT",
            VersionAasEnv = "SNAPSHOT",
            VersionSmRegistry = "SNAPSHOT",
            AasEnvMemory = 256_000_000,
            AasRegistryMemory = 128_000_000,
            SmRegistryMemory = 128_000_000,
            AasDiscoveryMemory = 128_000_000,
            Action = "create",
            ContainerStatus = "started",
            ExternalUrl = $"{_appSettings.BaseUrl.AppendSlash()}aas-proxy/aas-repo/",
            IsGoInfrastructure = true,
            GoPostgresDbName = dbName,
            GoPostgresUser = dbUser,
            GoPostgresPassword = dbPassword,
        };

        orga.MaxHostPort = maxPort + 5;

        var aasEnvContainer = $"aas-suite-go-aas-env-{guid}";
        var aasRegistryContainer = $"aas-suite-go-aas-registry-{guid}";
        var smRegistryContainer = $"aas-suite-go-sm-registry-{guid}";
        var aasDiscoveryContainer = $"aas-suite-go-aas-discovery-{guid}";

        var aasEnvBaseUrl = _env.IsDevelopment()
            ? $"{_appSettings.ContainerHost}:{containerInfos.HostPortAasEnv}"
            : $"http://{aasEnvContainer}:8081";
        var aasRegistryBaseUrl = _env.IsDevelopment()
            ? $"{_appSettings.ContainerHost}:{containerInfos.HostPortAasRegistry}"
            : $"http://{aasRegistryContainer}:8082";
        var smRegistryBaseUrl = _env.IsDevelopment()
            ? $"{_appSettings.ContainerHost}:{containerInfos.HostPortSmRegistry}"
            : $"http://{smRegistryContainer}:8083";
        var aasDiscoveryBaseUrl = _env.IsDevelopment()
            ? $"{_appSettings.ContainerHost}:{containerInfos.HostPortAasDiscovery}"
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
            ContainerGuid = guid,
            MqttContainer = $"aas-suite-go-mqtt-{guid}",
            AasEnvContainer = aasEnvContainer,
            AasRegistryContainer = aasRegistryContainer,
            SmRegistryContainer = smRegistryContainer,
            AasDiscoveryContainer = aasDiscoveryContainer,
            HostPortAasEnv = containerInfos.HostPortAasEnv,
            HostPortAasRegistry = containerInfos.HostPortAasRegistry,
            HostPortAasDiscovery = containerInfos.HostPortAasDiscovery,
            HostPortMqtt = containerInfos.HostPortMqtt,
            HostPortSmRegistry = containerInfos.HostPortSmRegistry,
            InternalPortAasEnv = 8081,
            InternalPortAasRegistry = 8082,
            InternalPortAasDiscovery = 8081,
            InternalPortMqtt = 1883,
            InternalPortSmRegistry = 8083,
            IsInternal = true,
            IsActive = true,
            IsReadonly = false,
            IsGoInfrastructure = true,
            GoPostgresDbName = dbName,
            GoPostgresUser = dbUser,
            Name = "Internal Infrastructure (BaSyx Go)",
            Description = "Internal Infrastructure (BaSyx Go)",
            OrganisationId = orga.Id,
        };

        _logger.LogInformation(
            "Requesting Go infrastructure for organisation {OrganisationId} with GUID {Guid}",
            orga.Id,
            guid
        );

        _context.AasInfrastructureSettings.Add(infra);
        _context.SaveChanges();

        var infoString = System.Text.Json.JsonSerializer.Serialize(containerInfos);
        var inboxDirectory = _appSettings.ContainerManagerInboxDirectory;
        if (!string.IsNullOrWhiteSpace(inboxDirectory))
            Directory.CreateDirectory(inboxDirectory);

        var path = Path.Combine(inboxDirectory, $"containerInfos-{Guid.NewGuid()}.json");
        System.IO.File.WriteAllText(path, infoString);

        _logger.LogInformation("Go ContainerInfos written to {Path}", path);

        return true;
    }
}
