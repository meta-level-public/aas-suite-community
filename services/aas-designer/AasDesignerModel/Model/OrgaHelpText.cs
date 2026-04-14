using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using AasDesignerApi.Authorization;
using AasDesignerModel.Model;
using AasShared.Exceptions;
using CsvHelper.Configuration.Attributes;

namespace AasDesignerApi.Model
{
    public class OrgaHelpText : IHardDeletable, IVerifiable
    {
        public long Id { get; set; }
        public Guid Guid { get; set; } = Guid.NewGuid();
        public long OrganisationId { get; set; }
        public Organisation Organisation { get; set; } = null!;
        public string Tag { get; set; } = string.Empty;
        public string TextDe { get; set; } = string.Empty;
        public string TextEn { get; set; } = string.Empty;
        public GlobalHelpText GlobalHelpText { get; set; } = null!;
        public long GlobalHelpTextId { get; set; }

        public void VerifyDeleteAllowed(AppUser benutzer)
        {
            var allowed = false;

            if (benutzer.BenutzerRollen.Exists(r => r == AuthRoles.SYSTEM_ADMIN))
            {
                allowed = true;
            }

            if (!allowed)
            {
                throw new OperationNotAllowedException("DELETE_HELP_TEXT_NOT_ALLOWED");
            }
        }

        public void VerifyReadAllowed(AppUser benutzer)
        {
            var allowed = false;

            if (
                benutzer.BenutzerRollen.Exists(r => r == AuthRoles.SYSTEM_ADMIN)
                || benutzer.OrganisationId == OrganisationId
            )
            {
                allowed = true;
            }

            if (!allowed)
            {
                throw new OperationNotAllowedException("READ_HELP_TEXT_NOT_ALLOWED");
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
                benutzer.BenutzerRollen.Exists(r => r == AuthRoles.ORGA_HELP_EDITOR)
                && benutzer.OrganisationId == OrganisationId
            )
            {
                allowed = true;
            }

            if (!allowed)
            {
                throw new OperationNotAllowedException("INSERT_HELP_TEXT_NOT_ALLOWED");
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
                benutzer.BenutzerRollen.Exists(r => r == AuthRoles.ORGA_HELP_EDITOR)
                && benutzer.OrganisationId == OrganisationId
            )
            {
                allowed = true;
            }

            if (!allowed)
            {
                throw new OperationNotAllowedException("UPDATE_HELP_TEXT_NOT_ALLOWED");
            }
        }
    }
}
