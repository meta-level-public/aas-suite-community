namespace AasDesignerApi.Model.Client
{
    public class ChangePasswordCredentials
    {
        public string OldPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
}
