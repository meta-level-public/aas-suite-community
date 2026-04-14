using AasDesignerApi.Model;
using AasDesignerModel;
using AasShared.Configuration;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AasDesignerSharedLinksApi.SharedLinks.Queries.GetMySharedLinks;

public class GetMySharedLinksQuery : IRequest<List<MySharedLink>>
{
    public AppUser AppUser { get; set; } = null!;
}

public class GetMySharedLinksHandler : IRequestHandler<GetMySharedLinksQuery, List<MySharedLink>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly AppSettings _appSettings;

    public GetMySharedLinksHandler(
        IApplicationDbContext context,
        IMapper mapper,
        AppSettings appSettings
    )
    {
        _context = context;
        _mapper = mapper;
        _appSettings = appSettings;
    }

    public async Task<List<MySharedLink>> Handle(
        GetMySharedLinksQuery request,
        CancellationToken cancellationToken
    )
    {
        var sharedLinks = await _context
            .SharedLinks.Where(sl => sl.BesitzerId == request.AppUser.BenutzerId)
            .ToListAsync();

        return _mapper.Map<List<MySharedLink>>(sharedLinks);
    }
}
