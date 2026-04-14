using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using AasDesignerApi.Authorization;
using AasDesignerModel;
using AasDesignerModel.Model;
using AasShared.Exceptions;
using CsvHelper.Configuration.Attributes;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;

namespace AasDesignerApi.Model
{
    public class Organisation : IMetadata, IVerifiable, IProtokollierbar, IMaybeHardDeletable
    {
        public long Id { get; set; }
        public Guid Guid { get; set; } = Guid.NewGuid();

        public string Name { get; set; } = null!;
        public string? Strasse { get; set; }
        public string? Plz { get; set; }
        public string? Ort { get; set; }
        public string? Bundesland { get; set; }
        public string? LaenderCode { get; set; }
        public string? LogoBase64 { get; set; }

        [Required]
        public string Email { get; set; } = null!;
        public string Telefon { get; set; } = string.Empty;
        public string Fax { get; set; } = string.Empty;
        public bool AccountAktiv { get; set; } = true;

        public long? EclassCertificateId { get; set; }
        public EclassCertificate? EclassCertificate { get; set; }
        public string IriPrefix { get; set; } = string.Empty;

        public ICollection<OrganisationPaymentModel> Bezahlmodelle { get; set; } = [];
        public ICollection<Apikey> Apikeys { get; set; } = new List<Apikey>();

        #region Verwaltungsdaten
        public DateTime AnlageDatum { get; set; } = DateTime.Now;
        public string AnlageBenutzer { get; set; } = string.Empty;
        public DateTime AenderungsDatum { get; set; } = DateTime.Now;
        public string AenderungsBenutzer { get; set; } = string.Empty;
        public bool Geloescht { get; set; } = false;
        public int AenderungsZaehler { get; set; } = 0;
        #endregion

        public string? ThemeUrl { get; set; }
        public string? RegistryUrl { get; set; }
        public string? AasServerUrl { get; set; }
        public bool MaintenanceActive { get; set; } = false;
        public long SystemUserId { get; set; }

        public int MaxHostPort { get; set; } = 0;
        public string InternalAasInfrastructureGuid { get; set; } = string.Empty;

        // Daten für die Ablaufwarnung
        public ExpirationState? ExpirationState { get; set; }
        public DateTime? ExpirationStateDate { get; set; }

        public ICollection<EClassMetadata> OwnedEclassData { get; set; } = [];

        public List<AasInfrastructureSettings> AasInfrastructureSettings { get; set; } = [];

        public void VerifyDeleteAllowed(AppUser benutzer)
        {
            var allowed = false;
            if (benutzer.BenutzerRollen.Exists(r => r == AuthRoles.SYSTEM_ADMIN))
            {
                allowed = true;
            }

            if (
                benutzer.BenutzerRollen.Exists(r => r == AuthRoles.ORGA_ADMIN)
                && Id == benutzer.OrganisationId
            )
            {
                allowed = true;
            }

            if (!allowed)
            {
                throw new OperationNotAllowedException("DELETE_ORGANIZATION_NOT_ALLOWED");
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
                && Id == benutzer.OrganisationId
            )
            {
                allowed = true;
            }

            if (!allowed)
            {
                throw new OperationNotAllowedException("INSERT_ORGANIZATION_NOT_ALLOWED");
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
                    || benutzer.BenutzerRollen.Exists(r => r == AuthRoles.BENUTZER)
                )
                && Id == benutzer.OrganisationId
            )
            {
                allowed = true;
            }

            if (!allowed)
            {
                throw new OperationNotAllowedException("READ_ORGANIZATION_NOT_ALLOWED");
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
                && Id == benutzer.OrganisationId
            )
            {
                allowed = true;
            }

            if (!allowed)
            {
                throw new OperationNotAllowedException("UPDATE_ORGANIZATION_NOT_ALLOWED");
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

        public bool ShouldSerializeBenutzers()
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

        public bool MoreUsersAllowed(IApplicationDbContext context)
        {
            var currentBezahlmodelle = context
                .OrganisationPaymentModels.Include(p => p.PaymentModel)
                .Where(p =>
                    !p.Geloescht
                    && p.OrganisationId == Id
                    && (p.EndDate > DateTime.Now || p.EndDate == null)
                )
                .ToList();

            var hasAnyUnlimited = currentBezahlmodelle.Exists(b =>
                b.PaymentModel.AnzahlNutzer == -1
            );
            var countAllowed = currentBezahlmodelle.Sum(b => b.PaymentModel.AnzahlNutzer);
            var currentUsers = context.BenutzerOrganisations.Count(b =>
                b.OrganisationId == Id
                && b.AccountAktiv
                && b.Benutzer.AccountAktiv
                && !b.Geloescht
                && !b.Benutzer.IsSystemUser
            );

            return countAllowed > currentUsers || hasAnyUnlimited;
        }

        public int GetMaxUsersCount(IApplicationDbContext context)
        {
            var currentBezahlmodelle = context
                .OrganisationPaymentModels.Include(p => p.PaymentModel)
                .Where(p =>
                    !p.Geloescht
                    && p.OrganisationId == Id
                    && (p.EndDate > DateTime.Now || p.EndDate == null)
                )
                .ToList();

            var hasAnyUnlimited = currentBezahlmodelle.Exists(b =>
                b.PaymentModel.AnzahlNutzer == -1
            );
            var countAllowed = currentBezahlmodelle.Sum(b => b.PaymentModel.AnzahlNutzer);

            return hasAnyUnlimited ? -1 : countAllowed;
        }

        public int GetCurrentUsersCount(IApplicationDbContext context)
        {
            return context.BenutzerOrganisations.Count(b =>
                b.OrganisationId == Id
                && b.AccountAktiv
                && b.Benutzer.AccountAktiv
                && !b.Geloescht
                && !b.Benutzer.IsSystemUser
            );
        }

        public bool HasValidPaymentModel(IApplicationDbContext context)
        {
            return context
                    .OrganisationPaymentModels.Include(p => p.PaymentModel)
                    .Where(p =>
                        !p.Geloescht
                        && p.OrganisationId == Id
                        && (p.EndDate > DateTime.Now || p.EndDate == null)
                    )
                    .Count() > 0;
        }

        public List<OrganisationPaymentModel> GetValidPaymentModels(
            IApplicationDbContext context,
            DateTime validationDate
        )
        {
            return context
                .OrganisationPaymentModels.Include(p => p.PaymentModel)
                .Where(p =>
                    !p.Geloescht
                    && p.OrganisationId == Id
                    && (p.EndDate > validationDate || p.EndDate == null)
                )
                .ToList();
        }
    }
}
