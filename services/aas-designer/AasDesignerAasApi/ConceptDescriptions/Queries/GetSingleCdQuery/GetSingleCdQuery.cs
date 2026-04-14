using System.Text;
using AasDesignerApi.Model;
using AasDesignerCommon.Utils;
using AasDesignerModel;
using AutoMapper;
using MediatR;

namespace AasDesignerAasApi.ConceptDescriptions.Queries.GetSingleCd;

public class GetSingleCdQuery : IRequest<string>
{
    public AppUser AppUser { get; set; } = null!;
    public string Id { get; set; } = string.Empty;
}

public class GetSingleCdHandler : IRequestHandler<GetSingleCdQuery, string>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetSingleCdHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<string> Handle(GetSingleCdQuery request, CancellationToken cancellationToken)
    {
        // jetzt den BasyxServer anfragen
        using var client = HttpClientCreator.CreateHttpClient(request.AppUser);

        var url =
            request.AppUser.CurrentInfrastructureSettings.ConceptDescriptionRepositoryUrl.AppendSlash()
            + "concept-descriptions/"
            + request.Id.ToBase64UrlEncoded(Encoding.UTF8);

        var response = await client.GetAsync(url, cancellationToken);
        var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

        return responseContent ?? string.Empty;
    }
}
