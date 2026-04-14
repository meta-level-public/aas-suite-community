using AasDesignerApi.Model;
using AasDesignerCommon.Utils;
using AasDesignerModel;
using AasDesignerSystemManagementApi.SystemManagement.Model;
using AasShared.Configuration;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json.Linq;

namespace AasDesignerSystemManagementApi.SystemManagement.Queries.GetStatus;

public class GetStatusQuery : IRequest<SystemStatusDto>
{
    public AppUser AppUser { get; set; } = null!;
    public long InfrastructureId { get; set; }
    public SystemType SystemType { get; set; }
}

public class GetStatusHandler : IRequestHandler<GetStatusQuery, SystemStatusDto>
{
    private readonly IApplicationDbContext _context;

    public GetStatusHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<SystemStatusDto> Handle(
        GetStatusQuery request,
        CancellationToken cancellationToken
    )
    {
        var infrastructure = await _context.AasInfrastructureSettings.FirstOrDefaultAsync(
            i => i.Id == request.InfrastructureId,
            cancellationToken
        );
        if (infrastructure == null)
        {
            throw new Exception($"Infrastructure with id  {request.InfrastructureId} not found");
        }

        using var client = HttpClientCreator.CreateHttpClient(request.AppUser);

        HttpResponseMessage? response;

        switch (request.SystemType)
        {
            case SystemType.Discovery:
                response = await client.GetAsync(infrastructure.AasDiscoveryHcUrl);
                break;
            case SystemType.AasRegistry:
                response = await client.GetAsync(infrastructure.AasRegistryHcUrl);
                break;
            case SystemType.AasRepository:
                response = await client.GetAsync(infrastructure.AasRepositoryHcUrl);
                break;
            case SystemType.SubmodelRepository:
                response = await client.GetAsync(infrastructure.SubmodelRepositoryHcUrl);
                break;
            case SystemType.SubmodelRegistry:
                response = await client.GetAsync(infrastructure.SubmodelRegistryHcUrl);
                break;
            case SystemType.ConceptDescriptionRepository:
                response = await client.GetAsync(infrastructure.ConceptDescriptionRepositoryHcUrl);
                break;
            default:
                throw new Exception($"SystemType {request.SystemType} not supported");
        }

        if (!response.IsSuccessStatusCode)
        {
            return new SystemStatusDto() { Available = false };
        }

        var responseString = await response.Content.ReadAsStringAsync();
        try
        {
            var res = JObject.Parse(responseString);

            if (res.GetValue("status")?.ToString() == "UP")
            {
                return new SystemStatusDto() { Available = true };
            }
        }
        catch (Exception)
        {
            // ignorieren
        }

        if (responseString == "Healthy")
        {
            return new SystemStatusDto() { Available = true };
        }

        return new SystemStatusDto() { Available = false };
    }
}
