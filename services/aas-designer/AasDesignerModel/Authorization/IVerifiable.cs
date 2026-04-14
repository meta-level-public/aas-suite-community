using AasDesignerApi.Model;

namespace AasDesignerApi.Authorization
{
    public interface IVerifiable
    {
        public void VerifyUpdateAllowed(AppUser benutzer);
        public void VerifyInsertAllowed(AppUser benutzer);
        public void VerifyDeleteAllowed(AppUser benutzer);
        public void VerifyReadAllowed(AppUser benutzer);
    }
}
