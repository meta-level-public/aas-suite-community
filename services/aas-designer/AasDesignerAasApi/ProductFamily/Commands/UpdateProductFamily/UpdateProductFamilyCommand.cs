using AasDesignerApi.Model;
using AasDesignerModel;
using AasShared.Configuration;
using MediatR;

namespace AasDesignerAasApi.ProductFamily.Commands.UpdateProductFamily;

public class UpdateProductFamilyCommand : IRequest<bool>
{
    public AppUser AppUser { get; set; } = null!;
    public required ProductFamilyDto ProductFamilyDto { get; set; }
}

public class UpdateProductFamilyHandler : IRequestHandler<UpdateProductFamilyCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly AppSettings _settings;

    public UpdateProductFamilyHandler(IApplicationDbContext context, AppSettings settings)
    {
        _context = context;
        _settings = settings;
    }

    public async Task<bool> Handle(
        UpdateProductFamilyCommand request,
        CancellationToken cancellationToken
    )
    {
        var verifyProductFamily = new AasDesignerApi.Model.ProductFamily()
        {
            BesitzerId = request.AppUser.BenutzerId,
            Besitzer = request.AppUser.Benutzer,
        };
        verifyProductFamily.VerifyUpdateAllowed(request.AppUser);

        var existing = _context.ProductFamilys.FirstOrDefault(p =>
            p.Id == request.ProductFamilyDto.Id
            && p.BesitzerOrganisationId == request.AppUser.OrganisationId
            && !p.Geloescht
        );
        if (existing == null)
        {
            throw new Exception(
                $"ProductFamily with name {request.ProductFamilyDto.Id} does not exists."
            );
        }

        existing.Name = request.ProductFamilyDto.Name;
        existing.AenderungsDatum = DateTime.Now;

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
