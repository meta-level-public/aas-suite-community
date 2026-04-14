using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AasDesignerAasApi.Settings.Queries.GetViewerSettings
{
    public class ViewerSettingsDto
    {
        public required string ViewerAppUrl { get; set; } = string.Empty;
        public string SmRepoUrl { get; internal set; } = string.Empty;
        public string AasRepoUrl { get; internal set; } = string.Empty;
        public string AasRegistryUrl { get; internal set; } = string.Empty;
        public string SmRegistryUrl { get; internal set; } = string.Empty;
        public string CdRepoUrl { get; internal set; } = string.Empty;
        public string DiscoveryUrl { get; internal set; } = string.Empty;

        public string PersonalAccessToken { get; set; } = string.Empty;
    }
}
