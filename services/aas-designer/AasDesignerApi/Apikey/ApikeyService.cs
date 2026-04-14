using AasDesignerModel;

namespace AasDesignerApi.Apikey
{
    public class ApikeyService
    {
        private readonly IApplicationDbContext _context;

        public ApikeyService(IApplicationDbContext context)
        {
            _context = context;
        }

        public Model.Apikey? GetByKey(Guid key)
        {
            return _context.Apikeys.FirstOrDefault(a =>
                a.Key == key && (a.ValidUntil == null || a.ValidUntil >= DateTime.Today)
            );
        }
    }
}
