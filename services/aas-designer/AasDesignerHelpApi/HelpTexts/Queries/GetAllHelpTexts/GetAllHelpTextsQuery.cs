using System.Linq;
using AasDesignerApi.Model;
using AasDesignerModel;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AasDesignerHelpApi.HelpTexts.Queries.GetAllHelpTexts;

public class GetAllHelpTextsQuery : IRequest<List<HelpTextDto>>
{
    public AppUser? AppUser { get; set; }
    public string AasIdentifier { get; set; } = string.Empty;
}

public class GetAllHelpTextsHandler : IRequestHandler<GetAllHelpTextsQuery, List<HelpTextDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetAllHelpTextsHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<HelpTextDto>> Handle(
        GetAllHelpTextsQuery request,
        CancellationToken cancellationToken
    )
    {
        if (request.AppUser == null)
        {
            var result = await _context
                .GlobalHelpTexts.Select(ht => new HelpTextDto
                {
                    IdGlobal = ht.Id,
                    Tag = ht.Tag,
                    GlobalTextDe = ht.TextDe,
                    GlobalTextEn = ht.TextEn,
                })
                .ToListAsync(cancellationToken);
            return result;
        }
        else
        {
            var result = await _context
                .GlobalHelpTexts.Include(ht =>
                    ht.OrgaHelpTexts.Where(oht =>
                        oht.OrganisationId == request.AppUser.OrganisationId
                    )
                )
                .Select(ht => new HelpTextDto
                {
                    IdGlobal = ht.Id,
                    Tag = ht.Tag,
                    GlobalTextDe = ht.TextDe,
                    GlobalTextEn = ht.TextEn,
                    IdOrga = request.AppUser.OrganisationId,
                    OrgaTextDe = GetDeText(ht.OrgaHelpTexts),
                    OrgaTextEn = GetEnText(ht.OrgaHelpTexts),
                })
                .ToListAsync(cancellationToken);

            return result;
        }
    }

    static string GetDeText(List<OrgaHelpText>? orgaHelpTexts)
    {
        if (orgaHelpTexts == null || orgaHelpTexts.Count == 0)
        {
            return string.Empty;
        }
        return orgaHelpTexts.First().TextDe;
    }

    static string GetEnText(List<OrgaHelpText>? orgaHelpTexts)
    {
        if (orgaHelpTexts == null || orgaHelpTexts.Count == 0)
        {
            return string.Empty;
        }
        return orgaHelpTexts.First().TextEn;
    }
}
