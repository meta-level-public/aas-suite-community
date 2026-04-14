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
    public ProvidedFileType Type { get; set; }
    public string ContentType { get; set; } = string.Empty;
}

public enum ProvidedFileType
{
    Added,
    Deleted,
    Thumbnail,
}
