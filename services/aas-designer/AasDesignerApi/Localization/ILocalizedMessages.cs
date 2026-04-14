namespace AasDesignerApi.Localization
{
    public interface ILocalizedMessages
    {
        string GetActivationUserNotFoundMessage(string url);
        string GetActivationSuccessMessage(string url);
        string GetTokenActivationUserNotFoundMessage(string baseUrl);
        string GetTokenActivationSuccessMessage(string baseUrl);
        string GetInvitationNotFoundMessage(string baseUrl);
        string GetInvitationSuccessMessage(string baseUrl);
        string GetInvitationCreateAccountMessage(string baseUrl, string guid);
        string GetInvitationNoMoreLicensesMessage(string baseUrl);
        string GetInvitationExpiredMessage(string baseUrl);
        string GetInvitationMultipleUsersMessage(string baseUrl);
        string GetInvitationAlreadyMemberOfOrganisation(string baseUrl);
    }
}
