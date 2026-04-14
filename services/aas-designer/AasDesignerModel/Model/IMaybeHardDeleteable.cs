namespace AasDesignerApi.Model
{
    public interface IMaybeHardDeletable
    {
        public bool ShouldBeHardDeleted { get; set; }
    }
}
