namespace AasDesignerApi.Model.Client
{
    public class PagedResult<T>
    {
        public List<T> Data { get; set; } = new List<T>();
        public int TotalRecords { get; set; } = 0;
    }
}
