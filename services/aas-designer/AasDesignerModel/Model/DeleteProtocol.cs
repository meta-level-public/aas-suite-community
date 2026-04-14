using AasDesignerModel.Model;

namespace AasDesignerApi.Model;

public class DeleteProtocol : IMetadata, IHardDeletable
{
    public long Id { get; set; }
    public DeleteType DeleteType { get; set; } = DeleteType.Unknown;
    public string AdditionalData { get; set; } = string.Empty;

    #region Verwaltungsdaten
    public DateTime AnlageDatum { get; set; } = DateTime.Now;
    public string AnlageBenutzer { get; set; } = string.Empty;
    public DateTime AenderungsDatum { get; set; } = DateTime.Now;
    public string AenderungsBenutzer { get; set; } = string.Empty;
    public bool Geloescht { get; set; } = false;
    public int AenderungsZaehler { get; set; } = 0;
    #endregion
}
