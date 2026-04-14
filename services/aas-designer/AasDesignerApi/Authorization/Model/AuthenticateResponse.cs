namespace AasDesignerApi.Authorization.Model;

using AasDesignerApi.Model;
using AasDesignerApi.Model.Client;
using AasDesignerModel.Model;

public class AuthenticateResponse
{
    public long Id { get; set; }
    public string Vorname { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string LoginName { get; set; } = string.Empty;
    public string ProfilbildBase64 { get; set; } = string.Empty;
    public string JwtToken { get; set; } = string.Empty;

    public List<string> Rollen { get; set; } = [];

    public string RefreshToken { get; set; } = string.Empty;
    public BenutzerEinstellungen? Einstellungen { get; set; }
    public List<OrgaSettings> OrgaSettings { get; set; } = [];
    public long? PreferredOrgaId { get; set; }

    public ResultCode ResultCode { get; set; }
    public string AdditionalMessage { get; set; } = string.Empty;

    public AuthenticateResponse() { }

    public AuthenticateResponse(
        Benutzer benutzer,
        string jwtToken,
        string refreshToken,
        ResultCode resultCode,
        List<BenutzerOrganisation> validOrgas,
        bool singleTenantMode = false
    )
    {
        Id = benutzer.Id;
        Vorname = benutzer.Vorname;
        Name = benutzer.Name;
        LoginName = benutzer.Email;
        JwtToken = jwtToken;
        RefreshToken = refreshToken;
        Rollen = benutzer.BenutzerRollen;
        ResultCode = resultCode;
        ProfilbildBase64 = benutzer.ProfilbildBase64;
        Einstellungen = benutzer.Einstellungen;

        var now = DateTime.Now;

        OrgaSettings = validOrgas
            .Select(o => new OrgaSettings
            {
                IriPrefix = string.IsNullOrEmpty(o.Organisation.IriPrefix)
                    ? @"https://example.com/"
                    : o.Organisation.IriPrefix ?? string.Empty,
                ThemeUrl = o.Organisation.ThemeUrl ?? string.Empty,
                RegistryUrl = o.Organisation.RegistryUrl ?? string.Empty,
                AasServerUrl = o.Organisation.AasServerUrl ?? string.Empty,
                OrgaId = o.Organisation.Id,
                OrgaName = o.Organisation.Name,
                Rollen = o.BenutzerRollen,
                LogoBase64 = o.Organisation.LogoBase64 ?? string.Empty,
                LicenseExpiry = singleTenantMode
                    ? null
                    : o
                        .Organisation.Bezahlmodelle?.OrderByDescending(o => o.EndDate)
                        .FirstOrDefault(b => !b.Geloescht)
                        ?.EndDate,
            })
            .ToList();
    }
}

public class OrgaSettings
{
    public string OrgaName { get; set; } = string.Empty;
    public long OrgaId { get; set; }
    public string IriPrefix { get; set; } = string.Empty;
    public string ThemeUrl { get; set; } = string.Empty;
    public string RegistryUrl { get; set; } = string.Empty;
    public string AasServerUrl { get; set; } = string.Empty;
    public List<string> Rollen { get; set; } = [];
    public string LogoBase64 { get; set; } = string.Empty;
    public DateTime? LicenseExpiry { get; set; } = null;
}
