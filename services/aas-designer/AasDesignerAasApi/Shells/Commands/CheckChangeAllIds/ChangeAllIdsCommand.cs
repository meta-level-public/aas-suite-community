using AasDesignerAasApi.Shells.Commands.Model;
using AasDesignerApi.Model;
using AasDesignerCommon.Shells;
using AasDesignerCommon.Submodels;
using AasDesignerModel;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AasDesignerAasApi.Shells.Commands.CheckChangeAllIds;

public class CheckChangeAllIdsCommand : IRequest<List<ModificationCheckResult>>
{
    public AppUser AppUser { get; set; } = null!;
    public List<IdModification> Modifications { get; set; } = [];
}

public class CheckChangeAllIdsHandler
    : IRequestHandler<CheckChangeAllIdsCommand, List<ModificationCheckResult>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<CheckChangeAllIdsHandler> _logger;

    public CheckChangeAllIdsHandler(
        IApplicationDbContext context,
        IMapper mapper,
        ILogger<CheckChangeAllIdsHandler> logger
    )
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<List<ModificationCheckResult>> Handle(
        CheckChangeAllIdsCommand request,
        CancellationToken cancellationToken
    )
    {
        var infrastructure = request.AppUser.CurrentInfrastructureSettings;
        var orga = await _context
            .Organisations.Where(o => o.Id == request.AppUser.OrganisationId)
            .FirstOrDefaultAsync();

        if (orga == null)
            throw new Exception("Organisation not found");

        var result = new List<ModificationCheckResult>();

        // über alle änderungen laufen und die ids anpassen
        foreach (var mod in request.Modifications)
        {
            if (mod.Type == "AAS" && mod.OldId != mod.NewId)
            {
                var res = new ModificationCheckResult()
                {
                    isUnique = !await ShellLoader.CheckIfExists(
                        infrastructure,
                        mod.NewId,
                        cancellationToken,
                        request.AppUser
                    ),
                    Type = mod.Type,
                    OldId = mod.OldId,
                    NewId = mod.NewId,
                };

                result.Add(res);
            }
            else if (mod.Type == "SM")
            {
                var res = new ModificationCheckResult()
                {
                    isUnique = !await SubmodelLoader.CheckIfExists(
                        infrastructure,
                        mod.NewId,
                        cancellationToken,
                        request.AppUser
                    ),
                    Type = mod.Type,
                    OldId = mod.OldId,
                    NewId = mod.NewId,
                };

                result.Add(res);
            }
            else
            {
                _logger.LogWarning("Unknown id type: " + mod.Type);
            }
        }
        return result;
    }
}
