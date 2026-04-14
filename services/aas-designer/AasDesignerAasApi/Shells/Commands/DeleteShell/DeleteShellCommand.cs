using AasDesignerApi.Model;
using AasDesignerCommon.Shells;
using AasDesignerModel;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AasDesignerAasApi.Shells.Command.DeleteShell;

public class DeleteShellCommand : IRequest<bool>
{
    public AppUser AppUser { get; set; } = null!;
    public string AasIdentifier { get; set; } = string.Empty;
}

public class DeleteShellHandler : IRequestHandler<DeleteShellCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public DeleteShellHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<bool> Handle(DeleteShellCommand request, CancellationToken cancellationToken)
    {
        var orga = await _context
            .Organisations.Where(o => o.Id == request.AppUser.OrganisationId)
            .FirstOrDefaultAsync();

        if (orga == null)
            throw new Exception("Organisation not found");

        // editorDescriptor besorgen
        var editorDescriptor = (
            await ShellLoader.LoadAsync(
                request.AppUser.CurrentInfrastructureSettings,
                request.AasIdentifier,
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

        return true;
    }
}
