using System.Linq;
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
    }
}
