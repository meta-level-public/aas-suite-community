using AasDesignerApi.Statistics;

namespace AasDesignerApi.Model
{
    public class StatisticAction
    {
        public long Id { get; set; }
        public StatisticActionType Typ { get; set; }
        public DateTime ActionDate { get; set; }
        public long OrgaId { get; set; }
        public long BenutzerId { get; set; }
        public string AdditionalData { get; set; } = string.Empty;
    }

    public class AdditionalDataSaveShell
    {
        public string AasId { get; set; } = string.Empty;
        public long InfrastructureId { get; set; }
        public string IdShort { get; set; } = string.Empty;
        public DateTime? LastEditedAt { get; set; }
        public bool? IsAvailable { get; set; }
        public string EventType { get; set; } = string.Empty;
    }
}
