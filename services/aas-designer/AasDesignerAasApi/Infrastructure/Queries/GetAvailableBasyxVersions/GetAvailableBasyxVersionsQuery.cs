using AasDesignerApi.Model;
using AasDesignerModel;
using AasShared.Configuration;
using AutoMapper;
using MediatR;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace AasDesignerAasApi.Infrastructure.Queries.GetAvailableBasyxVersions;

public class GetAvailableBasyxVersionsQuery : IRequest<AvailableBasyxVersions>
{
    public AppUser AppUser { get; set; } = null!;
    public string AasIdentifier { get; set; } = string.Empty;
}

public class GetAvailableBasyxVersionsHandler
    : IRequestHandler<GetAvailableBasyxVersionsQuery, AvailableBasyxVersions>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly AppSettings _appSettings;

    public GetAvailableBasyxVersionsHandler(
        IApplicationDbContext context,
        IMapper mapper,
        AppSettings appSettings
    )
    {
        _context = context;
        _mapper = mapper;
        _appSettings = appSettings;
    }

    public async Task<AvailableBasyxVersions> Handle(
        GetAvailableBasyxVersionsQuery request,
        CancellationToken cancellationToken
    )
    {
        var result = new AvailableBasyxVersions();

        var client = new HttpClient();

        var resAasEnv = await client.GetAsync(
            "https://registry.hub.docker.com/v2/repositories/eclipsebasyx/aas-environment/tags"
        );
        if (resAasEnv.IsSuccessStatusCode)
        {
            var content = await resAasEnv.Content.ReadAsStringAsync();
            var jsonObj = JsonConvert.DeserializeObject<JObject>(content);
            var results = jsonObj?.GetValue("results")?.ToList();
            results?.ForEach(r =>
            {
                var tag = (r as JObject)?.GetValue("name")?.ToString();
                var date = (r as JObject)?.GetValue("last_updated")?.ToString() ?? string.Empty;
                if (tag != null)
                    result.AasEnvVersions.Add(new VersionEntry { Version = tag, Date = date });
            });
        }
        var resAasReg = await client.GetAsync(
            "https://registry.hub.docker.com/v2/repositories/eclipsebasyx/aas-registry-log-mongodb/tags"
        );
        if (resAasReg.IsSuccessStatusCode)
        {
            var content = await resAasReg.Content.ReadAsStringAsync();
            var jsonObj = JsonConvert.DeserializeObject<JObject>(content);
            var results = jsonObj?.GetValue("results")?.ToList();
            results?.ForEach(r =>
            {
                var tag = (r as JObject)?.GetValue("name")?.ToString();
                var date = (r as JObject)?.GetValue("last_updated")?.ToString() ?? string.Empty;
                if (tag != null)
                    result.AasRegVersions.Add(new VersionEntry { Version = tag, Date = date });
            });
        }
        var resSmReg = await client.GetAsync(
            "https://registry.hub.docker.com/v2/repositories/eclipsebasyx/submodel-registry-log-mongodb/tags"
        );
        if (resSmReg.IsSuccessStatusCode)
        {
            var content = await resSmReg.Content.ReadAsStringAsync();
            var jsonObj = JsonConvert.DeserializeObject<JObject>(content);
            var results = jsonObj?.GetValue("results")?.ToList();
            results?.ForEach(r =>
            {
                var tag = (r as JObject)?.GetValue("name")?.ToString();
                var date = (r as JObject)?.GetValue("last_updated")?.ToString() ?? string.Empty;
                if (tag != null)
                    result.SmRegVersions.Add(new VersionEntry { Version = tag, Date = date });
            });
        }
        var resDiscovery = await client.GetAsync(
            "https://registry.hub.docker.com/v2/repositories/eclipsebasyx/aas-discovery/tags"
        );
        if (resDiscovery.IsSuccessStatusCode)
        {
            var content = await resDiscovery.Content.ReadAsStringAsync();
            var jsonObj = JsonConvert.DeserializeObject<JObject>(content);
            var results = jsonObj?.GetValue("results")?.ToList();
            results?.ForEach(r =>
            {
                var tag = (r as JObject)?.GetValue("name")?.ToString();
                var date = (r as JObject)?.GetValue("last_updated")?.ToString() ?? string.Empty;
                if (tag != null)
                    result.DiscoveryVersions.Add(new VersionEntry { Version = tag, Date = date });
            });
        }

        return result;
    }
}
