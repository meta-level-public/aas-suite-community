using AasDesignerModel;
using AasDesignerSystemManagementApi.SystemManagement.Model;
using AasDesignerSystemManagementApi.SystemManagement.ThemeConfiguration;
using MediatR;

namespace AasDesignerSystemManagementApi.SystemManagement.Queries.GetThemeDefinitions;

public class GetThemeDefinitionsQuery : IRequest<List<ThemeDefinitionDto>> { }

public class GetThemeDefinitionsHandler
    : IRequestHandler<GetThemeDefinitionsQuery, List<ThemeDefinitionDto>>
{
    private readonly IApplicationDbContext _context;

    public GetThemeDefinitionsHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ThemeDefinitionDto>> Handle(
        GetThemeDefinitionsQuery request,
        CancellationToken cancellationToken
    )
    {
        return await ThemeDefinitionStore.LoadAsync(_context, cancellationToken);
    }
}
