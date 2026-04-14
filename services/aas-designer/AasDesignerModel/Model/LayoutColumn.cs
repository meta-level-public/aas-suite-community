using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AasDesignerApi.Model;

namespace AasDesignerModel.Model
{
    public class LayoutColumn : IMetadata, IHardDeletable
    {
        public long Id { get; set; }
        public string ContentUrl { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public int Width { get; set; } = 1;
        public string Icon { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
        public string FontColor { get; set; } = string.Empty;
        public int RefreshInterval { get; set; } = 0;
        public int Index { get; set; } = 0;
        public long? InfrastructureId { get; set; }

        public DashboardWidgetType Type { get; set; } = DashboardWidgetType.Unknown;
        public string ContentJson { get; set; } = string.Empty;

        public long LayoutRowId { get; set; }
        public LayoutRow LayoutRow { get; set; } = null!;

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
