namespace AasDesignerModel.Model
{
    public class EClassImportQueueItem
    {
        public long? Id { get; set; }
        public long BenutzerId { get; set; }
        public long OrganisationId { get; set; }
        public byte[]? ImportFile { get; set; }

        public DateTime DateImport { get; set; }
        public bool Started { get; set; }
        public DateTime? DateStarted { get; set; } = null;
        public bool Error { get; set; }
        public DateTime? DateError { get; set; } = null;
        public string ErrorMessage { get; set; } = string.Empty;

        public int CountFilesProcessed { get; set; } = 0;
        public int CountFiles { get; set; } = 0;
    }
}
