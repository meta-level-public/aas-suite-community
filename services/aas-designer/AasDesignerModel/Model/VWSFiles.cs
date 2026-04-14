namespace AasDesignerApi.Model
{
    public class VWSFiles
    {
        public string FileName { get; set; } = string.Empty;

        public byte[] FileBlob { get; set; }

        public VWSFiles(string filename, byte[] fileBlob)
        {
            FileName = filename;
            FileBlob = fileBlob;
        }

        public VWSFiles(string filename)
        {
            FileName = filename;
            FileBlob = Array.Empty<byte>();
        }
    }
}
