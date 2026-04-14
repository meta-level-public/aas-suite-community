using AasDesignerApi.Model;
using AasDesignerModel;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AasDesignerAasApi.Pcn.Queries.GetPcnRegistrationInformation;

public class GetPcnRegistrationInformationQuery : IRequest<PcnInformationDto?>
{
    public AppUser AppUser { get; set; } = null!;
    public string AasIdentifier { get; set; } = string.Empty;
}

public class GetPcnRegistrationInformationHandler
    : IRequestHandler<GetPcnRegistrationInformationQuery, PcnInformationDto?>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetPcnRegistrationInformationHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<PcnInformationDto?> Handle(
        GetPcnRegistrationInformationQuery request,
        CancellationToken cancellationToken
    )
    {
        PcnInformationDto? result = null;

        var registration = await _context.PcnListeners.FirstOrDefaultAsync(
            x =>
                x.AasIdentifier == request.AasIdentifier
                && x.OrganizationId == request.AppUser.OrganisationId
                && !x.Geloescht,
            cancellationToken
        );

        if (registration != null)
        {
            result = _mapper.Map<PcnInformationDto>(registration);
        }
        return result;
    }
}
