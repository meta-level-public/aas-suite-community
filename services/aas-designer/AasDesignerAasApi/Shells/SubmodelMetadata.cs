using AasCore.Aas3_1;

namespace AasDesignerAasApi.Shells
{
    public class SemanticId
    {
        public List<Key> Keys { get; set; } = [];
        public string Type { get; set; } = string.Empty;
    }

    public class Description
    {
        public string Language { get; set; } = string.Empty;
        public string Text { get; set; } = string.Empty;
    }

    public class SubmodelMetadata
    {
        public string ModelType { get; set; } = string.Empty;
        public string Kind { get; set; } = string.Empty;
        public SemanticId SemanticId { get; set; } = new();
        public object? Administration { get; set; }
        public string Id { get; set; } = string.Empty;
        public List<Description> Description { get; set; } = [];
        public string IdShort { get; set; } = string.Empty;
    }
}
