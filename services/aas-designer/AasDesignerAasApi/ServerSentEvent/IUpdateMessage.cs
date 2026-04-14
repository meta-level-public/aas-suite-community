using AasShared.Model.AasApi;

namespace AasDesignerAasApi.ServerSentEvent
{
    public interface IUpdateMessage
    {
        public string Identifier { get; set; }
        public long InfrastructureId { get; set; }
        public MessageType Type { get; set; }
        public string AdditionalContent { get; set; }
    }

    public enum MessageType
    {
        Infrastructure,
        Pcn,
        Other,
    }
}
