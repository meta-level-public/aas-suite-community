using System.Collections.Generic;
using System.Linq;
using AasDesignerApi.Model;
using AasDesignerModel;
using AasDesignerModel.Model;

namespace AasDesignerCommon.Utils
{
    public static class InfrastrukturRechteUtil
    {
        // Grants full access on a newly created infrastructure to all active (non-system) users
        // of the organisation. Changes are tracked only; the caller is responsible for saving.
        public static void GrantAllOrganisationUsers(
            IApplicationDbContext context,
            long organisationId,
            long infrastrukturId
        )
        {
            var userIds = context
                .BenutzerOrganisations.Where(bo =>
                    bo.OrganisationId == organisationId
                    && !bo.Geloescht
                    && !bo.Benutzer.IsSystemUser
                )
                .Select(bo => bo.BenutzerId)
                .Distinct()
                .ToList();

            var existingUserIds = context
                .BenutzerInfrastrukturRechte.Where(r =>
                    r.OrganisationId == organisationId
                    && r.InfrastrukturId == infrastrukturId
                    && !r.Geloescht
                )
                .Select(r => r.BenutzerId)
                .ToList();

            foreach (var userId in userIds.Except(existingUserIds))
            {
                context.BenutzerInfrastrukturRechte.Add(
                    new BenutzerInfrastrukturRecht
                    {
                        BenutzerId = userId,
                        OrganisationId = organisationId,
                        InfrastrukturId = infrastrukturId,
                        DarfLesen = true,
                        DarfSchreiben = true,
                        DarfMarktPublizieren = true,
                        AnlageBenutzer = "system",
                    }
                );
            }
        }

        // Gives a member rights on the internal infrastructure of the organisation if there are
        // none yet: read for everybody, write and market publishing for organisation admins.
        // Covers users who join after the infrastructure was created (e.g. first SSO login).
        // Existing rights stay untouched, also when an admin restricted them deliberately.
        // Changes are tracked only; the caller is responsible for saving.
        public static void GrantMissingInternalInfrastructureRights(
            IApplicationDbContext context,
            long benutzerId,
            long organisationId,
            IReadOnlyCollection<string> rollen
        )
        {
            var internalInfrastructureIds = context
                .AasInfrastructureSettings.Where(i =>
                    i.OrganisationId == organisationId
                    && i.IsActive
                    && !i.Geloescht
                    && (i.IsInternal || i.HandleAsInternal || i.Name == "Internal Infrastructure")
                )
                .Select(i => i.Id)
                .ToList();

            var withRights = context
                .BenutzerInfrastrukturRechte.Where(r =>
                    r.BenutzerId == benutzerId && r.OrganisationId == organisationId && !r.Geloescht
                )
                .Select(r => r.InfrastrukturId)
                .ToList();

            var isOrgaAdmin = rollen.Contains(AuthRoles.ORGA_ADMIN);
            foreach (var infrastrukturId in internalInfrastructureIds.Except(withRights))
            {
                context.BenutzerInfrastrukturRechte.Add(
                    new BenutzerInfrastrukturRecht
                    {
                        BenutzerId = benutzerId,
                        OrganisationId = organisationId,
                        InfrastrukturId = infrastrukturId,
                        DarfLesen = true,
                        DarfSchreiben = isOrgaAdmin,
                        DarfMarktPublizieren = isOrgaAdmin,
                        AnlageBenutzer = "system",
                    }
                );
            }
        }
    }
}
