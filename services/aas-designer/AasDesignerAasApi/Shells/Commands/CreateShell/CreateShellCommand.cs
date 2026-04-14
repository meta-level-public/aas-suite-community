using AasCore.Aas3_1;
using AasDesignerApi.Model;
using AasDesignerCommon.Shells;
using AasDesignerCommon.Submodels;
using AasDesignerCommon.Utils;
using AasDesignerModel;
using AasShared.Configuration;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AasDesignerAasApi.Shells.Commands.CreateShell;

public class CreateShellCommand : IRequest<SaveShellResult>
{
    public AppUser AppUser { get; set; } = null!;
}

public class CreateShellHandler : IRequestHandler<CreateShellCommand, SaveShellResult>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly AppSettings _appSettings;

    public CreateShellHandler(
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
        CreateShellCommand request,
        CancellationToken cancellationToken
    )
    {
        var orga = await _context
            .Organisations.Where(o => o.Id == request.AppUser.OrganisationId)
            .FirstOrDefaultAsync();

        if (orga == null)
            throw new Exception("Organisation not found");

        using var client = HttpClientCreator.CreateHttpClient(request.AppUser);

        var administration = new AdministrativeInformation
        {
            Version = "1",
            Revision = "0",
            Creator = new Reference(
                ReferenceTypes.ExternalReference,
                [new Key(KeyTypes.GlobalReference, "AasDesigner")]
            ),
        };
        var assetInformation = new AssetInformation(
            AssetKind.Instance,
            IdGenerationUtil.GenerateId(IdType.Asset, orga.IriPrefix)
        );

        var aas = new AssetAdministrationShell(
            IdGenerationUtil.GenerateId(IdType.Aas, orga.IriPrefix),
            assetInformation
        )
        {
            Administration = administration,
        };

        var url =
            request.AppUser.CurrentInfrastructureSettings.AasRepositoryUrl.AppendSlash() + "shells";

        var env = new AasCore.Aas3_1.Environment();

        var changelogSubmodel = AasDesignerChangelogCreator.Create(request.AppUser, orga);

        env.Submodels = [changelogSubmodel];
        aas.Submodels =
        [
            new Reference(
                ReferenceTypes.ModelReference,
                [new Key(KeyTypes.Submodel, changelogSubmodel.Id)]
            ),
        ];
        env.AssetAdministrationShells = [aas];

        env.ConceptDescriptions = [AasDesignerChangelogCreator.GetConceptDescription()];

        var envString = Jsonization.Serialize.ToJsonObject(env).ToJsonString();

        var createdAasId = await SaveShellInInfrastructure.SaveSingle(
            envString,
            request.AppUser,
            orga,
            _appSettings.BaseUrl,
            [],
            _context,
            cancellationToken
        );

        // var aasJsonString = BasyxSerializer.Serialize(aas);
        // var response = await client.PostAsync(url, new StringContent(aasJsonString, Encoding.UTF8, "application/json"), cancellationToken);
        // var content = await response.Content.ReadAsStringAsync(cancellationToken);
        // response.EnsureSuccessStatusCode();

        return createdAasId;
    }
}
