using AasDesignerApi.Model;
using AasDesignerModel;
using AasShared.Configuration;
using MediatR;

namespace AasDesignerAasApi.ProductDesignation.Commands.AddProductDesignation;

public class AddProductDesignationCommand : IRequest<bool>
{
    public AppUser AppUser { get; set; } = null!;
    public required ProductDesignationDto ProductDesignationDto { get; set; }
}

public class AddProductDesignationHandler : IRequestHandler<AddProductDesignationCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly AppSettings _settings;

    public AddProductDesignationHandler(IApplicationDbContext context, AppSettings settings)
    {
        _context = context;
        _settings = settings;
    }

    public async Task<bool> Handle(
        AddProductDesignationCommand request,
        CancellationToken cancellationToken
    )
    {
        var verifyProductDesignation = new AasDesignerApi.Model.ProductDesignation()
        {
            BesitzerId = request.AppUser.BenutzerId,
            Besitzer = request.AppUser.Benutzer,
        };
        verifyProductDesignation.VerifyInsertAllowed(request.AppUser);

        var existing = _context
            .ProductDesignations.Where(p =>
                p.BesitzerOrganisationId == request.AppUser.OrganisationId
                && p.Name.Trim().ToLower() == request.ProductDesignationDto.Name.Trim().ToLower()
                && !p.Geloescht
            )
            .ToList();

        if (existing.Count > 0)
        {
            throw new Exception(
                $"ProductDesignation with name {request.ProductDesignationDto.Name} already exists."
            );
        }

        var ProductDesignation = new AasDesignerApi.Model.ProductDesignation
        {
            Name = request.ProductDesignationDto.Name,
            MlpKeyValues = request.ProductDesignationDto.MlpKeyValues,
            BesitzerOrganisationId = request.AppUser.OrganisationId,
            AnlageDatum = DateTime.Now,
            AenderungsDatum = DateTime.Now,
            Geloescht = false,
        };

        _context.ProductDesignations.Add(ProductDesignation);
        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
