using System.Globalization;
using AasDesignerApi.Model;
using AasDesignerModel;
using AasShared.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace AasDesignerApi.Invoice
{
    public class InvoiceService
    {
        private readonly IApplicationDbContext _context;

        public InvoiceService(IApplicationDbContext context)
        {
            _context = context;
        }

        public List<OrgaRechnung> Generate(string rechnungsMonatString, Model.Benutzer benutzer)
        {
            var rechnungsmonat = _context.Rechnungsmonate.FirstOrDefault(r =>
                r.RechnungsmonatJahr == rechnungsMonatString
            );
            if (rechnungsmonat != null)
                throw new AppException("RECHNUNGSMONAT_ALREADY_EXISTS");

            rechnungsmonat = new Rechnungsmonat() { RechnungsmonatJahr = rechnungsMonatString };
            var monat = int.Parse(rechnungsMonatString.Split("/")[0]);
            var jahr = int.Parse(rechnungsMonatString.Split("/")[1]);
            _context.Add(rechnungsmonat);

            // über alle Organisationen iterieren
            _context
                .Organisations.Where(o => o.Geloescht != true)
                .ToList()
                .ForEach(o =>
                {
                    var orgaRechnung = new OrgaRechnung
                    {
                        Rechnungsmonat = rechnungsmonat,
                        Organisation = o,
                    };

                    // alle Bezahlmodelle die in dem monat aktiv waren finden
                    var start = new DateTime(jahr, monat, 1, 0, 0, 0);
                    var ende = new DateTime(jahr, monat, 1, 0, 0, 0).AddMonths(1).AddSeconds(-1);
                    var bezahlmodelle = _context
                        .OrganisationPaymentModels.Include(b => b.PaymentModel)
                        .Where(b =>
                            b.OrganisationId == o.Id && b.Geloescht != true
                            || (b.Geloescht == true & b.LoeschDatum > start && b.LoeschDatum < ende)
                        )
                        .ToList();

                    var rechnungszeilen = new List<string>();
                    var summe = 0.0;

                    bezahlmodelle.ForEach(b =>
                    {
                        // wenn Anlagedatum vor start und gelöscht == false, dann ganzer monat
                        if (b.AnlageDatum < start && b.Geloescht != true)
                        {
                            rechnungszeilen.Add(
                                $"{b.PaymentModel.Name}; {start.ToString("dd.MM.yyyy")} - {ende.ToString("dd.MM.yyyy")}; {String.Format(CultureInfo.InvariantCulture, "{0:0.00}", b.PaymentModel.Preis)}"
                            );
                            summe += b.PaymentModel.Preis;
                        }
                        if (b.AnlageDatum < start && b.Geloescht == true && b.LoeschDatum != null)
                        {
                            var anzahlTage = (b.LoeschDatum.Value - start).Days;
                            if (anzahlTage > 0)
                            {
                                var preis = Math.Round((b.PaymentModel.Preis / 30) * anzahlTage, 2);
                                rechnungszeilen.Add(
                                    $"{b.PaymentModel.Name};{start.ToString("dd.MM.yyyy")} - {b.LoeschDatum.Value.ToString("dd.MM.yyyy")} ;{String.Format(CultureInfo.InvariantCulture, "{0:0.00}", preis)}"
                                );
                                summe += preis;
                            }
                        }
                        if (b.AnlageDatum > start && b.Geloescht != true)
                        {
                            // ANlagedatum +1 Tag!!
                            var anzahlTage = (ende - b.AnlageDatum).Days;
                            if (anzahlTage > 0)
                            {
                                var preis = Math.Round((b.PaymentModel.Preis / 30) * anzahlTage, 2);
                                rechnungszeilen.Add(
                                    $"{b.PaymentModel.Name};{b.AnlageDatum.ToString("dd.MM.yyyy")} - {ende.ToString("dd.MM.yyyy")};{String.Format(CultureInfo.InvariantCulture, "{0:0.00}", preis)}"
                                );
                                summe += preis;
                            }
                        }
                        if (b.AnlageDatum > start && b.Geloescht == true && b.LoeschDatum != null)
                        {
                            // ANlagedatum +1 Tag!!
                            var anzahlTage = (b.LoeschDatum.Value - b.AnlageDatum).Days;
                            if (anzahlTage > 0)
                            {
                                var preis = Math.Round((b.PaymentModel.Preis / 30) * anzahlTage, 2);
                                rechnungszeilen.Add(
                                    $"{b.PaymentModel.Name};{b.AnlageDatum.ToString("dd.MM.yyyy")} - {b.LoeschDatum.Value.ToString("dd.mm.yyyy")};{String.Format(CultureInfo.InvariantCulture, "{0:0.00}", preis)}"
                                );
                                summe += preis;
                            }
                        }
                    });

                    orgaRechnung.Daten = String.Join('\n', rechnungszeilen);
                    orgaRechnung.Summe = summe;
                    orgaRechnung.Rechnungsdatum = DateTime.Now;
                    _context.Add(orgaRechnung);
                });

            _context.SaveChanges();

            return _context
                .OrgaRechnungen.Include(i => i.Organisation)
                .Where(or => or.RechnungsmonatId == rechnungsmonat.Id)
                .ToList();
        }

        public List<OrgaRechnung> Load(string rechnungsMonatString, Model.Benutzer benutzer)
        {
            return _context
                .OrgaRechnungen.Include(i => i.Organisation)
                .Where(or => or.Rechnungsmonat.RechnungsmonatJahr == rechnungsMonatString)
                .ToList();
        }
    }
}
