using AasDesignerApi.Model;
using AasDesignerCommon.Utils;
using AasDesignerModel;
using AutoMapper;
using MediatR;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace AasDesignerAasApi.ConceptDescriptions.Queries.GetCdList;

public class GetCdListQuery : IRequest<CdVm>
{
    public AppUser AppUser { get; set; } = null!;
    public string? Cursor { get; set; }
    public int Count { get; set; } = 10;
    public string FilterIdShort { get; set; } = string.Empty;
}

public class GetCdListHandler : IRequestHandler<GetCdListQuery, CdVm>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetCdListHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<CdVm> Handle(GetCdListQuery request, CancellationToken cancellationToken)
    {
        var result = new CdVm();

        using var client = HttpClientCreator.CreateHttpClient(request.AppUser);

        var parameters = new List<KeyValuePair<string, string>>
        {
            new KeyValuePair<string, string>("limit", request.Count.ToString()),
        };
        if (!string.IsNullOrEmpty(request.Cursor))
        {
            parameters.Add(new KeyValuePair<string, string>("cursor", request.Cursor));
        }
        if (!string.IsNullOrWhiteSpace(request.FilterIdShort))
        {
            parameters.Add(new KeyValuePair<string, string>("idShort", request.FilterIdShort));
        }

        var queryParams = string.Join("&", parameters.Select(p => $"{p.Key}={p.Value}"));

        var url =
            request.AppUser.CurrentInfrastructureSettings.ConceptDescriptionRepositoryUrl.AppendSlash()
            + "concept-descriptions?"
            + queryParams;

        var response = await client.GetAsync(url, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            return result;
        }

        var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);
        if (string.IsNullOrWhiteSpace(responseContent))
        {
            return result;
        }

        var res = JsonConvert.DeserializeObject<JObject>(responseContent);

        if (res != null)
        {
            if (res["result"] is not JArray cdJsonArr)
            {
                return result;
            }

            foreach (var cdJson in cdJsonArr)
            {
                if (cdJson == null || cdJson.Type == JTokenType.Null)
                    continue;
                result.CdList.Add(cdJson.ToString(Formatting.None));
            }
            result.Cursor = res["paging_metadata"]?["cursor"]?.ToString();
        }

        return result;
    }
}
