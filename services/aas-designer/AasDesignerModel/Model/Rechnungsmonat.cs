using AasDesignerApi.Authorization;
using AasShared.Exceptions;

namespace AasDesignerApi.Model
{
    public class Rechnungsmonat : IMetadata, IVerifiable, IProtokollierbar
    {
        public long Id { get; set; }
        public string RechnungsmonatJahr { get; set; } = string.Empty; //Format mm/yyyy
        #region Verwaltungsdaten

        public DateTime AnlageDatum { get; set; } = DateTime.Now;
        public string AnlageBenutzer { get; set; } = string.Empty;
        public DateTime AenderungsDatum { get; set; } = DateTime.Now;
        public string AenderungsBenutzer { get; set; } = string.Empty;
        public bool Geloescht { get; set; } = false;
        public int AenderungsZaehler { get; set; } = 0;

        #endregion


        public void VerifyDeleteAllowed(AppUser benutzer)
        {
            var allowed = false;

            if (benutzer.BenutzerRollen.Exists(r => r == AuthRoles.SYSTEM_ADMIN))
            {
                allowed = true;
            }

            if (!allowed)
            {
                throw new OperationNotAllowedException("DELETE_RECHNUNGSMONAT_NOT_ALLOWED");
            }
        }

        public void VerifyReadAllowed(AppUser benutzer)
        {
            var allowed = false;

            if (benutzer.BenutzerRollen.Exists(r => r == AuthRoles.SYSTEM_ADMIN))
            {
                allowed = true;
            }

            if (!allowed)
            {
                throw new OperationNotAllowedException("READ_RECHNUNGSMONATNOT_ALLOWED");
            }
        }

        public void VerifyInsertAllowed(AppUser benutzer)
        {
            var allowed = false;

            if (benutzer.BenutzerRollen.Exists(r => r == AuthRoles.SYSTEM_ADMIN))
            {
                allowed = true;
            }

            if (!allowed)
            {
                throw new OperationNotAllowedException("INSERT_RECHNUNGSMONAT_NOT_ALLOWED");
            }
        }

        public void VerifyUpdateAllowed(AppUser benutzer)
        {
            var allowed = false;

            if (benutzer.BenutzerRollen.Exists(r => r == AuthRoles.SYSTEM_ADMIN))
            {
                allowed = true;
            }

            if (!allowed)
            {
                throw new OperationNotAllowedException("UPDATE_RECHNUNGSMONAT_NOT_ALLOWED");
            }
        }
    }
}
