using System.ComponentModel.DataAnnotations.Schema;
using AasDesignerApi.Authorization;
using AasShared.Exceptions;
using CsvHelper.Configuration.Attributes;
using Newtonsoft.Json;

namespace AasDesignerApi.Model
{
    public class Snippet : IMetadata, IVerifiable, IMaybeHardDeletable
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Typ { get; set; } = string.Empty;
        public string Template { get; set; } = string.Empty;
        public long? BesitzerId { get; set; }

        [JsonIgnore]
        public Benutzer? Besitzer { get; set; }
        public long? BesitzerOrganisationId { get; set; }

        [JsonIgnore]
        public Organisation? BesitzerOrganisation { get; set; }
        public AasMetamodelVersion Version { get; set; } = AasMetamodelVersion.UNKNOWN;

        public FreigabeLevel FreigabeLevel { get; set; } = FreigabeLevel.PRIVATE;

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
        public bool ShouldBeHardDeleted { get; set; } = false;

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
                && Besitzer.BenutzerOrganisationen.Exists(bo =>
                    bo.OrganisationId == benutzer.OrganisationId
                    && bo.BenutzerRollen.Contains(AuthRoles.ORGA_ADMIN)
                )
            )
            {
                allowed = true;
            }

            if (
                benutzer.BenutzerRollen.Exists(r => r == AuthRoles.BENUTZER)
                && benutzer.BenutzerId == BesitzerId
            )
            {
                allowed = true;
            }

            if (!allowed)
            {
                throw new OperationNotAllowedException("DELETE_SNIPPET_NOT_ALLOWED");
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
                && Besitzer.BenutzerOrganisationen.Exists(bo =>
                    bo.OrganisationId == benutzer.OrganisationId
                    && bo.BenutzerRollen.Contains(AuthRoles.ORGA_ADMIN)
                )
            )
            {
                allowed = true;
            }

            if (
                benutzer.BenutzerRollen.Exists(r => r == AuthRoles.BENUTZER)
                && benutzer.BenutzerId == BesitzerId
            )
            {
                allowed = true;
            }

            if (!allowed)
            {
                throw new OperationNotAllowedException("READ_SNIPPET_NOT_ALLOWED");
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
                && Besitzer != null
                && Besitzer.BenutzerOrganisationen.Exists(bo =>
                    bo.OrganisationId == benutzer.OrganisationId
                    && bo.BenutzerRollen.Contains(AuthRoles.ORGA_ADMIN)
                )
            )
            {
                allowed = true;
            }

            if (
                benutzer.BenutzerRollen.Exists(r => r == AuthRoles.BENUTZER)
                && benutzer.BenutzerId == BesitzerId
            )
            {
                allowed = true;
            }

            if (!allowed)
            {
                throw new OperationNotAllowedException("INSERT_SNIPPET_NOT_ALLOWED");
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
                && Besitzer.BenutzerOrganisationen.Exists(bo =>
                    bo.OrganisationId == benutzer.OrganisationId
                    && bo.BenutzerRollen.Contains(AuthRoles.ORGA_ADMIN)
                )
            )
            {
                allowed = true;
            }

            if (
                benutzer.BenutzerRollen.Exists(r => r == AuthRoles.BENUTZER)
                && benutzer.BenutzerId == BesitzerId
            )
            {
                allowed = true;
            }

            if (!allowed)
            {
                throw new OperationNotAllowedException("UPDATE_SNIPPET_NOT_ALLOWED");
            }
        }
    }
}
