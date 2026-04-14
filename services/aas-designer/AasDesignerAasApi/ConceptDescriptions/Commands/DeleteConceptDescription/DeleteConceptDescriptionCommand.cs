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

        var cdUrl =
            request.AppUser.CurrentInfrastructureSettings.ConceptDescriptionRepositoryUrl.AppendSlash()
            + "concept-descriptions".AppendSlash()
            + request.CdIdentifierBase64;
        var cdResponse = await client.DeleteAsync(cdUrl, cancellationToken);
        if (!cdResponse.IsSuccessStatusCode)
        {
            // throw new Exception($"Request to {smUrl} failed with status code {smResponse.StatusCode}");
            _logger.LogError("Error saving ConceptDescription: " + cdResponse.StatusCode);
            return false;
        }
        return true;
    }
}
