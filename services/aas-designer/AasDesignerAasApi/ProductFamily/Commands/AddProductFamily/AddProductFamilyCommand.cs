using AasDesignerApi.Model;
using AasDesignerModel;
using AasShared.Configuration;
using MediatR;

namespace AasDesignerAasApi.ProductFamily.Commands.AddProductFamily;

public class AddProductFamilyCommand : IRequest<bool>
{
    public AppUser AppUser { get; set; } = null!;
    public required ProductFamilyDto ProductFamilyDto { get; set; }
}

public class AddProductFamilyHandler : IRequestHandler<AddProductFamilyCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly AppSettings _settings;

    public AddProductFamilyHandler(IApplicationDbContext context, AppSettings settings)
    {
        _context = context;
        _settings = settings;
    }

    public async Task<bool> Handle(
        AddProductFamilyCommand request,
        CancellationToken cancellationToken
    )
    {
        var verifyProductFamily = new AasDesignerApi.Model.ProductFamily()
        {
            BesitzerId = request.AppUser.BenutzerId,
            Besitzer = request.AppUser.Benutzer,
        };
        verifyProductFamily.VerifyInsertAllowed(request.AppUser);

        var existing = _context
            .ProductFamilys.Where(p =>
                p.BesitzerOrganisationId == request.AppUser.OrganisationId
                && p.Name.Trim().ToLower() == request.ProductFamilyDto.Name.Trim().ToLower()
                && !p.Geloescht
            )
            .ToList();

        if (existing.Count > 0)
        {
            throw new Exception(
                $"ProductFamily with name {request.ProductFamilyDto.Name} already exists."
            );
        }

        var ProductFamily = new AasDesignerApi.Model.ProductFamily
        {
            Name = request.ProductFamilyDto.Name,
            MlpKeyValues = request.ProductFamilyDto.MlpKeyValues,
            BesitzerOrganisationId = request.AppUser.OrganisationId,
            AnlageDatum = DateTime.Now,
            AenderungsDatum = DateTime.Now,
            Geloescht = false,
        };

        _context.ProductFamilys.Add(ProductFamily);
        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
