using AasDesignerApi.Model;
using AasDesignerHelpApi.HelpTexts.Queries;
using AasDesignerModel;
using AasDesignerModel.Model;
using AasShared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AasDesignerHelpApi.HelpTexts.Commands.UpdateHelpEntry;

public class UpdateHelpEntryCommand : IRequest<bool>
{
    public AppUser AppUser { get; set; } = null!;
    public HelpTextDto HelpText { get; set; } = null!;
}

public class UpdateHelpEntryHandler : IRequestHandler<UpdateHelpEntryCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public UpdateHelpEntryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(
        UpdateHelpEntryCommand request,
        CancellationToken cancellationToken
    )
    {
        GlobalHelpText? helpTextGlobal = null;
        if (request.HelpText.IdGlobal != 0)
        {
            helpTextGlobal = await _context.GlobalHelpTexts.FirstOrDefaultAsync(
                ht => ht.Id == request.HelpText.IdGlobal || ht.Tag == request.HelpText.Tag,
                cancellationToken
            );
        }
        else
        {
            helpTextGlobal = new GlobalHelpText { Tag = request.HelpText.Tag };
            _context.Add(helpTextGlobal);
        }

        if (
            request.AppUser.BenutzerRollen.Any(r => r == AuthRoles.SYSTEM_HELP_EDITOR)
            && helpTextGlobal != null
        )
        {
            helpTextGlobal.TextDe = request.HelpText.GlobalTextDe;
            helpTextGlobal.TextEn = request.HelpText.GlobalTextEn;
        }
        await _context.SaveChangesAsync(cancellationToken);

        if (helpTextGlobal == null)
        {
            throw new Exception("UNABLE_TO_SAVE_HELP_TEXT");
        }

        if (request.AppUser.BenutzerRollen.Any(r => r == AuthRoles.ORGA_HELP_EDITOR))
        {
            OrgaHelpText? helpTextOrga = null;
            if (request.HelpText.IdOrga != 0)
            {
                helpTextOrga = await _context.OrgaHelpTexts.FirstOrDefaultAsync(
                    ht =>
                        ht.OrganisationId == request.HelpText.IdOrga
                        || ht.Tag == request.HelpText.Tag,
                    cancellationToken
                );
            }
            else if (
                !string.IsNullOrWhiteSpace(request.HelpText.OrgaTextDe)
                || !string.IsNullOrWhiteSpace(request.HelpText.OrgaTextEn)
            )
            {
                helpTextOrga = new OrgaHelpText
                {
                    Tag = request.HelpText.Tag,
                    OrganisationId = request.AppUser.OrganisationId,
                    GlobalHelpTextId = helpTextGlobal.Id,
                };
                _context.Add(helpTextOrga);
            }

            if (helpTextOrga != null && helpTextGlobal != null)
            {
                helpTextOrga.TextDe = request.HelpText.OrgaTextDe;
                helpTextOrga.TextEn = request.HelpText.OrgaTextEn;
            }
        }

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
