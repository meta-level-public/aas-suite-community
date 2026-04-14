using AasDesignerApi.Model;
using AasDesignerApi.Statistics;
using AasDesignerModel;

namespace AasDesignerCommon.Statistics
{
    public class StatisticsLogger
    {
        private readonly IApplicationDbContext _context;

        public StatisticsLogger(IApplicationDbContext context)
        {
            _context = context;
        }

        public void LogAction(StatisticActionType typ, long orgaId)
        {
            var statisticAction = new StatisticAction
            {
                ActionDate = DateTime.Now,
                Typ = typ,
                OrgaId = orgaId,
            };

            _context.Add(statisticAction);
            _context.SaveChanges();
        }

        public void LogAction(
            StatisticActionType typ,
            long orgaId,
            long benutzerId,
            string additionalData
        )
        {
            var statisticAction = new StatisticAction
            {
                ActionDate = DateTime.Now,
                Typ = typ,
                OrgaId = orgaId,
                BenutzerId = benutzerId,
                AdditionalData = additionalData,
            };

            _context.Add(statisticAction);
            _context.SaveChanges();
        }
    }
}
