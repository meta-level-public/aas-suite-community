namespace AasDesignerApi.Localization
{
    public class LocalizedMessageFactory
    {
        public static ILocalizedMessages GetLocalizedMessages(string language)
        {
            if (language == "de")
            {
                return new DeLocalizedMessages();
            }
            else
            {
                return new EnLocalizedMessages();
            }
        }
    }
}
