using AasDesignerApi.Model;
using AasDesignerDashboardApi.Dashboard.Model;
using AasDesignerModel;
using AasDesignerModel.Model;
using AasShared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AasDesignerDashboardApi.Dashboard.Queries.UpdateDashboard;

public class UpdateDashboardCommand : IRequest<long>
{
    public AppUser AppUser { get; set; } = null!;
    public DashboardLayoutDto UpdatedDashboard { get; set; } = null!;
}

public class UpdateDashboardHandler : IRequestHandler<UpdateDashboardCommand, long>
{
    private readonly IApplicationDbContext _context;

    public UpdateDashboardHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<long> Handle(
        UpdateDashboardCommand request,
        CancellationToken cancellationToken
    )
    {
        var dashboard = await _context
            .DashboardLayouts.Include(d => d.Pages)
                .ThenInclude(p => p.Rows)
                    .ThenInclude(r => r.Columns)
            .Where(d => d.Id == request.UpdatedDashboard.Id)
            .FirstOrDefaultAsync(cancellationToken);

        if (dashboard == null && request.UpdatedDashboard.Id != 0)
            throw new Exception("Dashboard not found");
        if (dashboard == null)
        {
            dashboard = new DashboardLayout
            {
                BenutzerId = request.AppUser.BenutzerId,
                OrganisationId = request.AppUser.OrganisationId,
            };
            _context.DashboardLayouts.Add(dashboard);
        }
        if (dashboard.BenutzerId != request.AppUser.BenutzerId)
            throw new OperationNotAllowedException("Update Dashboard not allowed");

        // TODO: Update dashboard properties
        var pages = new List<LayoutPage>();
        request.UpdatedDashboard.Pages.ForEach(p =>
        {
            var pageRows = new List<LayoutRow>();
            var page = new LayoutPage
            {
                DashboardLayoutId = dashboard.Id,
                Title = p.Title,
                Icon = p.Icon,
                Rows = pageRows,
                RefreshInterval = p.RefreshInterval,
                Index = p.Index,
            };
            p.Rows.ForEach(r =>
            {
                var rowColumns = new List<LayoutColumn>();
                var row = new LayoutRow
                {
                    LayoutPageId = page.Id,
                    Index = r.Index,
                    Columns = rowColumns,
                };
                r.Columns.ForEach(c =>
                {
                    var column = new LayoutColumn
                    {
                        LayoutRowId = row.Id,
                        Width = c.Width,
                        Title = c.Title,
                        ContentUrl = c.ContentUrl,
                        ContentJson = c.ContentJson,
                        Type = c.Type,
                        Icon = c.Icon,
                        Color = c.Color,
                        FontColor = c.FontColor,
                        RefreshInterval = c.RefreshInterval,
                        Index = c.Index,
                    };
                    rowColumns.Add(column);
                });
                pageRows.Add(row);
            });
            pages.Add(page);
        });
        dashboard.Pages = pages;

        await _context.SaveChangesAsync(cancellationToken);

        return dashboard.Id;
    }
}
