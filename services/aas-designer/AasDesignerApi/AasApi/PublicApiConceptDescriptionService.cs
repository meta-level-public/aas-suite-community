using AasDesignerModel;

namespace AasDesignerApi.AasApi
{
    public class PublicApiConceptDescriptionService
    {
        private readonly IApplicationDbContext _context;

        public PublicApiConceptDescriptionService(IApplicationDbContext context)
        {
            _context = context;
        }

        public string GetConceptDescription(string cdIdentifier)
        {
            var mlCd = _context.ConceptDescriptions.FirstOrDefault(cd => cd.CdId == cdIdentifier);

            return mlCd?.ConceptDescriptionPlain ?? string.Empty;
        }
    }
}
