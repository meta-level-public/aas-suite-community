using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using AasDesignerApi.Authorization;
using AasDesignerModel.Model;
using AasShared.Exceptions;
using CsvHelper.Configuration.Attributes;

namespace AasDesignerApi.Model
{
    public class Benutzer : IMetadata, IVerifiable, IProtokollierbar, IMaybeHardDeletable
    {
        public long Id { get; set; }
        public Guid Guid { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = string.Empty;
        public string Vorname { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Telefon { get; set; } = string.Empty;
        public DateTime? LetzerLogin { get; set; } = null;
        public bool EmailBestaetigt { get; set; } = false;
        public bool AccountAktiv { get; set; } = true;
        public bool CreatedBySso { get; set; }
        public string ExternalIdentityProvider { get; set; } = string.Empty;
        public string ExternalIdentitySubject { get; set; } = string.Empty;
        public string ExternalIdentityUsername { get; set; } = string.Empty;

        public BenutzerEinstellungen? Einstellungen { get; set; }

        public List<string> BenutzerRollen { get; set; } = [];

        public List<BenutzerOrganisation> BenutzerOrganisationen { get; set; } = [];

        public string ProfilbildBase64 { get; set; } = string.Empty;

        #region Verwaltungsdaten

        public DateTime AnlageDatum { get; set; } = DateTime.Now;
        public string AnlageBenutzer { get; set; } = string.Empty;
        public DateTime AenderungsDatum { get; set; } = DateTime.Now;
        public string AenderungsBenutzer { get; set; } = string.Empty;
        public bool Geloescht { get; set; } = false;
        public int AenderungsZaehler { get; set; } = 0;

        public bool TokenConfirmed { get; set; } = false;

        #endregion

        [NotMapped]
        public string Token { get; set; } = string.Empty;

        [JsonIgnore]
        public List<RefreshToken> RefreshTokens { get; set; } = [];

        public bool IsSystemUser { get; set; } = false;

        public bool DatenschutzAccepted { get; set; } = false;
        public DateTime? DatenschutzAcceptedDate { get; set; } = null;

        public void VerifyDeleteAllowed(AppUser benutzer)
        {
            var allowed = false;

            if (benutzer.BenutzerRollen.Exists(r => r == AuthRoles.SYSTEM_ADMIN))
            {
                allowed = true;
            }

            if (!allowed)
            {
                throw new OperationNotAllowedException("DELETE_USER_NOT_ALLOWED");
            }
        }

        public void VerifyReadAllowed(AppUser benutzer)
        {
            var allowed = false;

            if (benutzer.BenutzerRollen.Exists(r => r == AuthRoles.SYSTEM_ADMIN))
            {
                allowed = true;
            }

            if (
                benutzer.BenutzerRollen.Exists(r => r == AuthRoles.ORGA_ADMIN)
                && BenutzerOrganisationen.Exists(bo =>
                    bo.OrganisationId == benutzer.OrganisationId
                    && bo.BenutzerRollen.Contains(AuthRoles.ORGA_ADMIN)
                )
            )
            {
                allowed = true;
            }

            if (
                benutzer.BenutzerRollen.Exists(r => r == AuthRoles.BENUTZER)
                && benutzer.BenutzerId == Id
            )
            {
                allowed = true;
            }

            if (!allowed)
            {
                throw new OperationNotAllowedException("READ_USER_NOT_ALLOWED");
            }
        }

        public void VerifyInsertAllowed(AppUser benutzer)
        {
            var allowed = false;

            if (benutzer.BenutzerRollen.Exists(r => r == AuthRoles.SYSTEM_ADMIN))
            {
                allowed = true;
            }

            if (
                benutzer.BenutzerRollen.Exists(r => r == AuthRoles.ORGA_ADMIN)
                && BenutzerOrganisationen.Exists(bo => bo.OrganisationId == benutzer.OrganisationId)
            )
            {
                allowed = true;
            }

            if (!allowed)
            {
                throw new OperationNotAllowedException("INSERT_USER_NOT_ALLOWED");
            }
        }

        public void VerifyUpdateAllowed(AppUser benutzer)
        {
            var allowed = false;

            if (benutzer.BenutzerRollen.Exists(r => r == AuthRoles.SYSTEM_ADMIN))
            {
                allowed = true;
            }

            if (
                benutzer.BenutzerRollen.Exists(r => r == AuthRoles.ORGA_ADMIN)
                && BenutzerOrganisationen.Exists(bo => bo.OrganisationId == benutzer.OrganisationId)
            )
            {
                allowed = true;
            }

            if (
                benutzer.BenutzerRollen.Exists(r => r == AuthRoles.BENUTZER)
                && benutzer.BenutzerId == Id
            )
            {
                allowed = true;
            }

            if (!allowed)
            {
                throw new OperationNotAllowedException("UPDATE_USER_NOT_ALLOWED");
            }
        }

        [NotMapped]
        [JsonIgnore]
        [Ignore]
        public bool SerializeForBackup { get; set; } = false;

        [NotMapped]
        [JsonIgnore]
        public bool ShouldBeHardDeleted { get; set; } = false;

        public bool ShouldSerializeBesitzer()
        {
            if (SerializeForBackup)
            {
                return false;
            }
            else
            {
                return true;
            }
        }

        public bool ShouldSerializeOrganisation()
        {
            if (SerializeForBackup)
            {
                return false;
            }
            else
            {
                return true;
            }
        }
    }
}
