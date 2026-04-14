namespace AasDesignerApi.Localization
{
    public class DeLocalizedMessages : ILocalizedMessages
    {
        public string GetActivationSuccessMessage(string url)
        {
            var text = File.ReadAllText(
                Path.Combine("Localization", "Templates", $"redirect.de.html")
            );

            text = text.Replace(
                "{{redirect-message}}",
                "Ihr temporäres Passwort wurde erfolgreich aktiviert."
            );
            text = text.Replace(
                "{{redirect-text}}",
                "Bitte ändern Sie das Passwort direkt nach dem ersten Login"
            );
            text = text.Replace("{{url}}", url);

            return text;
        }

        public string GetActivationUserNotFoundMessage(string url)
        {
            var text = File.ReadAllText(
                Path.Combine("Localization", "Templates", $"redirect.de.html")
            );

            text = text.Replace(
                "{{redirect-message}}",
                "Ihr temporäres Passwort konnte nicht aktiviert werden."
            );
            text = text.Replace("{{redirect-text}}", "");
            text = text.Replace("{{url}}", url);

            return text;
        }

        public string GetInvitationAlreadyMemberOfOrganisation(string baseUrl)
        {
            var text = File.ReadAllText(
                Path.Combine("Localization", "Templates", $"redirect.de.html")
            );

            text = text.Replace(
                "{{redirect-message}}",
                "Sie sind bereits Mitglied dieser Organisation!"
            );
            text = text.Replace("{{redirect-text}}", "");
            text = text.Replace("{{url}}", baseUrl);

            return text;
        }

        public string GetInvitationCreateAccountMessage(string baseUrl, string guid)
        {
            var text = File.ReadAllText(
                Path.Combine("Localization", "Templates", $"redirect.de.html")
            );

            text = text.Replace(
                "{{redirect-message}}",
                "Um Zugriff zum AAS-Designer zu erhalten, füllen Sie bitte das Formular auf der folgenden Seite aus."
            );
            text = text.Replace("{{redirect-text}}", "");
            text = text.Replace("{{url}}", baseUrl + "/create-invited-account/" + guid);

            return text;
        }

        public string GetInvitationExpiredMessage(string baseUrl)
        {
            var text = File.ReadAllText(
                Path.Combine("Localization", "Templates", $"redirect.de.html")
            );

            text = text.Replace(
                "{{redirect-message}}",
                "Dieser Einladungslink ist abgelaufen. Bitte kontaktieren Sie die Organisation, die Sie eingeladen hat."
            );
            text = text.Replace("{{redirect-text}}", "");
            text = text.Replace("{{url}}", baseUrl);

            return text;
        }

        public string GetInvitationMultipleUsersMessage(string baseUrl)
        {
            var text = File.ReadAllText(
                Path.Combine("Localization", "Templates", $"redirect.de.html")
            );

            text = text.Replace(
                "{{redirect-message}}",
                "Zu dieser E-Mailadresse wurden mehrere Einträge gefunden. Bitte kontaktieren Sie den Support."
            );
            text = text.Replace("{{redirect-text}}", "");
            text = text.Replace("{{url}}", baseUrl);

            return text;
        }

        public string GetInvitationNoMoreLicensesMessage(string baseUrl)
        {
            var text = File.ReadAllText(
                Path.Combine("Localization", "Templates", $"redirect.de.html")
            );

            text = text.Replace(
                "{{redirect-message}}",
                "In dieser Organisation sind keine freien Lizenzen verfügbar. Bitte wenden Sie sich an die Organisation, die Sie eingeladen hat."
            );
            text = text.Replace("{{redirect-text}}", "");
            text = text.Replace("{{url}}", baseUrl);

            return text;
        }

        public string GetInvitationNotFoundMessage(string baseUrl)
        {
            var text = File.ReadAllText(
                Path.Combine("Localization", "Templates", $"redirect.de.html")
            );

            text = text.Replace(
                "{{redirect-message}}",
                "Zu dieser Einladung kann kein Eintrag gefunden werden!"
            );
            text = text.Replace("{{redirect-text}}", "");
            text = text.Replace("{{url}}", baseUrl);

            return text;
        }

        public string GetInvitationSuccessMessage(string baseUrl)
        {
            var text = File.ReadAllText(
                Path.Combine("Localization", "Templates", $"redirect.de.html")
            );

            text = text.Replace(
                "{{redirect-message}}",
                "Sie haben die Einladung erfolgreich angenommen. Nach dem Login können Sie die Organisation auswählen, mit der Sie arbeiten möchten."
            );
            text = text.Replace("{{redirect-text}}", "");
            text = text.Replace("{{url}}", baseUrl);

            return text;
        }

        public string GetTokenActivationSuccessMessage(string url)
        {
            var text = File.ReadAllText(
                Path.Combine("Localization", "Templates", $"redirect.de.html")
            );

            text = text.Replace("{{redirect-message}}", "Das Token wurde erfolgreich aktiviert.");
            text = text.Replace("{{redirect-text}}", "");
            text = text.Replace("{{url}}", url);

            return text;
        }

        public string GetTokenActivationUserNotFoundMessage(string url)
        {
            var text = File.ReadAllText(
                Path.Combine("Localization", "Templates", $"redirect.de.html")
            );

            text = text.Replace("{{redirect-message}}", "Das Token konnte nicht aktiviert werden.");
            text = text.Replace("{{redirect-text}}", "");
            text = text.Replace("{{url}}", url);

            return text;
        }
    }
}
