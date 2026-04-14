using AasDesignerApi.Model;
using AasDesignerModel;
using AasShared.Configuration;
using MediatR;

namespace AasDesignerAasApi.ProductFamily.Commands.DeleteProductFamily;

public class DeleteProductFamilyCommand : IRequest<bool>
{
    public AppUser AppUser { get; set; } = null!;
    public required long Id { get; set; }
}

public class DeleteProductFamilyHandler : IRequestHandler<DeleteProductFamilyCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly AppSettings _settings;

    public DeleteProductFamilyHandler(IApplicationDbContext context, AppSettings settings)
    {
        _context = context;
        _settings = settings;
    }

    public async Task<bool> Handle(
        DeleteProductFamilyCommand request,
        CancellationToken cancellationToken
    )
    {
        var verifyProductFamily = new AasDesignerApi.Model.ProductFamily()
        {
            BesitzerId = request.AppUser.BenutzerId,
            Besitzer = request.AppUser.Benutzer,
        };
        verifyProductFamily.VerifyDeleteAllowed(request.AppUser);

        var existing = _context.ProductFamilys.FirstOrDefault(p =>
            p.Id == request.Id
            && p.BesitzerOrganisationId == request.AppUser.OrganisationId
            && !p.Geloescht
        );
        if (existing == null)
        {
            throw new Exception($"ProductFamily with name {request.Id} does not exists.");
        }

        _context.Remove(existing);
        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
