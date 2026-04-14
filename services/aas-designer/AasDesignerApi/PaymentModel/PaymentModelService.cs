using AasDesignerModel;

namespace AasDesignerApi.PaymentModel
{
    public class PaymentModelService
    {
        private readonly IApplicationDbContext _context;

        public PaymentModelService(IApplicationDbContext context)
        {
            _context = context;
        }

        public List<Model.PaymentModel> GetAll()
        {
            return _context.PaymentModels.Where(p => !p.Geloescht).ToList();
        }

        public List<Model.PaymentModel> GetAllUserSelectable()
        {
            return _context.PaymentModels.Where(p => !p.Geloescht && p.UserSelectable).ToList();
        }

        public Model.PaymentModel Add(Model.PaymentModel paymentModel)
        {
            _context.Add(paymentModel);
            _context.SaveChanges();

            return paymentModel;
        }

        public Model.PaymentModel GetById(long id)
        {
            return _context.PaymentModels.First(p => p.Id == id);
        }

        public bool Remove(long id)
        {
            var paymentModel = GetById(id);
            _context.Remove(paymentModel);
            _context.SaveChanges();

            return true;
        }

        public bool Update(Model.PaymentModel paymentModel)
        {
            var dbModel = GetById(paymentModel.Id);

            dbModel.AnzahlNutzer = paymentModel.AnzahlNutzer;
            dbModel.BeschreibungInternal = paymentModel.BeschreibungInternal;
            dbModel.BeschreibungLabel = paymentModel.BeschreibungLabel;
            dbModel.Name = paymentModel.Name;
            dbModel.NameLabel = paymentModel.NameLabel;
            dbModel.Preis = paymentModel.Preis;
            dbModel.ExklusivBuchbar = paymentModel.ExklusivBuchbar;
            dbModel.MehrfachBuchbar = paymentModel.MehrfachBuchbar;
            dbModel.UserSelectable = paymentModel.UserSelectable;

            _context.SaveChanges();

            return true;
        }
    }
}
