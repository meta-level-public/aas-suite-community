using System;
using System.Collections.Generic;
using AasDesignerApi.Model;

namespace AasDesignerModel.Model
{
    public class DashboardLayout : IMetadata, IHardDeletable
    {
        public long Id { get; set; }
        public List<LayoutPage> Pages { get; set; } = [];
        public long BenutzerId { get; set; }
        public Benutzer Benutzer { get; set; } = null!;
        public long OrganisationId { get; set; }
        public Organisation Organisation { get; set; } = null!;

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
