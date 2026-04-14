using System.ComponentModel.DataAnnotations.Schema;
using AasDesignerApi.Authorization;
using AasDesignerModel.Model;
using AasShared.Exceptions;
using CsvHelper.Configuration.Attributes;
using Newtonsoft.Json;

namespace AasDesignerApi.Model
{
    public class Adresse : IMetadata, IVerifiable, IMaybeHardDeletable
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public List<MlpKeyValue> NameMlpKeyValues { get; set; } = [];
        public string? Strasse { get; set; }
        public List<MlpKeyValue> StrasseMlpKeyValues { get; set; } = [];
        public string? Plz { get; set; }
        public string? Ort { get; set; }
        public List<MlpKeyValue> OrtMlpKeyValues { get; set; } = [];
        public string? Bundesland { get; set; }
        public List<MlpKeyValue> BundeslandMlpKeyValues { get; set; } = [];
        public string? LaenderCode { get; set; }

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

        [NotMapped]
        [JsonIgnore]
        [Ignore]
        public bool SerializeForBackup { get; set; } = false;

        [NotMapped]
        [JsonIgnore]
        public bool ShouldBeHardDeleted { get; set; } = false;

        public bool ShouldSerializeBesitzer()
        {
            return SerializeForBackup;
        }
        #endregion

        public Adresse() { }

        public Adresse(AasShared.Model.Adresse adresse)
        {
            Bundesland = adresse.Bundesland;
            BundeslandMlpKeyValues = CreateLookupValues(adresse.Bundesland);
            LaenderCode = adresse.LaenderCode;
            Ort = adresse.Ort;
            OrtMlpKeyValues = CreateLookupValues(adresse.Ort);
            Plz = adresse.Plz;
            Strasse = adresse.Strasse;
            StrasseMlpKeyValues = CreateLookupValues(adresse.Strasse);
            Name = adresse.Name;
            NameMlpKeyValues = CreateLookupValues(adresse.Name);
        }

        public bool IsEmpty()
        {
            return string.IsNullOrWhiteSpace(Name)
                && string.IsNullOrWhiteSpace(Strasse)
                && string.IsNullOrWhiteSpace(Plz)
                && string.IsNullOrWhiteSpace(Ort)
                && string.IsNullOrWhiteSpace(LaenderCode)
                && string.IsNullOrWhiteSpace(Bundesland);
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
                throw new OperationNotAllowedException("DELETE_ADDRESS_NOT_ALLOWED");
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
                throw new OperationNotAllowedException("INSERT_ADDRESS_NOT_ALLOWED");
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
                throw new OperationNotAllowedException("READ_ADDRESS_NOT_ALLOWED");
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
                throw new OperationNotAllowedException("UPDATE_ADDRESS_NOT_ALLOWED");
            }
        }

        private static List<MlpKeyValue> CreateLookupValues(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return [];
            }

            return
            [
                new MlpKeyValue { Language = "de", Text = value },
                new MlpKeyValue { Language = "en", Text = value },
            ];
        }
    }
}
