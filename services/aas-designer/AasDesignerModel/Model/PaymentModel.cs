using AasDesignerModel.Model;

namespace AasDesignerApi.Model
{
    public class PaymentModel : IMetadata
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string NameLabel { get; set; } = string.Empty;
        public string BeschreibungInternal { get; set; } = string.Empty;
        public string BeschreibungLabel { get; set; } = string.Empty;

        public int AnzahlNutzer { get; set; } = 1;
        public double Preis { get; set; } = 0;

        public bool MehrfachBuchbar { get; set; }

        public bool ExklusivBuchbar { get; set; }
        public bool UserSelectable { get; set; }

        public PaymentPeriod Period { get; set; } = PaymentPeriod.MONTHLY;
        public bool IsSystemModel { get; set; } = false;

        public ICollection<OrganisationPaymentModel>? OrganisationPaymentModels { get; set; } =
            new List<OrganisationPaymentModel>();

        #region Verwaltungsdaten
        public DateTime AnlageDatum { get; set; } = DateTime.Now;
        public string AnlageBenutzer { get; set; } = string.Empty;
        public DateTime AenderungsDatum { get; set; } = DateTime.Now;
        public string AenderungsBenutzer { get; set; } = string.Empty;
        public bool Geloescht { get; set; } = false;
        public int AenderungsZaehler { get; set; } = 0;

        #endregion
    }
}
