using AasDesignerApi.Model;
using AasDesignerModel;
using AasShared.Configuration;
using MediatR;

namespace AasDesignerAasApi.ProductRoot.Commands.AddProductRoot;

public class AddProductRootCommand : IRequest<bool>
{
    public AppUser AppUser { get; set; } = null!;
    public required ProductRootDto ProductRootDto { get; set; }
}

public class AddProductRootHandler : IRequestHandler<AddProductRootCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly AppSettings _settings;

    public AddProductRootHandler(IApplicationDbContext context, AppSettings settings)
    {
        _context = context;
        _settings = settings;
    }

    public async Task<bool> Handle(
        AddProductRootCommand request,
        CancellationToken cancellationToken
    )
    {
        var verifyProductRoot = new AasDesignerApi.Model.ProductRoot()
        {
            BesitzerId = request.AppUser.BenutzerId,
            Besitzer = request.AppUser.Benutzer,
        };
        verifyProductRoot.VerifyInsertAllowed(request.AppUser);

        var existing = _context
            .ProductRoots.Where(p =>
                p.BesitzerOrganisationId == request.AppUser.OrganisationId
                && p.Name.Trim().ToLower() == request.ProductRootDto.Name.Trim().ToLower()
                && !p.Geloescht
            )
            .ToList();

        if (existing.Count > 0)
        {
            throw new Exception(
                $"ProductRoot with name {request.ProductRootDto.Name} already exists."
            );
        }

        var productRoot = new AasDesignerApi.Model.ProductRoot
        {
            Name = request.ProductRootDto.Name,
            MlpKeyValues = request.ProductRootDto.MlpKeyValues,
            BesitzerOrganisationId = request.AppUser.OrganisationId,
            AnlageDatum = DateTime.Now,
            AenderungsDatum = DateTime.Now,
            Geloescht = false,
        };

        _context.ProductRoots.Add(productRoot);
        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
