using AasDesignerApi.Model;
using AasDesignerModel;
using AasShared.Exceptions;
using AutoMapper;
using MediatR;

namespace AasDesignerSharedLinksApi.SharedLinks.Commands.DeleteSharedLink;

public class DeleteSharedLinkCommand : IRequest<bool>
{
    public AppUser AppUser { get; set; } = null!;
    public long Id { get; set; }
}

public class DeleteSharedLinkHandler : IRequestHandler<DeleteSharedLinkCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public DeleteSharedLinkHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<bool> Handle(
        DeleteSharedLinkCommand request,
        CancellationToken cancellationToken
    )
    {
        var sharedLink = _context.SharedLinks.Where(sl => sl.Id == request.Id).FirstOrDefault();

        if (sharedLink == null)
            throw new Exception("Shared link not found");
        if (sharedLink.BesitzerId != request.AppUser.BenutzerId)
            throw new OperationNotAllowedException("Delete Shared Link not allowed");

        _context.SharedLinks.Remove(sharedLink);
        _context.SaveChanges();

        return await Task.FromResult(true);
    }
}
