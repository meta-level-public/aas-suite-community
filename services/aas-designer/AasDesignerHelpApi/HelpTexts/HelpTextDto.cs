using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AasDesignerHelpApi.HelpTexts.Queries;

public class HelpTextDto
{
    public string Tag { get; set; } = string.Empty;
    public string GlobalTextDe { get; set; } = string.Empty;
    public string GlobalTextEn { get; set; } = string.Empty;
    public long IdGlobal { get; set; }

    public string OrgaTextDe { get; set; } = string.Empty;
    public string OrgaTextEn { get; set; } = string.Empty;
    public long IdOrga { get; set; }
}
