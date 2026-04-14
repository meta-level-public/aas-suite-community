using AasDesignerApi.Model;
using AasDesignerModel;
using AasDesignerSystemManagementApi.SystemManagement.Model;
using AasShared.Configuration;
using AutoMapper;
using MediatR;

namespace AasDesignerSystemManagementApi.SystemManagement.Queries.GetHelpInformation;

public class GetHelpInfoQuery : IRequest<HelpInfoDto>
{
    public long InfrastructureId { get; set; }
    public SystemType SystemType { get; set; }
}

public class GetHelpInfoHandler : IRequestHandler<GetHelpInfoQuery, HelpInfoDto>
{
    private readonly IMapper _mapper;
    private readonly AppSettings _appSettings;
    private readonly IApplicationDbContext _context;

    public GetHelpInfoHandler(
        IMapper mapper,
        AppSettings appSettings,
        IApplicationDbContext context
    )
    {
        _mapper = mapper;
        _appSettings = appSettings;
        _context = context;
    }

    public async Task<HelpInfoDto> Handle(
        GetHelpInfoQuery request,
        CancellationToken cancellationToken
    )
    {
        var helpCount = _context.GlobalHelpTexts.Count();

        var HelpInfoDto = new HelpInfoDto() { AmountTexts = helpCount };

        return await Task.FromResult(HelpInfoDto);
    }
}
