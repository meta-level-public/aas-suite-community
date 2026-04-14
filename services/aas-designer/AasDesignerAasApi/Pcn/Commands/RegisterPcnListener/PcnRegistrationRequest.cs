namespace AasDesignerAasApi.Pcn.Commands.RegisterPcnListener
{
    public class PcnRegistrationRequest
    {
        public required string AasIdentifier { get; set; }
        public required string BrokerUrl { get; set; }
        public required string Topic { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
