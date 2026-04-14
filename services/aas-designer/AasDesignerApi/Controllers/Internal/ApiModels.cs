using BaSyx.Models.Core.AssetAdministrationShell.Identification;
using Newtonsoft.Json.Linq;

namespace AasDesignerApi.Controllers.Internal
{
    public class ExportOpts
    {
        public long? Id { get; set; }
        public List<long>? Ids { get; set; }
        public string ExportMode { get; set; } = string.Empty;
        public List<ExportIdentifier> ExportContent { get; set; } = new List<ExportIdentifier>();
        public string PublishMode { get; set; } = "NEW";
    }

    public class ExportIdentifier
    {
        public Identifier? Ident { get; set; } = null!;
        public string Parent { get; set; } = string.Empty;
        public string Id { get; set; } = string.Empty;
        public string? V3Ident { get; set; } = string.Empty;
    }

    public class ViewerLogin
    {
        public string? Passwort { get; set; }
        public Guid Guid { get; set; }
    }

    public class PublishResult
    {
        public long Id { get; set; }
        public string RegistryEndpoint { get; set; } = string.Empty;
        public string RepoEndpoint { get; set; } = string.Empty;
        public string AasId { get; set; } = string.Empty;
    }

    public class BulkPublishResult
    {
        public List<long> OkIds { get; set; } = [];
        public List<long> NokIds { get; set; } = [];
        public List<long> AlreadyExistingIds { get; set; } = [];
        public List<string> OkFilenames { get; set; } = [];
        public List<string> NokFilenames { get; set; } = [];
        public List<string> AlreadyExistingFilenames { get; set; } = [];
    }

    public class PagingData
    {
        public int First { get; set; }
        public int Rows { get; set; }
        public string SortField { get; set; } = string.Empty;
        public int SortOrder { get; set; }
        public JObject? Filters { get; set; }
    }

    public class SearchOptions
    {
        public string? AssetKind { get; set; } = string.Empty;
        public string? ArticleNumber { get; set; } = string.Empty;
        public string? ArticleNumberLanguage { get; set; } = string.Empty;
        public long? OrgaId { get; set; }
        public string? SerialNumber { get; set; } = string.Empty;
    }
}
