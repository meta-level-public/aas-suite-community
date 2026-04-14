using System.ComponentModel.DataAnnotations.Schema;
using AasDesignerApi.Authorization;
using AasShared.Exceptions;

namespace AasDesignerApi.Model
{
    public class SubmodelTemplate : IMetadata, IVerifiable
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Label { get; set; } = string.Empty;
        public string Filename { get; set; } = string.Empty;
        public string SemanticIds { get; set; } = string.Empty;
        public string SubmodelVersion { get; set; } = string.Empty;

        public long? OrganisationId { get; set; }
        public Organisation? Organisation { get; set; }

        public bool DefaultInNew { get; set; } = false; // damit können wir leichter die "leeren" Schalen konfigurieren
        public bool UsedAsCollection { get; set; } = false; // damit können wir dinge wie ContactInformation als ELement nutzbar machen
        public bool Deprecated { get; set; } = false; // Veraltet
        public string Notiz { get; set; } = string.Empty;
        public string IdtaGitFolderPath { get; set; } = string.Empty;
        public AasMetamodelVersion Version { get; set; } = AasMetamodelVersion.UNKNOWN;
        public string Group { get; set; } = "IDTA";

        [NotMapped]
        public string Url { get; set; } = string.Empty; // URL zum Template, wenn es in einem Repo liegt, sonst leer

        [NotMapped]
        public string TemplateId { get; set; } = string.Empty;

        [NotMapped]
        public string SourceAasIdShort { get; set; } = string.Empty;

        #region Verwaltungsdaten
        public DateTime AnlageDatum { get; set; } = DateTime.Now;
        public string AnlageBenutzer { get; set; } = string.Empty;
        public DateTime AenderungsDatum { get; set; } = DateTime.Now;
        public string AenderungsBenutzer { get; set; } = string.Empty;
        public bool Geloescht { get; set; } = false;
        public int AenderungsZaehler { get; set; } = 0;
        #endregion

        public SubmodelTemplate() { }

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
                throw new OperationNotAllowedException("DELETE_SUBMODEL_TEMPLATE_NOT_ALLOWED");
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
                throw new OperationNotAllowedException("INSERT_SUBMODEL_TEMPLATE_NOT_ALLOWED");
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

            if (!allowed)
            {
                throw new OperationNotAllowedException("READ_SUBMODEL_TEMPLATE_NOT_ALLOWED");
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

            if (!allowed)
            {
                throw new OperationNotAllowedException("UPDATE_SUBMODEL_TEMPLATE_NOT_ALLOWED");
            }
        }
    }
}
