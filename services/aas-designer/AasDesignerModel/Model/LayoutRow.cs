using System;
using System.Collections.Generic;
using AasDesignerApi.Model;

namespace AasDesignerModel.Model
{
    public class LayoutRow : IMetadata, IHardDeletable
    {
        public long Id { get; set; }
        public List<LayoutColumn> Columns { get; set; } = [];
        public int Index { get; set; } = 0;

        public long LayoutPageId { get; set; }
        public LayoutPage LayoutPage { get; set; } = null!;

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
