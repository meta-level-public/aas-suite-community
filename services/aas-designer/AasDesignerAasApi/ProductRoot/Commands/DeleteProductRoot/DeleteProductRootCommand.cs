using AasDesignerApi.Model;
using AasDesignerModel;
using AasShared.Configuration;
using MediatR;

namespace AasDesignerAasApi.ProductRoot.Commands.DeleteProductRoot;

public class DeleteProductRootCommand : IRequest<bool>
{
    public AppUser AppUser { get; set; } = null!;
    public required long Id { get; set; }
}

public class DeleteProductRootHandler : IRequestHandler<DeleteProductRootCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly AppSettings _settings;

    public DeleteProductRootHandler(IApplicationDbContext context, AppSettings settings)
    {
        _context = context;
        _settings = settings;
    }

    public async Task<bool> Handle(
        DeleteProductRootCommand request,
        CancellationToken cancellationToken
    )
    {
        var verifyProductRoot = new AasDesignerApi.Model.ProductRoot()
        {
            BesitzerId = request.AppUser.BenutzerId,
            Besitzer = request.AppUser.Benutzer,
        };
        verifyProductRoot.VerifyDeleteAllowed(request.AppUser);

        var existing = _context.ProductRoots.FirstOrDefault(p =>
            p.Id == request.Id
            && p.BesitzerOrganisationId == request.AppUser.OrganisationId
            && !p.Geloescht
        );
        if (existing == null)
        {
            throw new Exception($"ProductRoot with name {request.Id} does not exists.");
        }

        _context.Remove(existing);
        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
