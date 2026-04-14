using AasDesignerApi.Model;
using AasDesignerModel;
using AasShared.Exceptions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Primitives;

namespace AasDesignerApi.Service
{
    public class SnippetService
    {
        private readonly IApplicationDbContext _context;

        public SnippetService(IApplicationDbContext context)
        {
            _context = context;
        }

        public bool Save(IFormCollection data, AppUser user)
        {
            bool result = false;
            var templateData = data["templateData"].ToString();
            var templateName = data["templateName"].ToString();
            var templateDesccription = data["templateDescription"].ToString();
            var templateTyp = data["templateTyp"].ToString();
            var version = AasMetamodelVersion.V2;
            if (data.ContainsKey("version"))
            {
                version = (AasMetamodelVersion)
                    Enum.Parse(typeof(AasMetamodelVersion), data["version"].ToString());
            }

            if (!StringValues.IsNullOrEmpty(templateData))
            {
                Snippet snippet = new()
                {
                    Name = templateName,
                    Template = templateData,
                    Description = templateDesccription,
                    Typ = templateTyp,
                    Besitzer = user.Benutzer,
                    BesitzerOrganisation = user.Organisation,
                    Version = version,
                };

                _context.Snippets.Add(snippet);

                _context.SaveChanges();

                result = true;
            }

            return result;
        }

        public Snippet? GetById(long id)
        {
            return _context
                .Snippets.Include(s => s.Besitzer)
                .Where(s => s.Id == id)
                .FirstOrDefault();
        }

        public List<Snippet> GetSnippetsByOrganisation(AppUser user, AasMetamodelVersion version)
        {
            return _context
                .Snippets.Where(s =>
                    s.FreigabeLevel == FreigabeLevel.PRIVATE
                        && s.BesitzerId == user.BenutzerId
                        && !s.Geloescht
                        && (version == AasMetamodelVersion.ALL || s.Version == version)
                    || s.FreigabeLevel == FreigabeLevel.ORGANISATION
                        && s.Besitzer != null
                        && s.BesitzerOrganisationId == user.OrganisationId
                        && !s.Geloescht
                        && (version == AasMetamodelVersion.ALL || s.Version == version)
                )
                .OrderByDescending(p => p.AenderungsDatum)
                .ToList();
        }

        public bool DeleteById(long id)
        {
            bool result = false;
            var snippet = _context.Snippets.Find(id);

            if (snippet != null)
            {
                _context.Snippets.Remove(snippet);
                _context.SaveChanges();

                result = true;
            }
            return result;
        }

        public bool Unshare(Model.Benutzer user, int id)
        {
            var paket = _context.Snippets.First(p => p.Id == id);
            if (paket.BesitzerId != user.Id)
                throw new OperationNotAllowedException("UNSHARE_NOT_OWN_DISALLOWED");

            paket.FreigabeLevel = FreigabeLevel.PRIVATE;
            _context.SaveChanges();

            return true;
        }

        public bool Share(Model.Benutzer user, int id)
        {
            var paket = _context.Snippets.First(p => p.Id == id);
            if (paket.BesitzerId != user.Id)
                throw new OperationNotAllowedException("SHARE_NOT_OWN_DISALLOWED");

            paket.FreigabeLevel = FreigabeLevel.ORGANISATION;
            _context.SaveChanges();

            return true;
        }
    }
}
