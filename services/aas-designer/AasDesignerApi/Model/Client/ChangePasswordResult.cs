namespace AasDesignerApi.Model.Client
{
    public class ChangePasswordResult
    {
        public bool PasswordChanged { get; set; }
        public string ErrorMessage { get; set; } = string.Empty;

        public string Token { get; set; } = string.Empty;
    }
}
