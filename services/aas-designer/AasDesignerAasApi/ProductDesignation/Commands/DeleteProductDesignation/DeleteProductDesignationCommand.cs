using AasDesignerApi.Model;
using AasDesignerModel;
using AasShared.Configuration;
using MediatR;

namespace AasDesignerAasApi.ProductDesignation.Commands.DeleteProductDesignation;

public class DeleteProductDesignationCommand : IRequest<bool>
{
    public AppUser AppUser { get; set; } = null!;
    public required long Id { get; set; }
}

public class DeleteProductDesignationHandler
    : IRequestHandler<DeleteProductDesignationCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly AppSettings _settings;

    public DeleteProductDesignationHandler(IApplicationDbContext context, AppSettings settings)
    {
        _context = context;
        _settings = settings;
    }

    public async Task<bool> Handle(
        DeleteProductDesignationCommand request,
        CancellationToken cancellationToken
    )
    {
        var verifyProductDesignation = new AasDesignerApi.Model.ProductDesignation()
        {
            BesitzerId = request.AppUser.BenutzerId,
            Besitzer = request.AppUser.Benutzer,
        };
        verifyProductDesignation.VerifyDeleteAllowed(request.AppUser);

        var existing = _context.ProductDesignations.FirstOrDefault(p =>
            p.Id == request.Id
            && p.BesitzerOrganisationId == request.AppUser.OrganisationId
            && !p.Geloescht
        );
        if (existing == null)
        {
            throw new Exception($"ProductDesignation with name {request.Id} does not exists.");
        }

        _context.Remove(existing);
        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
