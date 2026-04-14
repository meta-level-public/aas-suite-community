using AasDesignerModel.Model;
using AutoMapper;

namespace AasDesignerAasApi.ProductRoot;

public class ProductRootDto
{
    public long Id { get; set; }
    public string Name { get; set; } = null!;
    public List<MlpKeyValue> MlpKeyValues { get; set; } = new List<MlpKeyValue>();

    public DateTime AnlageDatum { get; set; } = DateTime.Now;
    public DateTime AenderungsDatum { get; set; } = DateTime.Now;

    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<AasDesignerApi.Model.ProductRoot, ProductRootDto>();
        }
    }
}
