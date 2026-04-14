namespace AasDesignerAasApi.Shells.Queries.SearchShells
{
    public class BasyxSearchParams
    {
        public Page Page { get; set; } = new Page();
        public SortBy SortBy { get; set; } = new SortBy();
        public Query Query { get; set; } = new Query();
    }

    public class Query
    {
        public string Path { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public string QueryType { get; set; } = "REGEX"; // oder MATCH
    }

    public class SortBy
    {
        public string Direction { get; set; } = "ASC"; // oder DESC
        public List<string> Path { get; set; } = [];
    }

    public class Page
    {
        public int Index { get; set; } = 0;
        public int Size { get; set; } = 1000;
    }
}
