using System.Text;
using System.Text.Json.Nodes;
using AasCore.Aas3_1;
using AasDesignerApi.Model;
using AasDesignerCommon.Shells;
using AasDesignerCommon.Utils;
using AasDesignerModel;
using AasShared.Model.AasApi;
using AutoMapper;
using MediatR;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace AasDesignerAasApi.Shells.Queries.GetShellList;

public class GetShellListQuery : IRequest<ShellListVm>
{
    public AppUser AppUser { get; set; } = null!;
    public string? Cursor { get; set; }
    public int Count { get; set; } = 10;
    public string FilterAssetId { get; set; } = string.Empty;
    public string FilterIdShort { get; set; } = string.Empty;
    public string FilterAssetKind { get; set; } = string.Empty;
}

public class GetShellListHandler : IRequestHandler<GetShellListQuery, ShellListVm>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetShellListHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<ShellListVm> Handle(
        GetShellListQuery request,
        CancellationToken cancellationToken
    )
    {
        using var client = HttpClientCreator.CreateHttpClient(request.AppUser);

        var parameters = new List<KeyValuePair<string, string>>
        {
            new KeyValuePair<string, string>("limit", request.Count.ToString()),
        };
        if (!string.IsNullOrEmpty(request.FilterAssetKind))
        {
            parameters.Add(new KeyValuePair<string, string>("assetKind", request.FilterAssetKind));
        }
        if (!string.IsNullOrEmpty(request.Cursor))
        {
            parameters.Add(new KeyValuePair<string, string>("cursor", request.Cursor));
        }
        if (!string.IsNullOrWhiteSpace(request.FilterIdShort))
        {
            parameters.Add(
                new KeyValuePair<string, string>(
                    "idShort",
                    request.FilterIdShort.ToBase64UrlEncoded(Encoding.UTF8)
                )
            );
        }
        if (!string.IsNullOrWhiteSpace(request.FilterAssetId))
        {
            var globalAssetId = AasCore
                .Aas3_1.Jsonization.Serialize.ToJsonObject(
                    new SpecificAssetId("GlobalAssetId", request.FilterAssetId)
                )
                .ToString()
                .ToBase64UrlEncoded(Encoding.UTF8);
            parameters.Add(new KeyValuePair<string, string>("assetIds", globalAssetId));
        }

        var queryParams = string.Join("&", parameters.Select(p => $"{p.Key}={p.Value}"));

        try
        {
            return await LoadFromRegistry(request, cancellationToken, client, queryParams);
        }
        catch (Exception e)
        {
            Console.WriteLine(e.Message);
            return await LoadFromRepository(request, cancellationToken, client, queryParams);
        }
    }

    public async Task<ShellListVm> LoadFromRegistry(
        GetShellListQuery request,
        CancellationToken cancellationToken,
        HttpClient client,
        string queryParams
    )
    {
        var result = new ShellListVm { Shells = new List<ShellListDto>() };
        var url =
            request.AppUser.CurrentInfrastructureSettings.AasRegistryUrl.AppendSlash()
            + "shell-descriptors?"
            + queryParams;

        HttpResponseMessage response = await client.GetAsync(url, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            throw new Exception($"Request to {url} failed with status code {response.StatusCode}");
        }

        var responseRepo = await response.Content.ReadAsStringAsync(cancellationToken);
        if (string.IsNullOrWhiteSpace(responseRepo))
        {
            return result;
        }

        JObject? res = JsonConvert.DeserializeObject<JObject>(responseRepo);

        if (res != null)
        {
            var aasList = res.Value<JArray>("result") ?? [];

            foreach (var shell in aasList)
            {
                var jsonNode = JsonNode.Parse(shell.ToString());
                if (jsonNode == null)
                    throw new Exception("Could not parse JSON");

                // Daten eben selbst parsen

                ShellListDto shellListDto = new();
                string assetKindString = jsonNode["assetKind"]?.ToString() ?? string.Empty;
                AssetKind assetKind = Enum.Parse<AssetKind>(assetKindString, ignoreCase: true);
                shellListDto.AssetKind = assetKind;

                shellListDto.Id = jsonNode["id"]?.ToString() ?? string.Empty;
                shellListDto.GlobalAssetId = jsonNode["globalAssetId"]?.ToString() ?? string.Empty;
                shellListDto.IdShort = jsonNode["idShort"]?.ToString() ?? string.Empty;

                // weil in der Registry keine Bilder liegen, muss nun das Bild aus dem Repository geladen werden ...
                var assetInformation = await ShellLoader.LoadAssetInformationOnly(
                    request.AppUser.CurrentInfrastructureSettings,
                    shellListDto.Id,
                    cancellationToken,
                    request.AppUser
                );
                shellListDto.ThumbnailPath =
                    assetInformation?.DefaultThumbnail?.Path ?? string.Empty;

                result.Shells.Add(shellListDto);
            }
            var pagingMetadata = JsonConvert.DeserializeObject<PagingMetadata>(
                res.Value<JObject>("paging_metadata")?.ToString() ?? "{}"
            );
            result.Cursor = pagingMetadata?.cursor;
        }

        return result;
    }

    public async Task<ShellListVm> LoadFromRepository(
        GetShellListQuery request,
        CancellationToken cancellationToken,
        HttpClient client,
        string queryParams
    )
    {
        var result = new ShellListVm { Shells = new List<ShellListDto>() };
        var url =
            request.AppUser.CurrentInfrastructureSettings.AasRepositoryUrl.AppendSlash()
            + "shells?"
            + queryParams;

        HttpResponseMessage response = await client.GetAsync(url, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            throw new Exception($"Request to {url} failed with status code {response.StatusCode}");
        }

        var responseRepo = await response.Content.ReadAsStringAsync(cancellationToken);
        if (string.IsNullOrWhiteSpace(responseRepo))
        {
            return result;
        }

        JObject? res = JsonConvert.DeserializeObject<JObject>(responseRepo);

        if (res != null)
        {
            var aasList = res.Value<JArray>("result") ?? [];

            aasList
                .ToList()
                .ForEach(shell =>
                {
                    var jsonNode = JsonNode.Parse(shell.ToString());
                    if (jsonNode == null)
                        throw new Exception("Could not parse JSON");
                    var aas = Jsonization.Deserialize.AssetAdministrationShellFrom(jsonNode);

                    result.Shells.Add(_mapper.Map<ShellListDto>(aas));
                });
            var pagingMetadata = JsonConvert.DeserializeObject<PagingMetadata>(
                res.Value<JObject>("paging_metadata")?.ToString() ?? "{}"
            );
            result.Cursor = pagingMetadata?.cursor;
        }

        return result;
    }
}
