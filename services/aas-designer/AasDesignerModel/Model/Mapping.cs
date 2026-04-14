using System.ComponentModel.DataAnnotations.Schema;
using AasDesignerApi.Authorization;
using AasDesignerModel.Model;
using AasShared.Exceptions;
using Newtonsoft.Json;

namespace AasDesignerApi.Model
{
    public class Mapping : IMetadata, IVerifiable, IMaybeHardDeletable
    {
        public long Id { get; set; }
        public long? AasInfrastructureSettingsId { get; set; }
        public AasInfrastructureSettings? AasInfrastructureSettings { get; set; }
        public string MappingJson { get; set; } = string.Empty;
        public string AasIdentifier { get; set; } = string.Empty;
        public string IdShort { get; set; } = string.Empty;
        public string AssetType { get; set; } = string.Empty;

        public long? BesitzerOrgaId { get; set; }

        [JsonIgnore]
        public Organisation? BesitzerOrga { get; set; }

        #region Verwaltungsdaten
        public DateTime AnlageDatum { get; set; } = DateTime.Now;
        public string AnlageBenutzer { get; set; } = string.Empty;
        public DateTime AenderungsDatum { get; set; } = DateTime.Now;
        public string AenderungsBenutzer { get; set; } = string.Empty;
        public bool Geloescht { get; set; } = false;
        public int AenderungsZaehler { get; set; } = 0;

        [NotMapped]
        [JsonIgnore]
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
        #endregion


        public void VerifyDeleteAllowed(AppUser benutzer)
        {
            var allowed = false;

            if (benutzer.BenutzerRollen.Exists(r => r == AuthRoles.SYSTEM_ADMIN))
            {
                allowed = true;
            }

            if (
                (
                    benutzer.BenutzerRollen.Exists(r => r == AuthRoles.ORGA_ADMIN)
                    || benutzer.BenutzerRollen.Exists(r => r == AuthRoles.BENUTZER)
                )
                && benutzer.OrganisationId == BesitzerOrgaId
            )
            {
                allowed = true;
            }

            if (!allowed)
            {
                throw new OperationNotAllowedException("DELETE_Mapping_NOT_ALLOWED");
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
                (
                    benutzer.BenutzerRollen.Exists(r => r == AuthRoles.ORGA_ADMIN)
                    || benutzer.BenutzerRollen.Any(r => r == AuthRoles.BENUTZER)
                )
                && benutzer.OrganisationId == BesitzerOrgaId
            )
            {
                allowed = true;
            }

            if (!allowed)
            {
                throw new OperationNotAllowedException("INSERT_MAPPING_NOT_ALLOWED");
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
                (
                    benutzer.BenutzerRollen.Exists(r => r == AuthRoles.ORGA_ADMIN)
                    || benutzer.BenutzerRollen.Any(r => r == AuthRoles.BENUTZER)
                )
                && benutzer.OrganisationId == BesitzerOrgaId
            )
            {
                allowed = true;
            }

            if (!allowed)
            {
                throw new OperationNotAllowedException("READ_MAPPING_NOT_ALLOWED");
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
                (
                    benutzer.BenutzerRollen.Any(r => r == AuthRoles.ORGA_ADMIN)
                    || benutzer.BenutzerRollen.Any(r => r == AuthRoles.BENUTZER)
                )
                && benutzer.OrganisationId == BesitzerOrgaId
            )
            {
                allowed = true;
            }

            if (!allowed)
            {
                throw new OperationNotAllowedException("UPDATE_MAPPING_NOT_ALLOWED");
            }
        }
    }
}
