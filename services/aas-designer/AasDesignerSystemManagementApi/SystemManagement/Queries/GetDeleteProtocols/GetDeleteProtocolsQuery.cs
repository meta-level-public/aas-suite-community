using AasDesignerApi.Model;
using AasDesignerModel;
using AasDesignerModel.Model;
using AasDesignerSystemManagementApi.SystemManagement.Model;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;

namespace AasDesignerSystemManagementApi.SystemManagement.Queries.GetDeleteProtocols;

public class GetDeleteProtocolsQuery : IRequest<List<DeleteProtocolDto>> { }

public class GetDeleteProtocolsHandler
    : IRequestHandler<GetDeleteProtocolsQuery, List<DeleteProtocolDto>>
{
    private readonly IApplicationDbContext _context;

    public GetDeleteProtocolsHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<DeleteProtocolDto>> Handle(
        GetDeleteProtocolsQuery request,
        CancellationToken cancellationToken
    )
    {
        var deleteProtocols = await _context
            .DeleteProtocols.AsNoTracking()
            .OrderByDescending(entry => entry.AnlageDatum)
            .Select(entry => new DeleteProtocolDto
            {
                Id = entry.Id,
                DeleteType = entry.DeleteType,
                CreatedAt = entry.AnlageDatum,
                CreatedBy = entry.AnlageBenutzer,
                AdditionalData = entry.AdditionalData,
            })
            .ToListAsync(cancellationToken);

        foreach (var deleteProtocol in deleteProtocols)
        {
            MapAdditionalData(deleteProtocol);
        }

        return deleteProtocols;
    }

    private static void MapAdditionalData(DeleteProtocolDto deleteProtocol)
    {
        if (string.IsNullOrWhiteSpace(deleteProtocol.AdditionalData))
        {
            return;
        }

        try
        {
            switch (deleteProtocol.DeleteType)
            {
                case DeleteType.Organisation:
                    deleteProtocol.Organisation =
                        JsonConvert.DeserializeObject<OrganisationDeleteProtocolDto>(
                            deleteProtocol.AdditionalData
                        ) ?? new OrganisationDeleteProtocolDto();
                    break;
                case DeleteType.UserAccount:
                    deleteProtocol.UserAccount =
                        JsonConvert.DeserializeObject<UserAccountDeleteProtocolDto>(
                            deleteProtocol.AdditionalData
                        ) ?? new UserAccountDeleteProtocolDto();
                    break;
                case DeleteType.Infrastructure:
                    deleteProtocol.Infrastructure =
                        JsonConvert.DeserializeObject<InfrastructureDeleteProtocolDto>(
                            deleteProtocol.AdditionalData
                        ) ?? new InfrastructureDeleteProtocolDto();
                    break;
            }
        }
        catch (JsonException)
        {
            // Keep raw AdditionalData so the frontend can still render a fallback view.
        }
    }
}
