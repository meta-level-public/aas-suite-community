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
        var jsonNode = JsonNode.Parse(request.ConceptDescriptionString);
        if (jsonNode == null)
            throw new Exception("Could not parse JSON");

        var cd = Jsonization.Deserialize.ConceptDescriptionFrom(jsonNode);

        using var client = HttpClientCreator.CreateHttpClient(request.AppUser);
        await SaveAsync(
            client,
            request.AppUser.CurrentInfrastructureSettings.ConceptDescriptionRepositoryUrl,
            cd,
            cancellationToken
        );
        return true;
    }

    /// <summary>
    /// Saves the concept description via PUT, or via POST when the repository does not know it
    /// yet. Throws when the repository rejects the request, so a failed save is never reported
    /// as success.
    /// </summary>
    public static async Task SaveAsync(
        HttpClient client,
        string conceptDescriptionRepositoryUrl,
        IConceptDescription cd,
        CancellationToken cancellationToken
    )
    {
        var cdUrl =
            conceptDescriptionRepositoryUrl.AppendSlash()
            + "concept-descriptions".AppendSlash()
            + cd.Id.ToBase64UrlEncoded(Encoding.UTF8);
        var cdJsonString = BasyxSerializer.Serialize(cd);
        using var putResponse = await client.PutAsync(
            cdUrl,
            new StringContent(cdJsonString, Encoding.UTF8, "application/json"),
            cancellationToken
        );
        if (putResponse.StatusCode != HttpStatusCode.NotFound)
        {
            UpstreamResponseGuard.EnsureSuccess(
                putResponse,
                $"Saving concept description '{cd.Id}'"
            );
            return;
        }

        // unknown to the repository: create it
        using var postResponse = await client.PostAsync(
            conceptDescriptionRepositoryUrl.AppendSlash() + "concept-descriptions",
            new StringContent(cdJsonString, Encoding.UTF8, "application/json"),
            cancellationToken
        );
        UpstreamResponseGuard.EnsureSuccess(
            postResponse,
            $"Creating concept description '{cd.Id}'"
        );
    }
}
