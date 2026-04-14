using System.Text;
using AasCore.Aas3_1;
using AasDesignerApi.Model;
using AasDesignerCommon.Utils;
using AasDesignerModel;
using AutoMapper;
using MediatR;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json.Serialization;

namespace AasDesignerAasApi.Shells.Queries.DiscoverShells;

public class DiscoverShellsQuery : IRequest<ShellListVm>
{
    public AppUser AppUser { get; set; } = null!;
    public string GlobalAssetId { get; set; } = string.Empty;
}

public class DiscoverShellsHandler : IRequestHandler<DiscoverShellsQuery, ShellListVm>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public DiscoverShellsHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<ShellListVm> Handle(
        DiscoverShellsQuery request,
        CancellationToken cancellationToken
    )
    {
        var result = new ShellListVm { Shells = new List<ShellListDto>() };

        using var client = HttpClientCreator.CreateHttpClient(request.AppUser);

        var url =
            request.AppUser.CurrentInfrastructureSettings.AasDiscoveryUrl.AppendSlash()
            + "lookup/shells";
        var specificAssetId = new SpecificAssetId("globalAssetId", request.GlobalAssetId);
        var settings = new JsonSerializerSettings
        {
            NullValueHandling = NullValueHandling.Ignore,
            ContractResolver = new CamelCasePropertyNamesContractResolver(),
        };
        var jsonString = JsonConvert
            .SerializeObject(specificAssetId, Formatting.Indented, settings)
            .ToBase64UrlEncoded(Encoding.UTF8);
        url += "?assetIds=" + jsonString;
        var response = await client.GetAsync(url, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            return result;
        }

        var responseContent = await response.Content.ReadAsStringAsync();
        var discoveredAasIds = ParseDiscoveryResult(responseContent);
        foreach (var aasId in discoveredAasIds)
        {
            var shell = new ShellListDto
            {
                Id = aasId,
                IdShort = string.Empty,
                AssetKind = AssetKind.NotApplicable,
                GlobalAssetId = request.GlobalAssetId,
            };
            result.Shells.Add(shell);
        }

        return result;
    }

    private static IEnumerable<string> ParseDiscoveryResult(string responseContent)
    {
        if (string.IsNullOrWhiteSpace(responseContent))
        {
            return [];
        }

        var token = JToken.Parse(responseContent);
        return token.Type switch
        {
            JTokenType.Array => token
                .Values<string?>()
                .Where(id => !string.IsNullOrWhiteSpace(id))
                .Select(id => id!),
            JTokenType.Object => token["result"]
                ?.Values<string?>()
                .Where(id => !string.IsNullOrWhiteSpace(id))
                .Select(id => id!)
                ?? [],
            _ => [],
        };
    }
}
