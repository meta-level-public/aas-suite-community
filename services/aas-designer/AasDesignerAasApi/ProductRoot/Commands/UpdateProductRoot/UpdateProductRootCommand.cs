using AasDesignerApi.Model;
using AasDesignerModel;
using AasShared.Configuration;
using MediatR;

namespace AasDesignerAasApi.ProductRoot.Commands.UpdateProductRoot;

public class UpdateProductRootCommand : IRequest<bool>
{
    public AppUser AppUser { get; set; } = null!;
    public required ProductRootDto ProductRootDto { get; set; }
}

public class UpdateProductRootHandler : IRequestHandler<UpdateProductRootCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly AppSettings _settings;

    public UpdateProductRootHandler(IApplicationDbContext context, AppSettings settings)
    {
        _context = context;
        _settings = settings;
    }

    public async Task<bool> Handle(
        UpdateProductRootCommand request,
        CancellationToken cancellationToken
    )
    {
        var verifyProductRoot = new AasDesignerApi.Model.ProductRoot()
        {
            BesitzerId = request.AppUser.BenutzerId,
            Besitzer = request.AppUser.Benutzer,
        };
        verifyProductRoot.VerifyUpdateAllowed(request.AppUser);

        var existing = _context.ProductRoots.FirstOrDefault(p =>
            p.Id == request.ProductRootDto.Id
            && p.BesitzerOrganisationId == request.AppUser.OrganisationId
            && !p.Geloescht
        );
        if (existing == null)
        {
            throw new Exception(
                $"ProductRoot with name {request.ProductRootDto.Id} does not exists."
            );
        }

        existing.Name = request.ProductRootDto.Name;
        existing.AenderungsDatum = DateTime.Now;

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
