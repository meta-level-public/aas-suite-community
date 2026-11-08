using System.Net;
using AasDesignerApi.Model;
using AasDesignerCommon.Utils;
using AasDesignerModel;
using MediatR;
using Microsoft.Extensions.Logging;

namespace AasDesignerAasApi.ConceptDescriptions.Commands.DeleteConceptDescription;

public class DeleteConceptDescriptionCommand : IRequest<bool>
{
    public AppUser AppUser { get; set; } = null!;
    public string CdIdentifierBase64 { get; set; } = string.Empty;
}

public class DeleteConceptDescriptionHandler
    : IRequestHandler<DeleteConceptDescriptionCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<DeleteConceptDescriptionHandler> _logger;

    public DeleteConceptDescriptionHandler(
        IApplicationDbContext context,
        ILogger<DeleteConceptDescriptionHandler> logger
    )
    {
        _context = context;
        _logger = logger;
    }

    public async Task<bool> Handle(
        DeleteConceptDescriptionCommand request,
        CancellationToken cancellationToken
    )
    {
        using var client = HttpClientCreator.CreateHttpClient(request.AppUser);
        await DeleteAsync(
            client,
            request.AppUser.CurrentInfrastructureSettings.ConceptDescriptionRepositoryUrl,
            request.CdIdentifierBase64,
            cancellationToken
        );
        return true;
    }

    /// <summary>
    /// Deletes the concept description. A concept description the repository does not know is
    /// already gone; any other error is thrown, so a failed delete is never reported as success.
    /// </summary>
    public static async Task DeleteAsync(
        HttpClient client,
        string conceptDescriptionRepositoryUrl,
        string cdIdentifierBase64,
        CancellationToken cancellationToken
    )
    {
        var cdUrl =
            conceptDescriptionRepositoryUrl.AppendSlash()
            + "concept-descriptions".AppendSlash()
            + cdIdentifierBase64;
        using var cdResponse = await client.DeleteAsync(cdUrl, cancellationToken);
        if (cdResponse.StatusCode == HttpStatusCode.NotFound)
        {
            return;
        }

        UpstreamResponseGuard.EnsureSuccess(cdResponse, "Deleting the concept description");
    }
}
