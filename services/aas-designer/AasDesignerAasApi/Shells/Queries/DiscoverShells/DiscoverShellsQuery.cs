using System.Text;
using AasCore.Aas3_1;
using AasDesignerAasApi.Shells.Queries.GetShellList;
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
        if (response.IsSuccessStatusCode)
        {
            var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);
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
        }

        if (result.Shells.Count > 0)
        {
            return result;
        }

        // Shells that were never registered in the discovery (e.g. imported directly into
        // the repository) are still found via the registry/repository asset id filter.
        return await LoadFromShellList(request, cancellationToken);
    }

    private async Task<ShellListVm> LoadFromShellList(
        DiscoverShellsQuery request,
        CancellationToken cancellationToken
    )
    {
        try
        {
            // two entries are enough to distinguish "unique" from "multiple" matches
            return await new GetShellListHandler(_context, _mapper).Handle(
                new GetShellListQuery
                {
                    AppUser = request.AppUser,
                    Count = 2,
                    FilterAssetId = request.GlobalAssetId,
                },
                cancellationToken
            );
        }
        catch (Exception e)
        {
            Console.WriteLine("Error loading shells by asset id: " + e.Message);
            return new ShellListVm { Shells = new List<ShellListDto>() };
        }
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
