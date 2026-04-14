using AasCore.Aas3_1;
using AasDesignerApi.Model;
using AasDesignerCommon.Utils;
using AasDesignerModel;
using MediatR;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace AasDesignerAasApi.ConceptDescriptions.Queries.GetSmList;

public class GetSmListQuery : IRequest<SmVm>
{
    public AppUser AppUser { get; set; } = null!;
    public string? Cursor { get; set; }
    public int Count { get; set; } = 10;
    public string FilterIdShort { get; set; } = string.Empty;
}

public class GetSmListHandler : IRequestHandler<GetSmListQuery, SmVm>
{
    private readonly IApplicationDbContext _context;

    public GetSmListHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<SmVm> Handle(GetSmListQuery request, CancellationToken cancellationToken)
    {
        var result = new SmVm();

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
            request.AppUser.CurrentInfrastructureSettings.SubmodelRepositoryUrl.AppendSlash()
            + "submodels?"
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
            if (res["result"] is not JArray smJsonArr)
            {
                return result;
            }

            foreach (var smJson in smJsonArr)
            {
                if (smJson == null || smJson.Type == JTokenType.Null)
                    continue;
                var jsonNode = AasCore.Aas3_1.Jsonization.Serialize.ToJsonObject(
                    smJson.ToObject<Submodel>()
                        ?? throw new Exception("Could not parse submodel JSON")
                );
                var sm = Jsonization.Deserialize.SubmodelFrom(jsonNode);
                result.SmList.Add(new SmDto { Id = sm.Id, IdShort = sm.IdShort ?? string.Empty });
            }
            var duplicateCountById = result
                .SmList.GroupBy(sm => sm.Id, StringComparer.Ordinal)
                .ToDictionary(g => g.Key, g => g.Count(), StringComparer.Ordinal);
            var duplicateIndexById = new Dictionary<string, int>(StringComparer.Ordinal);

            foreach (var sm in result.SmList)
            {
                duplicateIndexById.TryGetValue(sm.Id, out var currentIndex);
                currentIndex++;
                duplicateIndexById[sm.Id] = currentIndex;

                sm.DuplicateCount = duplicateCountById.GetValueOrDefault(sm.Id, 1);
                sm.DuplicateIndex = currentIndex;
                sm.HasDuplicateId = sm.DuplicateCount > 1;
            }
            result.Cursor = res["paging_metadata"]?["cursor"]?.ToString();
        }

        return result;
    }
}
