using AasDesignerAasApi.Infrastructure;
using AasDesignerApi.Model;
using AasDesignerModel;
using AasDesignerModel.Model;
using AasShared.Configuration;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;

namespace AasDesignerAasApi.Infrastructure.Commands.DeleteContainerOnlyOrphan;

public class DeleteContainerOnlyOrphanCommand : IRequest<bool>
{
    public string ContainerGuid { get; set; } = string.Empty;
}

public class DeleteContainerOnlyOrphanHandler
    : IRequestHandler<DeleteContainerOnlyOrphanCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly AppSettings _appSettings;

    public DeleteContainerOnlyOrphanHandler(IApplicationDbContext context, AppSettings appSettings)
    {
        _context = context;
        _appSettings = appSettings;
    }

    public async Task<bool> Handle(
        DeleteContainerOnlyOrphanCommand request,
        CancellationToken cancellationToken
    )
    {
        if (string.IsNullOrWhiteSpace(request.ContainerGuid))
            throw new ArgumentException("ContainerGuid must not be empty.");

        // Sicherheitsguard: GUID darf keinem DB-Eintrag entsprechen
        var existsInDb = await _context.AasInfrastructureSettings.AnyAsync(
            s => s.ContainerGuid == request.ContainerGuid,
            cancellationToken
        );

        if (existsInDb)
            throw new InvalidOperationException(
                "A container with this GUID still has a matching database entry and cannot be deleted as a container-only orphan."
            );

        InfrastructureChangeRequester.RequestInfrastructureRemoval(
            request.ContainerGuid,
            _appSettings.ContainerManagerInboxDirectory
        );

        var deleteProtocol = new DeleteProtocol
        {
            DeleteType = DeleteType.Infrastructure,
            AdditionalData = JsonConvert.SerializeObject(
                new { InfraGuid = request.ContainerGuid, Source = "container-only-orphan" }
            ),
            AnlageBenutzer = "System (manual cleanup)",
            AnlageDatum = DateTime.Now,
            AenderungsBenutzer = "System (manual cleanup)",
            AenderungsDatum = DateTime.Now,
        };
        _context.Add(deleteProtocol);

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
