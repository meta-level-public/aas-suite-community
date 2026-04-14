using AasDesignerApi.Model;
using AasDesignerCommon.Model;
using AasDesignerCommon.Shells;
using AasDesignerModel;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AasDesignerAasApi.Shells.Commands.SaveShell;

public class SaveShellCommand : IRequest<SaveShellResult>
{
    public AppUser AppUser { get; set; } = null!;
    public string PlainJson { get; set; } = string.Empty;
    public List<ProvidedFile> ProvidedFileStreams { get; set; } = [];
    public bool CreateChangelogEntry { get; set; } = true;
    public required EditorDescriptor EditorDescriptor { get; set; }
    public List<string> DeletedSubmodels { get; internal set; } = [];
}

public class SaveShellHandler : IRequestHandler<SaveShellCommand, SaveShellResult>
{
    private readonly IApplicationDbContext _context;

    public SaveShellHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<SaveShellResult> Handle(
        SaveShellCommand request,
        CancellationToken cancellationToken
    )
    {
        var orga = await _context
            .Organisations.Where(o => o.Id == request.AppUser.OrganisationId)
            .FirstOrDefaultAsync();

        if (orga == null)
            throw new Exception("Organisation not found");

        return await SaveShellInInfrastructure.UpdateSingle(
            request.PlainJson,
            request.AppUser,
            orga,
            request.ProvidedFileStreams,
            cancellationToken,
            request.EditorDescriptor,
            _context,
            request.CreateChangelogEntry,
            "Update",
            request.DeletedSubmodels
        );
    }
}
