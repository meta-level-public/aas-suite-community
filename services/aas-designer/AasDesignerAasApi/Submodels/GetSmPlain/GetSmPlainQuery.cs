using System.Text;
using AasCore.Aas3_1;
using AasDesignerApi.Model;
using AasDesignerCommon.Utils;
using AasDesignerModel;
using MediatR;

namespace AasDesignerAasApi.ConceptDescriptions.Queries.GetSmPlain;

public class GetSmPlainQuery : IRequest<string>
{
    public AppUser AppUser { get; set; } = null!;
    public required string SmIdentifier { get; set; }
}

public class GetSmPlainHandler : IRequestHandler<GetSmPlainQuery, string>
{
    private readonly IApplicationDbContext _context;

    public GetSmPlainHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<string> Handle(GetSmPlainQuery request, CancellationToken cancellationToken)
    {
        using var client = HttpClientCreator.CreateHttpClient(request.AppUser);

        var url =
            request.AppUser.CurrentInfrastructureSettings.SubmodelRepositoryUrl.AppendSlash()
            + "submodels/"
            + request.SmIdentifier.ToBase64UrlEncoded(Encoding.UTF8);

        var response = await client.GetAsync(url, cancellationToken);
        var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

        var jsonNode = AasJsonNodeParser.Parse(responseContent);
        var submodel = Jsonization.Deserialize.SubmodelFrom(jsonNode);
        AasDateTimeValueNormalizer.NormalizeSubmodel(submodel);

        return Jsonization.Serialize.ToJsonObject(submodel).ToJsonString();
    }
}
