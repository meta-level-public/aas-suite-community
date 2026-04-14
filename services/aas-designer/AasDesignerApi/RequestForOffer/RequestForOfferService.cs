using AasDesignerModel;
using Microsoft.EntityFrameworkCore;

namespace VwsPortalApi.RequestForOffer
{
    public class RequestForOfferService
    {
        private readonly IApplicationDbContext _context;

        public RequestForOfferService(IApplicationDbContext context)
        {
            _context = context;
        }

        public List<AasDesignerApi.Model.RequestForOffer> GetAll()
        {
            return _context.RequestForOffers.Include(o => o.Organisation).ToList();
        }

        public bool DeleteRequest(long id)
        {
            var request = _context.RequestForOffers.FirstOrDefault(c => c.Id == id);
            if (request != null)
            {
                _context.RequestForOffers.Remove(request);
                _context.SaveChanges();
            }

            return true;
        }
    }
}
