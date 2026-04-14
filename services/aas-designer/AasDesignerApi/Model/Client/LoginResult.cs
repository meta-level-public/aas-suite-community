namespace AasDesignerApi.Model.Client
{
    public class LoginResult
    {
        public Benutzer? Benutzer { get; set; }
        public ResultCode ResultCode { get; set; } = ResultCode.UNBEKANNT;
    }
}
