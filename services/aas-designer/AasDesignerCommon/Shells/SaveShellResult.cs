using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace AasDesignerCommon.Shells
{
    public class SaveShellResult
    {
        public string AasId { get; set; } = string.Empty;
        public Dictionary<string, string> OldNewFileNames { get; set; } = [];

        [JsonIgnore]
        public AasCore.Aas3_1.Environment? Environment { get; set; }
    }
}
