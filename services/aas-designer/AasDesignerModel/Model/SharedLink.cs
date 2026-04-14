using System.ComponentModel.DataAnnotations.Schema;
using AasDesignerApi.Authorization;
using AasShared.Exceptions;
using CsvHelper.Configuration.Attributes;
using Newtonsoft.Json;

namespace AasDesignerApi.Model
{
    public class SharedLink : IMetadata, IVerifiable, IHardDeletable
    {
        public long Id { get; set; }
        public Guid? Guid { get; set; }
        public DateTime? Ablaufdatum { get; set; } = null;

        [JsonIgnore]
        public string Passwort { get; set; } = string.Empty;

        [NotMapped]
        public bool HasPasswort
        {
            get => !String.IsNullOrEmpty(Passwort);
        }

        public string GeneratedLink { get; set; } = string.Empty;
        public string Notiz { get; set; } = string.Empty;

        // ID der shared AAS
        public string AasIdentifier { get; set; } = string.Empty;

        // ID der shared AAS-Infrastruktur
        public long AasInfrastrukturId { get; set; }
        public long? BesitzerId { get; set; }

        [JsonIgnore]
        public Benutzer? Besitzer { get; set; }
        public long? BesitzerOrganisationId { get; set; }

        [JsonIgnore]
        public Organisation? BesitzerOrganisation { get; set; }
        public int CountViews { get; set; } = 0;

        #region Verwaltungsdaten
        public DateTime AnlageDatum { get; set; } = DateTime.Now;
        public string AnlageBenutzer { get; set; } = string.Empty;
        public DateTime AenderungsDatum { get; set; } = DateTime.Now;
        public string AenderungsBenutzer { get; set; } = string.Empty;
        public bool Geloescht { get; set; } = false;
        public int AenderungsZaehler { get; set; } = 0;

        #endregion

        [NotMapped]
        [JsonIgnore]
        [Ignore]
        public bool SerializeForBackup { get; set; } = false;

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

        public SharedLink() { }

        public void VerifyDeleteAllowed(AppUser benutzer)
        {
            var allowed = false;

            if (benutzer.BenutzerRollen.Exists(r => r == AuthRoles.SYSTEM_ADMIN))
            {
                allowed = true;
            }

            if (
                benutzer.BenutzerRollen.Exists(r => r == AuthRoles.ORGA_ADMIN)
                && Besitzer != null
                && benutzer.OrganisationId == BesitzerOrganisationId
            )
            {
                allowed = true;
            }

            if (!allowed)
            {
                throw new OperationNotAllowedException("DELETE_SHARED_LINK_NOT_ALLOWED");
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
                && benutzer.OrganisationId == BesitzerOrganisationId
            )
            {
                allowed = true;
            }

            if (
                benutzer.BenutzerRollen.Exists(r => r == AuthRoles.BENUTZER)
                && benutzer.BenutzerId == BesitzerId
                && benutzer.OrganisationId == BesitzerOrganisationId
            )
            {
                allowed = true;
            }

            if (!allowed)
            {
                throw new OperationNotAllowedException("INSERT_SHARED_LINK_NOT_ALLOWED");
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
                && Besitzer != null
                && benutzer.OrganisationId == BesitzerOrganisationId
            )
            {
                allowed = true;
            }

            if (
                benutzer.BenutzerRollen.Exists(r => r == AuthRoles.BENUTZER)
                && Besitzer != null
                && benutzer.OrganisationId == BesitzerOrganisationId
            )
            {
                allowed = true;
            }

            if (
                benutzer.BenutzerRollen.Exists(r => r == AuthRoles.VIEWER_NUTZER)
                && Besitzer != null
                && benutzer.OrganisationId == BesitzerOrganisationId
            )
            {
                allowed = true;
            }

            if (!allowed)
            {
                throw new OperationNotAllowedException("READ_SHARED_LINK_NOT_ALLOWED");
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
                && Besitzer != null
                && benutzer.OrganisationId == BesitzerOrganisationId
            )
            {
                allowed = true;
            }

            if (
                benutzer.BenutzerRollen.Exists(r => r == AuthRoles.BENUTZER)
                && Besitzer != null
                && benutzer.OrganisationId == BesitzerOrganisationId
            )
            {
                allowed = true;
            }

            if (!allowed)
            {
                throw new OperationNotAllowedException("UPDATE_SHARED_LINK_NOT_ALLOWED");
            }
        }
    }
}
