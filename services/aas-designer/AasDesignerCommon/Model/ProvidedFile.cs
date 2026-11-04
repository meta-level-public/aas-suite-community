using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Headers;
using System.Threading.Tasks;

namespace AasDesignerCommon.Model;

public class ProvidedFile
{
    public Stream Stream { get; set; } = null!;
    public string Filename { get; set; } = string.Empty;

    /// <summary>
    /// Pfad der Datei im AASX-Paket, z. B. /aasx/files/abc/source.json. Ist er bekannt, wird die
    /// Datei nur den File-Elementen mit genau diesem Wert zugeordnet, nicht allen gleichnamigen.
    /// </summary>
    public string? PackagePath { get; set; }
    public ProvidedFileType Type { get; set; }
    public string ContentType { get; set; } = string.Empty;
}

public enum ProvidedFileType
{
    Added,
    Deleted,
    Thumbnail,
}
