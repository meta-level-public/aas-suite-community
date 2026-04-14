using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Threading.Tasks;
using AasDesignerApi.Model.Client;

namespace AasDesignerApi.Authorization.Model
{
    public class ExternalLoginResult
    {
        public string Subject { get; set; } = string.Empty;
        public string PreferredUsername { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Firstname { get; set; } = string.Empty;
        public string Lastname { get; set; } = string.Empty;
        public ResultCode ResultCode { get; set; }
        public string Message { get; set; } = string.Empty;
        public JwtSecurityToken? ValidatedToken { get; internal set; }
        public List<string> Roles { get; internal set; } = [];
    }
}
