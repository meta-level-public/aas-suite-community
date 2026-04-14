namespace AasDesignerApi.Model.Client
{
    public class VwsZipFile
    {
        public string Name { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public long Size { get; set; }

        public bool IsDirectory { get; set; }
        public DateTimeOffset LastWriteTime { get; internal set; }
        public string Path { get; set; } = string.Empty;
        public string Folder { get; set; } = string.Empty;
    }
}
