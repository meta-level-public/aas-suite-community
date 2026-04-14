namespace AasDesignerApi.Localization
{
    public class EnLocalizedMessages : ILocalizedMessages
    {
        public string GetActivationSuccessMessage(string url)
        {
            var text = File.ReadAllText(
                Path.Combine("Localization", "Templates", $"redirect.en.html")
            );

            text = text.Replace(
                "{{redirect-message}}",
                "Temporary password successfully activated."
            );
            text = text.Replace("{{redirect-text}}", "");
            text = text.Replace("{{url}}", url);

            return text;
        }

        public string GetActivationUserNotFoundMessage(string url)
        {
            var text = File.ReadAllText(
                Path.Combine("Localization", "Templates", $"redirect.en.html")
            );

            text = text.Replace(
                "{{redirect-message}}",
                "Temporary password could not be activated."
            );
            text = text.Replace("{{redirect-text}}", "");
            text = text.Replace("{{url}}", url);

            return text;
        }

        public string GetInvitationAlreadyMemberOfOrganisation(string baseUrl)
        {
            var text = File.ReadAllText(
                Path.Combine("Localization", "Templates", $"redirect.en.html")
            );

            text = text.Replace(
                "{{redirect-message}}",
                "You are already a member of this organisation!"
            );
            text = text.Replace("{{redirect-text}}", "");
            text = text.Replace("{{url}}", baseUrl);

            return text;
        }

        public string GetInvitationCreateAccountMessage(string baseUrl, string guid)
        {
            var text = File.ReadAllText(
                Path.Combine("Localization", "Templates", $"create-account.en.html")
            );

            text = text.Replace(
                "{{redirect-message}}",
                "To gain access to the AAS Designer, please fill out the form on the following page."
            );
            text = text.Replace("{{redirect-text}}", "");
            text = text.Replace("{{url}}", baseUrl + "/create-invited-account/" + guid);

            return text;
        }

        public string GetInvitationExpiredMessage(string baseUrl)
        {
            var text = File.ReadAllText(
                Path.Combine("Localization", "Templates", $"redirect.en.html")
            );

            text = text.Replace(
                "{{redirect-message}}",
                "This invitation has expired. Please contact the organisation that invited you."
            );
            text = text.Replace("{{redirect-text}}", "");
            text = text.Replace("{{url}}", baseUrl);

            return text;
        }

        public string GetInvitationMultipleUsersMessage(string baseUrl)
        {
            var text = File.ReadAllText(
                Path.Combine("Localization", "Templates", $"redirect.en.html")
            );

            text = text.Replace(
                "{{redirect-message}}",
                "There are multiple accounts with this email address. Please contact support."
            );
            text = text.Replace("{{redirect-text}}", "");
            text = text.Replace("{{url}}", baseUrl);

            return text;
        }

        public string GetInvitationNoMoreLicensesMessage(string baseUrl)
        {
            var text = File.ReadAllText(
                Path.Combine("Localization", "Templates", $"redirect.en.html")
            );

            text = text.Replace(
                "{{redirect-message}}",
                "No free licenses are available in this organization. Please contact the organization that invited you.."
            );
            text = text.Replace("{{redirect-text}}", "");
            text = text.Replace("{{url}}", baseUrl);

            return text;
        }

        public string GetInvitationNotFoundMessage(string baseUrl)
        {
            var text = File.ReadAllText(
                Path.Combine("Localization", "Templates", $"redirect.en.html")
            );

            text = text.Replace(
                "{{redirect-message}}",
                "There was no invitation found for this email address."
            );
            text = text.Replace("{{redirect-text}}", "");
            text = text.Replace("{{url}}", baseUrl);

            return text;
        }

        public string GetInvitationSuccessMessage(string baseUrl)
        {
            var text = File.ReadAllText(
                Path.Combine("Localization", "Templates", $"redirect.en.html")
            );

            text = text.Replace(
                "{{redirect-message}}",
                "You have successfully accepted the invitation. After Login, you can select the organisation you want to work with."
            );
            text = text.Replace("{{redirect-text}}", "");
            text = text.Replace("{{url}}", baseUrl);

            return text;
        }

        public string GetTokenActivationSuccessMessage(string url)
        {
            var text = File.ReadAllText(
                Path.Combine("Localization", "Templates", $"redirect.en.html")
            );

            text = text.Replace("{{redirect-message}}", "The token was activated successfully.");
            text = text.Replace("{{redirect-text}}", "");
            text = text.Replace("{{url}}", url);

            return text;
        }

        public string GetTokenActivationUserNotFoundMessage(string url)
        {
            var text = File.ReadAllText(
                Path.Combine("Localization", "Templates", $"redirect.en.html")
            );

            text = text.Replace("{{redirect-message}}", "Your token could not be activated.");
            text = text.Replace("{{redirect-text}}", "");
            text = text.Replace("{{url}}", url);

            return text;
        }
    }
}
