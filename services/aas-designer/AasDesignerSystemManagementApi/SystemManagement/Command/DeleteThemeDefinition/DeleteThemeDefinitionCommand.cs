using AasDesignerModel;
using AasDesignerSystemManagementApi.SystemManagement.ThemeConfiguration;
using MediatR;

namespace AasDesignerSystemManagementApi.SystemManagement.Command.DeleteThemeDefinition;

public class DeleteThemeDefinitionCommand : IRequest<bool>
{
    public string Key { get; set; } = string.Empty;
}

public class DeleteThemeDefinitionHandler : IRequestHandler<DeleteThemeDefinitionCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public DeleteThemeDefinitionHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(
        DeleteThemeDefinitionCommand request,
        CancellationToken cancellationToken
    )
    {
        var key = ThemeDefinitionStore.NormalizeKey(request.Key);
        if (ThemeDefinitionStore.IsBuiltIn(key))
        {
            return false;
        }

        var current = await ThemeDefinitionStore.LoadAsync(_context, cancellationToken);
        var removed = current.RemoveAll(t => t.Key == key) > 0;
        if (!removed)
        {
            return false;
        }

        await ThemeDefinitionStore.SaveAsync(_context, current, cancellationToken);
        return true;
    }
}
