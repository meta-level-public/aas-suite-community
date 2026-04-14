using System.Net;
using System.Text;
using System.Text.Json.Nodes;
using AasCore.Aas3_1;
using AasDesignerApi.Model;
using AasDesignerCommon.Serialization;
using AasDesignerCommon.Utils;
using AasDesignerModel;
using AasDesignerModel.Model;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AasDesignerAasApi.Infrastructure.Commands.UpdateConceptDescription;

public class UpdateConceptDescriptionCommand : IRequest<bool>
{
    public AppUser AppUser { get; set; } = null!;
    public string ConceptDescriptionString { get; set; } = null!;
}

public class UpdateConceptDescriptionHandler
    : IRequestHandler<UpdateConceptDescriptionCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public UpdateConceptDescriptionHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<bool> Handle(
        UpdateConceptDescriptionCommand request,
        CancellationToken cancellationToken
    )
    {
        using var client = HttpClientCreator.CreateHttpClient(request.AppUser);

        var jsonNode = JsonNode.Parse(request.ConceptDescriptionString);
        if (jsonNode == null)
            throw new Exception("Could not parse JSON");

        var cd = Jsonization.Deserialize.ConceptDescriptionFrom(jsonNode);

        var cdUrl =
            request.AppUser.CurrentInfrastructureSettings.ConceptDescriptionRepositoryUrl.AppendSlash()
            + "concept-descriptions".AppendSlash()
            + cd.Id.ToBase64UrlEncoded(Encoding.UTF8);
        var cdJsonString = BasyxSerializer.Serialize(cd);
        var cdResponse = await client.PutAsync(
            cdUrl,
            new StringContent(cdJsonString, Encoding.UTF8, "application/json"),
            cancellationToken
        );
        if (cdResponse.StatusCode == HttpStatusCode.NotFound)
        {
            // POST dann ohne ID ...
            cdUrl =
                request.AppUser.CurrentInfrastructureSettings.ConceptDescriptionRepositoryUrl.AppendSlash()
                + "concept-descriptions";
            cdResponse = await client.PostAsync(
                cdUrl,
                new StringContent(cdJsonString, Encoding.UTF8, "application/json"),
                cancellationToken
            );
            if (!cdResponse.IsSuccessStatusCode)
            {
                // throw new Exception($"Request to {smUrl} failed with status code {smResponse.StatusCode}");
                Console.WriteLine("Error saving ConceptDescription: " + cdResponse.StatusCode);
                return false;
            }
        }
        return true;
    }
}
