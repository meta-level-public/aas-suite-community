using System.Text;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;
using AasCore.Aas3_1;
using AasDesignerApi.Model;
using AasDesignerCommon.Utils;
using AasDesignerModel;
using AutoMapper;
using MediatR;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json.Serialization;

namespace AasDesignerAasApi.Shells.Queries.SearchShells;

public class SearchShellsQuery : IRequest<ShellListVm>
{
    public AppUser AppUser { get; set; } = null!;
    public ShellSearchParams SearchParams { get; set; } = new ShellSearchParams();
}

public class SearchShellsHandler : IRequestHandler<SearchShellsQuery, ShellListVm>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public SearchShellsHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<ShellListVm> Handle(
        SearchShellsQuery request,
        CancellationToken cancellationToken
    )
    {
        var result = new ShellListVm { Shells = new List<ShellListDto>() };

        using var client = HttpClientCreator.CreateHttpClient(request.AppUser);
        var idShort = request.SearchParams.IdShort?.Trim() ?? string.Empty;
        var globalAssetId = request.SearchParams.GlobalAssetId?.Trim() ?? string.Empty;
        var escapedIdShort = Regex.Escape(idShort);
        var escapedGlobalAssetId = Regex.Escape(globalAssetId);

        if (string.IsNullOrWhiteSpace(idShort) && string.IsNullOrWhiteSpace(globalAssetId))
        {
            return result;
        }

        var basyxSearchParams = new BasyxSearchParams();

        if (!string.IsNullOrEmpty(idShort))
        {
            basyxSearchParams.Query = new Query
            {
                QueryType = "regex",
                Path = "idShort",
                Value = $".*{escapedIdShort}.*",
            };
        }
        else if (!string.IsNullOrEmpty(globalAssetId))
        {
            basyxSearchParams.Query = new Query
            {
                QueryType = "regex",
                Path = "globalAssetId",
                Value = $".*{escapedGlobalAssetId}.*",
            };
        }
        else
        {
            basyxSearchParams.Query = new Query
            {
                QueryType = "regex",
                Path = "idShort",
                Value = ".*",
            };
        }

        var registryUrl = request.AppUser.CurrentInfrastructureSettings.AasRegistryUrl;
        if (string.IsNullOrWhiteSpace(registryUrl))
        {
            return await LoadFromRepository(request, cancellationToken, client);
        }

        var url = registryUrl.AppendSlash() + "search";
        if (!Uri.TryCreate(url, UriKind.Absolute, out _))
        {
            return await LoadFromRepository(request, cancellationToken, client);
        }

        var settings = new JsonSerializerSettings
        {
            NullValueHandling = NullValueHandling.Ignore,
            ContractResolver = new CamelCasePropertyNamesContractResolver(),
        };
        var jsonString = JsonConvert.SerializeObject(
            basyxSearchParams,
            Formatting.Indented,
            settings
        );
        var content = new StringContent(jsonString, Encoding.UTF8, "application/json");
        try
        {
            var response = await client.PostAsync(url, content, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                return await LoadFromRepository(request, cancellationToken, client);
            }

            var responseContent = await response.Content.ReadAsStringAsync();

            var res = JsonConvert.DeserializeObject<BasyxSearchResult>(responseContent);
            if (res == null)
            {
                return await LoadFromRepository(request, cancellationToken, client);
            }

            // TODO: Werte Verarbeiten und zurückliefern
            if (res.Hits != null)
            {
                foreach (var descriptor in res.Hits)
                {
                    var shell = new ShellListDto
                    {
                        Id = descriptor.Id,
                        IdShort = descriptor.IdShort,
                        AssetKind = (AssetKind)Enum.Parse(typeof(AssetKind), descriptor.AssetKind),
                        GlobalAssetId = descriptor.GlobalAssetId,
                    };
                    result.Shells.Add(shell);
                }
            }

            return result;
        }
        catch
        {
            return await LoadFromRepository(request, cancellationToken, client);
        }
    }

    private async Task<ShellListVm> LoadFromRepository(
        SearchShellsQuery request,
        CancellationToken cancellationToken,
        HttpClient client
    )
    {
        var result = new ShellListVm { Shells = new List<ShellListDto>() };
        var idShort = request.SearchParams.IdShort?.Trim() ?? string.Empty;
        var globalAssetId = request.SearchParams.GlobalAssetId?.Trim() ?? string.Empty;

        var repoUrl = request.AppUser.CurrentInfrastructureSettings.AasRepositoryUrl;
        if (string.IsNullOrWhiteSpace(repoUrl))
        {
            return result;
        }

        var url = repoUrl.AppendSlash() + "shells";
        if (!Uri.TryCreate(url, UriKind.Absolute, out _))
        {
            return result;
        }

        var response = await client.GetAsync(url, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            return result;
        }

        var responseRepo = await response.Content.ReadAsStringAsync(cancellationToken);
        var res = JsonConvert.DeserializeObject<JObject>(responseRepo);
        if (res == null)
        {
            return result;
        }

        var aasList = res.Value<JArray>("result") ?? [];
        foreach (var shell in aasList)
        {
            var jsonNode = JsonNode.Parse(shell.ToString());
            if (jsonNode == null)
            {
                continue;
            }

            var aas = Jsonization.Deserialize.AssetAdministrationShellFrom(jsonNode);
            var dto = _mapper.Map<ShellListDto>(aas);

            var idShortMatches =
                string.IsNullOrWhiteSpace(idShort)
                || (
                    !string.IsNullOrWhiteSpace(dto.IdShort)
                    && dto.IdShort.Contains(idShort, StringComparison.OrdinalIgnoreCase)
                );
            var globalAssetIdMatches =
                string.IsNullOrWhiteSpace(globalAssetId)
                || (
                    !string.IsNullOrWhiteSpace(dto.GlobalAssetId)
                    && dto.GlobalAssetId.Contains(globalAssetId, StringComparison.OrdinalIgnoreCase)
                );
            if (idShortMatches && globalAssetIdMatches)
            {
                result.Shells.Add(dto);
            }
        }

        return result;
    }
}
