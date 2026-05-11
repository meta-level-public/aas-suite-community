using AasDesignerApi.Model;
using AasDesignerCommon.Utils;
using AasDesignerModel;
using AasDesignerModel.Model;
using AasShared.Configuration;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AasDesignerAasApi.Infrastructure.Commands.UpdateInfrastructure;

public class UpdateInfrastructureCommand : IRequest<bool>
{
    public AppUser AppUser { get; set; } = null!;
    public AasInfrastructureSettingsDto AasInfrastructureSettings { get; set; } = null!;
}

public class UpdateInfrastructureHandler : IRequestHandler<UpdateInfrastructureCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly AppSettings _appsettings;

    public UpdateInfrastructureHandler(IApplicationDbContext context, AppSettings appSettings)
    {
        _context = context;
        _appsettings = appSettings;
    }

    public async Task<bool> Handle(
        UpdateInfrastructureCommand request,
        CancellationToken cancellationToken
    )
    {
        var infrastructure = await _context
            .Organisations.Include(o =>
                o.AasInfrastructureSettings.Where(s => s.Id == request.AasInfrastructureSettings.Id)
            )
            .Where(o => o.Id == request.AppUser.OrganisationId)
            .Select(x =>
                x.AasInfrastructureSettings.FirstOrDefault(x =>
                    x.Id == request.AasInfrastructureSettings.Id
                )
            )
            .FirstOrDefaultAsync();

        if (infrastructure == null)
            throw new Exception("Setting not found");

        infrastructure.AasDiscoveryVersion = request.AasInfrastructureSettings.AasDiscoveryVersion;
        infrastructure.AasRegistryVersion = request.AasInfrastructureSettings.AasRegistryVersion;
        infrastructure.AasRepositoryVersion = request
            .AasInfrastructureSettings
            .AasRepositoryVersion;
        infrastructure.SubmodelRegistryVersion = request
            .AasInfrastructureSettings
            .SubmodelRegistryVersion;
        infrastructure.SubmodelRepositoryVersion = request
            .AasInfrastructureSettings
            .SubmodelRepositoryVersion;
        infrastructure.ConceptDescriptionRepositoryVersion = request
            .AasInfrastructureSettings
            .ConceptDescriptionRepositoryVersion;

        infrastructure.MongoContainer = $"aas-suite-mongo-{infrastructure.ContainerGuid}";
        infrastructure.MqttContainer = infrastructure.IsGoInfrastructure
            ? $"aas-suite-go-mqtt-{infrastructure.ContainerGuid}"
            : $"aas-suite-mqtt-{infrastructure.ContainerGuid}";
        infrastructure.AasEnvContainer = infrastructure.IsGoInfrastructure
            ? $"aas-suite-go-aas-env-{infrastructure.ContainerGuid}"
            : $"aas-suite-aas-env-{infrastructure.ContainerGuid}";
        infrastructure.AasRegistryContainer = infrastructure.IsGoInfrastructure
            ? $"aas-suite-go-aas-registry-{infrastructure.ContainerGuid}"
            : $"aas-suite-aas-registry-{infrastructure.ContainerGuid}";
        infrastructure.SmRegistryContainer = infrastructure.IsGoInfrastructure
            ? $"aas-suite-go-sm-registry-{infrastructure.ContainerGuid}"
            : $"aas-suite-sm-registry-{infrastructure.ContainerGuid}";
        infrastructure.AasDiscoveryContainer = infrastructure.IsGoInfrastructure
            ? $"aas-suite-go-aas-discovery-{infrastructure.ContainerGuid}"
            : $"aas-suite-aas-discovery-{infrastructure.ContainerGuid}";

        _context.SaveChanges();
        var externalUrl =
            $"{_appsettings.BaseUrl.AppendSlash()}aas-proxy/" + infrastructure.Id + "/aas-repo/";
        InfrastructureChangeRequester.RequestInfrastructureChange(
            infrastructure.ContainerGuid,
            _appsettings.ContainerManagerInboxDirectory,
            infrastructure,
            externalUrl
        );

        return true;
    }
}
