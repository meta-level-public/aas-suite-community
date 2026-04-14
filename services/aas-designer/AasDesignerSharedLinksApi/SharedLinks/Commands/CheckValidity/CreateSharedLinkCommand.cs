using AasDesignerCommon.Utils;
using AasDesignerModel;
using AasShared.Configuration;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AasDesignerSharedLinksApi.SharedLinks.Commands.CheckValidity;

public class CheckValidityCommand : IRequest<PublicViewerValidity>
{
    public Guid SharedLinkGuid { get; set; }
}

public class CheckValidityHandler : IRequestHandler<CheckValidityCommand, PublicViewerValidity>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly AppSettings _appSettings;

    public CheckValidityHandler(
        IApplicationDbContext context,
        IMapper mapper,
        AppSettings appSettings
    )
    {
        _context = context;
        _mapper = mapper;
        _appSettings = appSettings;
    }

    public async Task<PublicViewerValidity> Handle(
        CheckValidityCommand request,
        CancellationToken cancellationToken
    )
    {
        var result = new PublicViewerValidity();
        var item = await _context.SharedLinks.FirstOrDefaultAsync(i =>
            i.Guid == request.SharedLinkGuid
        );

        if (item == null)
        {
            result.ResultCode = ViewerResultCode.NOTFOUND;
        }
        else
        {
            item.CountViews++;
            await _context.SaveChangesAsync(cancellationToken);

            if (item.Ablaufdatum <= DateTime.Now)
            {
                result.ResultCode = ViewerResultCode.EXPIRED;
            }
            else
            {
                var infrastructure = await _context.AasInfrastructureSettings.FirstOrDefaultAsync(
                    i => i.Id == item.AasInfrastrukturId
                );

                if (infrastructure == null)
                {
                    result.ResultCode = ViewerResultCode.NOTFOUND;
                    return result;
                }

                var aasUrl = infrastructure.AasRepositoryUrl.AppendSlash() ?? string.Empty;

                if (infrastructure.IsInternal)
                {
                    var baseUrl = _appSettings.BaseUrl.AppendSlash() + "aas-proxy/";
                    aasUrl = baseUrl + "aas-repo";
                }

                result.LoginRequired = !string.IsNullOrEmpty(item.Passwort);
                result.ResultCode = ViewerResultCode.OK;
                result.AasIdentifier = item.AasIdentifier;
                result.AasInfrastrukturId = item.AasInfrastrukturId;
                result.AasRegistryUrl = aasUrl;
            }
        }

        return result;
    }
}
