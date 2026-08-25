using AasDesignerModel.Model;

namespace AasDesignerApi.Model
{
    public class AppUser
    {
        // This class encapsulates the object of the current user in their current session with their current permissions

        public long BenutzerId { get; set; }
        public Benutzer Benutzer { get; set; }
        public Organisation Organisation { get; set; }
        public long OrganisationId { get; set; }
        public List<string> BenutzerRollen { get; set; } = [];

        public string JwtToken { get; set; } = string.Empty;

        public string CurrrentLanguage { get; set; } = "en";

        public AasInfrastructureSettings CurrentInfrastructureSettings { get; set; }
        public string CurrentPersonalAccessToken { get; set; } = string.Empty;
        public DateTime CurrentPersonalAccessTokenValidUntil { get; set; }

#pragma warning disable CS8618 // Non-nullable field must contain a non-null value when exiting constructor. Consider adding the 'required' modifier or declaring as nullable.
        public AppUser()
#pragma warning restore CS8618 // Non-nullable field must contain a non-null value when exiting constructor. Consider adding the 'required' modifier or declaring as nullable.
        {
            /* intentionally left empty */
        }

        public AppUser(
            Benutzer benutzer,
            Organisation organisation,
            List<string> benutzerrollen,
            AasInfrastructureSettings currentInfrastructureSettings,
            string currentLanguage,
            string jwtToken
        )
        {
            BenutzerId = benutzer.Id;
            Benutzer = benutzer;
            OrganisationId = organisation.Id;
            Organisation = organisation;
            BenutzerRollen = benutzerrollen;
            CurrentInfrastructureSettings = currentInfrastructureSettings;
            CurrrentLanguage = currentLanguage;
            JwtToken = jwtToken;
        }
    }
}
