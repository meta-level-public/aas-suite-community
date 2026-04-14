using AasDesignerModel;
using Microsoft.EntityFrameworkCore;

namespace AasDesignerApi.Service
{
    public class DashboardService
    {
        private readonly IApplicationDbContext _context;

        public DashboardService(IApplicationDbContext context)
        {
            _context = context;
        }

        public Dictionary<string, decimal> GetStatistics(long orgaId)
        {
            return _context
                .StatisticDatas.Where(s => s.OrgaId == orgaId)
                .ToDictionary(s => s.Typ.ToString(), s => s.Value);
        }

        public Dictionary<int, int> GetLoginChartData(long orgaId)
        {
            var chartDataStart = DateTime.Now.AddDays(-1);
            return _context
                .StatisticActions.Where(s =>
                    s.OrgaId == orgaId
                    && s.Typ == Statistics.StatisticActionType.LOGIN
                    && s.ActionDate > chartDataStart
                )
                .ToList()
                .GroupBy(s => s.ActionDate.Hour)
                .ToDictionary(g => g.Key, g => g.Count());
        }

        public Dictionary<int, int> GetSystemLoginChartData()
        {
            var chartDataStart = DateTime.Now.AddDays(-1);
            return _context
                .StatisticActions.Where(s =>
                    s.Typ == Statistics.StatisticActionType.LOGIN && s.ActionDate > chartDataStart
                )
                .ToList()
                .GroupBy(s => s.ActionDate.Hour)
                .ToDictionary(g => g.Key, g => g.Count());
        }

        public Dictionary<int, int> GetSystemLoginChartDataLast7Days()
        {
            var chartDataStart = DateTime.Now.AddDays(-6);
            return _context
                .StatisticActions.Where(s =>
                    s.Typ == Statistics.StatisticActionType.LOGIN && s.ActionDate > chartDataStart
                )
                .ToList()
                .GroupBy(s => s.ActionDate.Day)
                .ToDictionary(g => g.Key, g => g.Count());
        }

        public Dictionary<int, int> GetSystemLoginChartDataMonth(int month, int year)
        {
            var chartDataStart = new DateTime(year, month, 1, 0, 0, 0, 0);
            var chartDataEnd = chartDataStart.AddMonths(1);

            return _context
                .StatisticActions.Where(s =>
                    s.Typ == Statistics.StatisticActionType.LOGIN
                    && s.ActionDate > chartDataStart
                    && s.ActionDate < chartDataEnd
                )
                .ToList()
                .GroupBy(s => s.ActionDate.Day)
                .ToDictionary(g => g.Key, g => g.Count());
        }

        public Dictionary<string, decimal> GetSystemStatistics()
        {
            return _context
                .StatisticDatas.GroupBy(s => s.Typ)
                .Select(g => new
                {
                    col1 = g.Key,
                    col2 = g.Sum(c => c.Value),
                    col3 = g.Count(),
                })
                .ToDictionary(res => res.col1.ToString(), res => res.col2);
        }

        public List<StatisticTableResult> GetSystemLoginTableDataMonth(int month, int year)
        {
            var chartDataStart = new DateTime(year, month, 1, 0, 0, 0, 0);
            var chartDataEnd = chartDataStart.AddMonths(1);

            return _context
                .StatisticActions.Where(s =>
                    s.Typ == Statistics.StatisticActionType.LOGIN
                    && s.ActionDate > chartDataStart
                    && s.ActionDate < chartDataEnd
                )
                .ToList()
                .GroupBy(s => s.ActionDate.Day)
                .Select(g => new StatisticTableResult()
                {
                    HourOrDay = g.Key,
                    Count = g.Count(),
                    OrgaNames = string.Join(',', g.Select(x => GetOrgaName(x.OrgaId)).Distinct()),
                })
                .ToList();
        }

        public List<StatisticTableResult> GetSystemLoginTableDataLast7Days()
        {
            var chartDataStart = DateTime.Now.AddDays(-6);
            return _context
                .StatisticActions.Where(s =>
                    s.Typ == Statistics.StatisticActionType.LOGIN && s.ActionDate > chartDataStart
                )
                .ToList()
                .GroupBy(s => s.ActionDate.Day)
                .Select(g => new StatisticTableResult()
                {
                    HourOrDay = g.Key,
                    Count = g.Count(),
                    OrgaNames = string.Join(',', g.Select(x => GetOrgaName(x.OrgaId)).Distinct()),
                })
                .ToList();
        }

        public List<StatisticTableResult> GetSystemLoginTableData()
        {
            var chartDataStart = DateTime.Now.AddDays(-1);
            return _context
                .StatisticActions.Where(s =>
                    s.Typ == Statistics.StatisticActionType.LOGIN && s.ActionDate > chartDataStart
                )
                .ToList()
                .GroupBy(s => s.ActionDate.Hour)
                .Select(g => new StatisticTableResult()
                {
                    HourOrDay = g.Key,
                    Count = g.Count(),
                    OrgaNames = string.Join(',', g.Select(x => GetOrgaName(x.OrgaId)).Distinct()),
                })
                .ToList();
        }

        public string GetOrgaName(long id)
        {
            return _context.Organisations.Where(o => o.Id == id).FirstOrDefault()?.Name
                ?? string.Empty;
        }

        public int GetIntegratedSubmodels()
        {
            return _context.SubmodelTemplates.Where(p => !p.Geloescht).Count();
        }
    }

    public class StatisticTableResult
    {
        public int HourOrDay { get; set; }
        public int Count { get; set; }
        public string OrgaNames { get; set; } = string.Empty;
    }
}
