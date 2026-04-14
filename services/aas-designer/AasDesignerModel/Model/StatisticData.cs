using AasDesignerApi.Statistics;

namespace AasDesignerApi.Model
{
    public class StatisticData
    {
        public long Id { get; set; }
        public StatisticsType Typ { get; set; }
        public decimal Value { get; set; } = 0;
        public long OrgaId { get; set; }
    }
}
