namespace AasDesignerAasApi.Shells.Commands.TransferShell
{
    public class TransferShellRequest
    {
        public long TargetRepoId { get; set; }
        public string AasIdentifier { get; set; } = string.Empty;
    }
}
