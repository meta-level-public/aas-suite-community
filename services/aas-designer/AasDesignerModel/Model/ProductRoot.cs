using System.ComponentModel.DataAnnotations.Schema;
using AasDesignerApi.Authorization;
using AasDesignerModel.Model;
using AasShared.Exceptions;
using CsvHelper.Configuration.Attributes;
using Newtonsoft.Json;

namespace AasDesignerApi.Model
{
    public class ProductRoot : IMetadata, IVerifiable, IHardDeletable
    {
        public long? Id { get; set; }
        public string Name { get; set; } = null!;
        public List<MlpKeyValue> MlpKeyValues { get; set; } = null!;

        public long? BesitzerId { get; set; }

        [JsonIgnore]
        public Benutzer? Besitzer { get; set; }
        public long? BesitzerOrganisationId { get; set; }

        [JsonIgnore]
        public Organisation? BesitzerOrganisation { get; set; }

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

        public void VerifyDeleteAllowed(AppUser benutzer)
        {
            var allowed = false;
            if (benutzer.BenutzerRollen.Exists(r => r == AuthRoles.SYSTEM_ADMIN))
            {
                allowed = true;
            }

            if (
                benutzer.BenutzerRollen.Exists(r => r == AuthRoles.BENUTZER)
                && (
                    benutzer.OrganisationId == BesitzerOrganisationId
                    || benutzer.BenutzerId == BesitzerId
                )
            )
            {
                allowed = true;
            }

            if (!allowed)
            {
                throw new OperationNotAllowedException("DELETE_PRODUCT_ROOT_NOT_ALLOWED");
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
                benutzer.BenutzerRollen.Exists(r => r == AuthRoles.BENUTZER)
                && (
                    benutzer.OrganisationId == BesitzerOrganisationId
                    || benutzer.BenutzerId == BesitzerId
                )
            )
            {
                allowed = true;
            }

            if (!allowed)
            {
                throw new OperationNotAllowedException("INSERT_PRODUCT_ROOT_NOT_ALLOWED");
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
                benutzer.BenutzerRollen.Exists(r => r == AuthRoles.BENUTZER)
                && (
                    benutzer.OrganisationId == BesitzerOrganisationId
                    || benutzer.BenutzerId == BesitzerId
                )
            )
            {
                allowed = true;
            }

            if (!allowed)
            {
                throw new OperationNotAllowedException("READ_PRODUCT_ROOT_NOT_ALLOWED");
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
                benutzer.BenutzerRollen.Exists(r => r == AuthRoles.BENUTZER)
                && (
                    benutzer.OrganisationId == BesitzerOrganisationId
                    || benutzer.BenutzerId == BesitzerId
                )
            )
            {
                allowed = true;
            }

            if (!allowed)
            {
                throw new OperationNotAllowedException("UPDATE_PRODUCT_ROOT_NOT_ALLOWED");
            }
        }
    }
}
