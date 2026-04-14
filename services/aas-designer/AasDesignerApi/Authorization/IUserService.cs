using AasDesignerApi.Authorization.Model;
using AasDesignerApi.Controllers.Internal;
using AasDesignerApi.Model;
using AasDesignerModel.Model;

namespace AasDesignerApi.Authorization;

public interface IUserService
{
    AuthenticateResponse Authenticate(AuthenticateRequest model, string ipAddress);
    Task<AuthenticateResponse> AuthenticateExternalSession(string token, string ipAddress);
    void RegisterOrgaSwitch(AppUser user, long orgaId);
    void AcceptPrivacy(AppUser user);
    AuthenticateResponse RefreshToken(string token, string ipAddress);
    void RevokeToken(string token, string ipAddress);
    AasDesignerApi.Model.Benutzer GetById(long id);
    AuthenticateResponse AuthenticateViewer(ViewerLogin loginData);
    AppUser GetAppUser(long benutzerId, long orgaId, long aasSettingId);
    AppUser? GetDefaultAppUser(long benutzerId);
}
