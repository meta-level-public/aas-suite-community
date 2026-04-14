using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using AasDesignerApi.Authorization;
using AasShared.Exceptions;
using CsvHelper.Configuration.Attributes;

namespace AasDesignerApi.Model
{
    public class Invitation : IMetadata, IVerifiable, IHardDeletable
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Vorname { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;

        public List<string> BenutzerRollen { get; set; } = [];

        public long OrganisationId { get; set; }
        public DateTimeOffset ValidUntil { get; set; }
        public Guid InvitationGuid { get; set; }
        public string Language { get; set; } = string.Empty;

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

            if (
                benutzer.BenutzerRollen.Exists(r => r == AuthRoles.ORGA_ADMIN)
                && benutzer.OrganisationId == OrganisationId
            )
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
                && benutzer.OrganisationId == OrganisationId
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
                && benutzer.OrganisationId == OrganisationId
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
                && benutzer.OrganisationId == OrganisationId
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
