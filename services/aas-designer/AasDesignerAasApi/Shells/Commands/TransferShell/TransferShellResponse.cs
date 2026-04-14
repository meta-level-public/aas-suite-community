namespace AasDesignerAasApi.Shells.Commands.TransferShell
{
    public class TransferShellResponse
    {
        public string AasIdentifier { get; set; } = string.Empty;
        public long TargetInfrastructureId { get; set; }
        public bool HasPcnSubmodel { get; set; }
        public List<string> BrokerUrls { get; set; } = [];
        public string Topic { get; set; } = string.Empty;
    }
}
