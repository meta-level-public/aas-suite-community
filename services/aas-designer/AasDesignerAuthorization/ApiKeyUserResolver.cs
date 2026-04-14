using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AasDesignerApi.Model;
using AasDesignerModel;
using AasShared.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace AasDesignerAuthorization
{
    public class ApiKeyUserResolver
    {
        private readonly IApplicationDbContext _context;

        public ApiKeyUserResolver(IApplicationDbContext context)
        {
            _context = context;
        }

        public AppUser GetSystemAppUserByApikey(Apikey apikey)
        {
            var benutzer = _context
                .BenutzerOrganisations.Include(bo => bo.Benutzer)
                .Where(b => b.OrganisationId == apikey!.OrganisationId && b.Benutzer.IsSystemUser)
                .Select(bo => bo.Benutzer)
                .First();

            var orga = _context
                .Organisations.Include(O => O.AasInfrastructureSettings)
                .FirstOrDefault(o => o.Id == apikey.OrganisationId);

            if (orga == null)
                throw new AppException("ORGANISATION_NOT_FOUND");

            // TODO: API KEy um infrastruktur ID erweitern

            var infrastructure = orga
                .AasInfrastructureSettings.Where(i => i.IsActive && i.IsInternal)
                .FirstOrDefault();
            if (infrastructure == null)
            {
                infrastructure = orga
                    .AasInfrastructureSettings.Where(i => i.IsActive)
                    .FirstOrDefault();
            }
            if (infrastructure == null)
            {
                throw new AppException("INFRASTRUCTURE_NOT_FOUND");
            }

            return new AppUser(
                benutzer,
                orga,
                [AuthRoles.VIEWER_NUTZER],
                infrastructure,
                "en",
                string.Empty
            );
        }

        public AppUser GetAppUserByApikey(Apikey apikey, long infrastructureId)
        {
            var benutzer = _context
                .BenutzerOrganisations.Include(bo => bo.Benutzer)
                .Where(b =>
                    b.BenutzerId == apikey.BenutzerId && b.OrganisationId == apikey.OrganisationId
                )
                .Select(bo => bo.Benutzer)
                .FirstOrDefault();

            if (benutzer == null)
                benutzer = GetSystemAppUserByApikey(apikey).Benutzer;

            var orga = _context
                .Organisations.Include(O => O.AasInfrastructureSettings)
                .FirstOrDefault(o => o.Id == apikey.OrganisationId);

            if (orga == null)
                throw new AppException("ORGANISATION_NOT_FOUND");

            var infrastructure = orga
                .AasInfrastructureSettings.Where(i =>
                    i.IsActive
                    && i.Id == (apikey.AasInfrastructureSettingsId ?? infrastructureId)
                    && i.OrganisationId == apikey.OrganisationId
                )
                .FirstOrDefault();
            if (infrastructure == null)
            {
                throw new AppException("INFRASTRUCTURE_NOT_FOUND");
            }

            return new AppUser(
                benutzer,
                orga,
                [AuthRoles.VIEWER_NUTZER],
                infrastructure,
                "en",
                string.Empty
            );
        }
    }
}
