using System.Collections.Concurrent;
using AasDesignerApi.Controllers.Internal;
using AasDesignerApi.Model;
using AasDesignerModel.Model;

namespace AasDesignerApi.Authorization
{
    public class ViewerUserCacheService
    {
        public static ConcurrentDictionary<long, AppUser> UserCache =
            new ConcurrentDictionary<long, AppUser>();

        public static void ResetCache()
        {
            UserCache = new ConcurrentDictionary<long, AppUser>();
        }

        public static AasDesignerApi.Model.Benutzer CreateNewViewerUser(
            ViewerLogin loginData,
            Organisation orga,
            AasInfrastructureSettings aasInfrastructureSettings
        )
        {
            var user = new AasDesignerApi.Model.Benutzer
            {
                AccountAktiv = true,
                AnlageDatum = DateTime.Now,
                Name = loginData.Guid.ToString(),
                BenutzerOrganisationen = new List<BenutzerOrganisation>
                {
                    new BenutzerOrganisation { Organisation = orga },
                },
            };
            var appUser = new AppUser
            {
                Benutzer = user,
                Organisation = orga,
                BenutzerRollen = new List<string> { AuthRoles.VIEWER_NUTZER },
                CurrentInfrastructureSettings = aasInfrastructureSettings,
            };

            if (UserCache.Keys.Any())
                user.Id = UserCache.Keys.Min() - 1;
            else
                user.Id = -1;
            UserCache.TryAdd(appUser.Benutzer.Id, appUser);

            return user;
        }
    }
}
