namespace AasDesignerModel.Model
{
    public class EClassDescribedBy
    {
        public long? Id { get; set; }
        public string PreferredNameBlockAspect { get; set; } = string.Empty;
        public string Irdi { get; set; } = string.Empty;
        public bool IsDeprecated { get; set; }

        public int OrderNumber { get; set; }
    }
}
