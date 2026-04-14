using AasDesignerApi.Model;
using AasDesignerModel;
using AasShared.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace AasDesignerApi.Service
{
    public class ProductFamilyService
    {
        private readonly IApplicationDbContext _context;

        public ProductFamilyService(IApplicationDbContext context)
        {
            _context = context;
        }

        public ProductFamily Add(AppUser user, ProductFamily productFamily)
        {
            var eintrag = _context.ProductFamilys.FirstOrDefault(a =>
                a.Name == productFamily.Name
                && a.BesitzerId == user.BenutzerId
                && a.BesitzerOrganisationId == user.OrganisationId
                && !a.Geloescht
            );

            if (eintrag == null)
            {
                productFamily.BesitzerId = user.BenutzerId;
                productFamily.BesitzerOrganisationId = user.OrganisationId;
                _context.ProductFamilys.Add(productFamily);
                _context.SaveChanges();

                return productFamily;
            }
            else
            {
                throw new EntryAlreadyExistsException("ENTRY_ALREADY_EXISTS");
            }
        }

        public ProductFamily? GetById(long id)
        {
            return _context
                .ProductFamilys.Include(p => p.Besitzer)
                .FirstOrDefault(p => p.Id == id && !p.Geloescht);
        }

        public List<ProductFamily> GetProductFamilys(AppUser user)
        {
            return _context
                .ProductFamilys.Where(p =>
                    p.Besitzer != null
                    && p.BesitzerOrganisationId == user.OrganisationId
                    && !p.Geloescht
                )
                .ToList();
        }

        public bool Remove(long id)
        {
            bool result = false;

            var eintrag = _context.ProductFamilys.FirstOrDefault(a => a.Id == id);

            if (eintrag != null)
            {
                eintrag.Geloescht = true;
                _context.SaveChanges();
                result = true;
            }
            return result;
        }

        public bool Update(Model.Benutzer user, ProductFamily productFamily)
        {
            bool result = false;

            var eintrag = _context.ProductFamilys.FirstOrDefault(a =>
                a.Id == productFamily.Id && a.BesitzerId == user.Id
            );

            if (eintrag != null && IsProductFamilyNameByUserNotInUse(user, productFamily))
            {
                eintrag.Name = productFamily.Name;
                _context.SaveChanges();
                result = true;
            }
            return result;
        }

        private bool IsProductFamilyNameByUserNotInUse(
            Model.Benutzer user,
            ProductFamily productFamily
        )
        {
            return !_context.ProductFamilys.Any(a =>
                a.BesitzerId == user.Id
                && a.Id != productFamily.Id
                && a.Name == productFamily.Name
                && !a.Geloescht
            );
        }

        public void SaveProductFamily(AppUser user, string productFamily)
        {
            if (
                !_context.ProductFamilys.Any(family =>
                    family.BesitzerId == user.BenutzerId
                    && family.BesitzerOrganisationId == user.OrganisationId
                    && family.Name == productFamily
                    && !family.Geloescht
                )
            )
            {
                var pf = new ProductFamily()
                {
                    Name = productFamily,
                    BesitzerId = user.BenutzerId,
                    BesitzerOrganisationId = user.OrganisationId,
                };

                _context.Add(pf);
                _context.SaveChanges();
            }
        }
    }
}
