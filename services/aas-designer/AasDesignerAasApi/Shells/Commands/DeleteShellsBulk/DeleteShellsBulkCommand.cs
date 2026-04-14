using AasDesignerApi.Model;
using AasDesignerCommon.Shells;
using AasDesignerModel;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AasDesignerAasApi.Shells.Command.DeleteShellsBulk;

public class DeleteShellsBulkCommand : IRequest<bool>
{
    public AppUser AppUser { get; set; } = null!;
    public List<string> AasIdentifiers { get; set; } = [];
}

public class DeleteShellsBulkHandler : IRequestHandler<DeleteShellsBulkCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public DeleteShellsBulkHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<bool> Handle(
        DeleteShellsBulkCommand request,
        CancellationToken cancellationToken
    )
    {
        var orga = await _context
            .Organisations.Where(o => o.Id == request.AppUser.OrganisationId)
            .FirstOrDefaultAsync();

        if (orga == null)
            throw new Exception("Organisation not found");

        foreach (var aasIdentifier in request.AasIdentifiers)
        {
            // editorDescriptor besorgen
            var editorDescriptor = (
                await ShellLoader.LoadAsync(
                    request.AppUser.CurrentInfrastructureSettings,
                    aasIdentifier,
                    cancellationToken,
                    request.AppUser
                )
            ).EditorDescriptor;

            await ShellDeleter.DeleteShell(
                editorDescriptor,
                request.AppUser.CurrentInfrastructureSettings,
                cancellationToken,
                request.AppUser
            );
        }

        return true;
    }
}
