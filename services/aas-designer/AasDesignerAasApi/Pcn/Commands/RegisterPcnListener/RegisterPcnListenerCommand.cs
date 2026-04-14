using AasDesignerAasApi.Pcn.Commands.RegisterPcnListener;
using AasDesignerApi.Model;
using AasDesignerModel;
using AasDesignerModel.Model;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AasDesignerAasApi.Package.Commands.RegisterPcnListener;

public class RegisterPcnListenerCommand : IRequest<bool>
{
    public AppUser AppUser { get; set; } = null!;
    public required PcnRegistrationRequest PcnRegistrationRequest { get; set; }
}

public class RegisterPcnListenerCommandHandler : IRequestHandler<RegisterPcnListenerCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public RegisterPcnListenerCommandHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<bool> Handle(
        RegisterPcnListenerCommand request,
        CancellationToken cancellationToken
    )
    {
        var registration = await _context.PcnListeners.FirstOrDefaultAsync(
            x =>
                x.AasIdentifier == request.PcnRegistrationRequest.AasIdentifier
                && x.OrganizationId == request.AppUser.OrganisationId
                && !x.Geloescht,
            cancellationToken
        );
        if (registration == null)
        {
            var pcnListener = new PcnListener();
            pcnListener.AasIdentifier = request.PcnRegistrationRequest.AasIdentifier;
            pcnListener.OrganizationId = request.AppUser.OrganisationId;
            pcnListener.BrokerUrl = request.PcnRegistrationRequest.BrokerUrl;
            pcnListener.Topic = request.PcnRegistrationRequest.Topic;
            pcnListener.Password = request.PcnRegistrationRequest.Password;
            pcnListener.Username = request.PcnRegistrationRequest.Username;
            pcnListener.InfrastructureId = request.AppUser.CurrentInfrastructureSettings.Id;

            _context.PcnListeners.Add(pcnListener);
            await _context.SaveChangesAsync();
        }

        return true;
    }
}
