using System;
using System.Collections.Generic;
using AasDesignerApi.Model;

namespace AasDesignerModel.Model
{
    public class LayoutPage : IMetadata, IHardDeletable
    {
        public long Id { get; set; }

        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Icon { get; set; } = string.Empty;
        public int RefreshInterval { get; set; } = 0;
        public int Index { get; set; } = 0;
        public List<LayoutRow> Rows { get; set; } = [];

        public long DashboardLayoutId { get; set; }
        public DashboardLayout DashboardLayout { get; set; } = null!;

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
