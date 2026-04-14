namespace AasDesignerApi.Model.Client
{
    public class TokenResponse
    {
        public Guid TokenGuid { get; set; }
        public string Token { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
    }
}
