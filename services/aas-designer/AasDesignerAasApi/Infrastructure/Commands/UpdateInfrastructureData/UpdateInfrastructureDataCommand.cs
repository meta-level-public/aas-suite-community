using AasDesignerApi.Model;
using AasDesignerModel;
using MediatR;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.EntityFrameworkCore;

namespace AasDesignerAasApi.Infrastructure.Commands.UpdateInfrastructureData;

public class UpdateInfrastructureDataCommand : IRequest<bool>
{
    public AppUser AppUser { get; set; } = null!;
    public AasInfrastructureSettingsDto AasInfrastructureSettings { get; set; } = null!;
}

public class UpdateInfrastructureDataHandler
    : IRequestHandler<UpdateInfrastructureDataCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public UpdateInfrastructureDataHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(
        UpdateInfrastructureDataCommand request,
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

        infrastructure.Name = request.AasInfrastructureSettings.Name;
        infrastructure.Description = request.AasInfrastructureSettings.Description;

        // Internal infrastructures must keep real target addresses in DB.
        // Proxy addresses are only used in API/UI responses.
        if (!infrastructure.IsInternal && !infrastructure.HandleAsInternal)
        {
            infrastructure.AasDiscoveryUrl = request.AasInfrastructureSettings.AasDiscoveryUrl;
            infrastructure.AasDiscoveryHcUrl = request.AasInfrastructureSettings.AasDiscoveryHcUrl;
            infrastructure.AasDiscoveryHcEnabled = request
                .AasInfrastructureSettings
                .AasDiscoveryHcEnabled;

            infrastructure.AasRegistryUrl = request.AasInfrastructureSettings.AasRegistryUrl;
            infrastructure.AasRegistryHcUrl = request.AasInfrastructureSettings.AasRegistryHcUrl;
            infrastructure.AasRegistryHcEnabled = request
                .AasInfrastructureSettings
                .AasRegistryHcEnabled;

            infrastructure.AasRepositoryUrl = request.AasInfrastructureSettings.AasRepositoryUrl;
            infrastructure.AasRepositoryHcUrl = request
                .AasInfrastructureSettings
                .AasRepositoryHcUrl;
            infrastructure.AasRepositoryHcEnabled = request
                .AasInfrastructureSettings
                .AasRepositoryHcEnabled;

            infrastructure.SubmodelRegistryUrl = request
                .AasInfrastructureSettings
                .SubmodelRegistryUrl;
            infrastructure.SubmodelRegistryHcUrl = request
                .AasInfrastructureSettings
                .SubmodelRegistryHcUrl;
            infrastructure.SubmodelRegistryHcEnabled = request
                .AasInfrastructureSettings
                .SubmodelRegistryHcEnabled;

            infrastructure.SubmodelRepositoryUrl = request
                .AasInfrastructureSettings
                .SubmodelRepositoryUrl;
            infrastructure.SubmodelRepositoryHcUrl = request
                .AasInfrastructureSettings
                .SubmodelRepositoryHcUrl;
            infrastructure.SubmodelRepositoryHcEnabled = request
                .AasInfrastructureSettings
                .SubmodelRepositoryHcEnabled;

            infrastructure.ConceptDescriptionRepositoryUrl = request
                .AasInfrastructureSettings
                .ConceptDescriptionRepositoryUrl;
            infrastructure.ConceptDescriptionRepositoryHcUrl = request
                .AasInfrastructureSettings
                .ConceptDescriptionRepositoryHcUrl;
            infrastructure.ConceptDescriptionRepositoryHcEnabled = request
                .AasInfrastructureSettings
                .ConceptDescriptionRepositoryHcEnabled;
        }

        infrastructure.HeaderParameters = request.AasInfrastructureSettings.HeaderParameters;
        infrastructure.IsActive = request.AasInfrastructureSettings.IsActive;
        infrastructure.IsReadonly = request.AasInfrastructureSettings.IsReadonly;

        // var byteCert = Convert.FromBase64String(request.AasInfrastructureSettings.Certificate);

        if (
            request.AasInfrastructureSettings.Certificate != null
            && request.AasInfrastructureSettings.Certificate.Length > 0
        )
        {
            infrastructure.Certificate = request.AasInfrastructureSettings.Certificate;
            infrastructure.CertificatePassword = request
                .AasInfrastructureSettings
                .CertificatePassword;
        }
        else
        {
            infrastructure.Certificate = null;
            infrastructure.CertificatePassword = string.Empty;
        }

        _context.SaveChanges();

        return true;
    }
}
