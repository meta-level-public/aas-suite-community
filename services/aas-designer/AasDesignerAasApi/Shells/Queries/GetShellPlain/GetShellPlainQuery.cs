using AasCore.Aas3_1;
using AasDesignerApi.Model;
using AasDesignerCommon.Shells;
using AasDesignerModel;
using AasShared.Configuration;
using AutoMapper;
using MediatR;

namespace AasDesignerAasApi.Shells.Queries.GetShellPlain;

public class GetShellPlainQuery : IRequest<ShellPlainVm>
{
    public AppUser AppUser { get; set; } = null!;
    public string AasIdentifier { get; set; } = string.Empty;
}

public class GetShellPlainHandler : IRequestHandler<GetShellPlainQuery, ShellPlainVm>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly AppSettings _appSettings;

    public GetShellPlainHandler(
        IApplicationDbContext context,
        IMapper mapper,
        AppSettings appSettings
    )
    {
        _context = context;
        _mapper = mapper;
        _appSettings = appSettings;
    }

    public async Task<ShellPlainVm> Handle(
        GetShellPlainQuery request,
        CancellationToken cancellationToken
    )
    {
        var result = new ShellPlainVm();

        var shellLoadResult = await ShellLoader.LoadAsync(
            request.AppUser.CurrentInfrastructureSettings,
            request.AasIdentifier,
            cancellationToken,
            request.AppUser
        );
        if (shellLoadResult.Environment == null)
            throw new Exception("AAS not found");

        result.AasId =
            shellLoadResult.Environment.AssetAdministrationShells?[0]?.Id ?? string.Empty;
        result.PlainJson = Jsonization
            .Serialize.ToJsonObject(shellLoadResult.Environment)
            .ToJsonString();

        return result;
    }
}
