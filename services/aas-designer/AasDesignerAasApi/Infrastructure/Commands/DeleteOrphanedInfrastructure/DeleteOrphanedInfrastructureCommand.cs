using AasDesignerApi.Extensions;
using AasDesignerApi.Model;
using AasDesignerModel;
using AasDesignerModel.Model;
using AasShared.Configuration;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;

namespace AasDesignerAasApi.Infrastructure.Commands.DeleteOrphanedInfrastructure;

public class DeleteOrphanedInfrastructureCommand : IRequest<bool>
{
    public long InfrastructureId { get; set; }
}

public class DeleteOrphanedInfrastructureHandler
    : IRequestHandler<DeleteOrphanedInfrastructureCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly AppSettings _appSettings;

    public DeleteOrphanedInfrastructureHandler(
        IApplicationDbContext context,
        AppSettings appSettings
    )
    {
        _context = context;
        _appSettings = appSettings;
    }

    public async Task<bool> Handle(
        DeleteOrphanedInfrastructureCommand request,
        CancellationToken cancellationToken
    )
    {
        var setting = await _context
            .AasInfrastructureSettings.Where(s =>
                s.Id == request.InfrastructureId
                && s.IsInternal
                && !string.IsNullOrWhiteSpace(s.ContainerGuid)
            )
            .FirstOrDefaultAsync(cancellationToken);

        if (setting == null)
            throw new Exception("Orphaned infrastructure not found");

        // ensure that no organisation actually exists anymore
        var orgaExists = await _context.Organisations.AnyAsync(
            o => o.Id == setting.OrganisationId,
            cancellationToken
        );
        if (orgaExists)
            throw new InvalidOperationException(
                "Infrastructure still has a referencing organisation and cannot be deleted as orphan."
            );

        _context.Apikeys.RemoveRange(
            _context.Apikeys.Where(a => a.AasInfrastructureSettingsId == setting.Id)
        );

        _context.AasInfrastructureSettings.RemoveHardDelete(setting);

        InfrastructureChangeRequester.RequestInfrastructureRemoval(
            setting.ContainerGuid,
            _appSettings.ContainerManagerInboxDirectory
        );

        var deleteProtocol = new DeleteProtocol
        {
            DeleteType = DeleteType.Infrastructure,
            AdditionalData = JsonConvert.SerializeObject(
                new { InfraName = setting.Name, InfraGuid = setting.ContainerGuid }
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
