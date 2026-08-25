using System.Text;
using AasCore.Aas3_1;
using AasDesignerApi.Model;
using AasDesignerCommon.Utils;
using AasDesignerModel;
using MediatR;
using Newtonsoft.Json.Linq;

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

        var fromRegistry = await TryLoadFromRegistry(request, cancellationToken, client);
        if (!string.IsNullOrWhiteSpace(fromRegistry))
        {
            var registryJsonNode = AasJsonNodeParser.Parse(fromRegistry);
            var registrySubmodel = Jsonization.Deserialize.SubmodelFrom(registryJsonNode);
            AasDateTimeValueNormalizer.NormalizeSubmodel(registrySubmodel);
            return Jsonization.Serialize.ToJsonObject(registrySubmodel).ToJsonString();
        }

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

    private static async Task<string?> TryLoadFromRegistry(
        GetSmPlainQuery request,
        CancellationToken cancellationToken,
        HttpClient client
    )
    {
        if (
            string.IsNullOrWhiteSpace(
                request.AppUser.CurrentInfrastructureSettings.SubmodelRegistryUrl
            )
        )
        {
            return null;
        }

        var descriptorUrl =
            request.AppUser.CurrentInfrastructureSettings.SubmodelRegistryUrl.AppendSlash()
            + "submodel-descriptors/"
            + request.SmIdentifier.ToBase64UrlEncoded(Encoding.UTF8);

        var descriptorResponse = await client.GetAsync(descriptorUrl, cancellationToken);
        if (!descriptorResponse.IsSuccessStatusCode)
        {
            return null;
        }

        var descriptorContent = await descriptorResponse.Content.ReadAsStringAsync(
            cancellationToken
        );
        var descriptor = JObject.Parse(descriptorContent);

        var hrefs = descriptor["endpoints"]
            ?.Select(endpoint => endpoint?["protocolInformation"]?["href"]?.ToString())
            .Where(href => !string.IsNullOrWhiteSpace(href))
            .Select(href => href!)
            .ToList();

        if (hrefs == null || hrefs.Count == 0)
        {
            return null;
        }

        foreach (var href in hrefs)
        {
            try
            {
                var response = await client.GetAsync(href, cancellationToken);
                if (!response.IsSuccessStatusCode)
                {
                    continue;
                }

                var content = await response.Content.ReadAsStringAsync(cancellationToken);
                if (!string.IsNullOrWhiteSpace(content))
                {
                    return content;
                }
            }
            catch
            {
                // Endpoint may be unavailable; continue trying remaining candidates.
            }
        }

        return null;
    }
}
