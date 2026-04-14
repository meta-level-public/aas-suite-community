using AasDesignerApi.Model;
using AasDesignerModel;
using AasShared.Configuration;
using MediatR;

namespace AasDesignerAasApi.ProductDesignation.Commands.UpdateProductDesignation;

public class UpdateProductDesignationCommand : IRequest<bool>
{
    public AppUser AppUser { get; set; } = null!;
    public required ProductDesignationDto ProductDesignationDto { get; set; }
}

public class UpdateProductDesignationHandler
    : IRequestHandler<UpdateProductDesignationCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly AppSettings _settings;

    public UpdateProductDesignationHandler(IApplicationDbContext context, AppSettings settings)
    {
        _context = context;
        _settings = settings;
    }

    public async Task<bool> Handle(
        UpdateProductDesignationCommand request,
        CancellationToken cancellationToken
    )
    {
        var verifyProductDesignation = new AasDesignerApi.Model.ProductDesignation()
        {
            BesitzerId = request.AppUser.BenutzerId,
            Besitzer = request.AppUser.Benutzer,
        };
        verifyProductDesignation.VerifyUpdateAllowed(request.AppUser);

        var existing = _context.ProductDesignations.FirstOrDefault(p =>
            p.Id == request.ProductDesignationDto.Id
            && p.BesitzerOrganisationId == request.AppUser.OrganisationId
            && !p.Geloescht
        );
        if (existing == null)
        {
            throw new Exception(
                $"ProductDesignation with name {request.ProductDesignationDto.Id} does not exists."
            );
        }

        existing.Name = request.ProductDesignationDto.Name;
        existing.AenderungsDatum = DateTime.Now;

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
