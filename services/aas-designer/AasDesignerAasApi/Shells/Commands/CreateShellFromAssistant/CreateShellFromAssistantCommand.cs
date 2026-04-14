using AasDesignerApi.Model;
using AasDesignerCommon.Model;
using AasDesignerCommon.Shells;
using AasDesignerModel;
using AasShared.Configuration;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AasDesignerAasApi.Shells.Commands.CreateShellFromAssistant;

public class CreateShellFromAssistantCommand : IRequest<SaveShellResult>
{
    public AppUser AppUser { get; set; } = null!;
    public string PlainJson { get; set; } = string.Empty;
    public List<ProvidedFile> ProvidedFiles { get; set; } = [];
}

public class CreateShellFromAssistantHandler
    : IRequestHandler<CreateShellFromAssistantCommand, SaveShellResult>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly AppSettings _appSettings;

    public CreateShellFromAssistantHandler(
        IApplicationDbContext context,
        IMapper mapper,
        AppSettings appSettings
    )
    {
        _context = context;
        _mapper = mapper;
        _appSettings = appSettings;
    }

    public async Task<SaveShellResult> Handle(
        CreateShellFromAssistantCommand request,
        CancellationToken cancellationToken
    )
    {
        var orga = await _context
            .Organisations.Where(o => o.Id == request.AppUser.OrganisationId)
            .FirstOrDefaultAsync();

        if (orga == null)
            throw new Exception("Organisation not found");

        return await SaveShellInInfrastructure.SaveSingle(
            request.PlainJson,
            request.AppUser,
            orga,
            _appSettings.BaseUrl,
            request.ProvidedFiles,
            _context,
            cancellationToken
        );
    }
}
