namespace AasDesignerApi.Model.Client
{
    public class RegisterResult
    {
        public Benutzer? Benutzer { get; set; }
        public ResultCode ResultCode { get; set; } = ResultCode.UNBEKANNT;
    }
}
