using AasDesignerModel.Model;
using AutoMapper;

namespace AasDesignerAasApi.Infrastructure.Queries;

public class AvailableInfastructure
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsReadonly { get; set; } = false;
    public bool IsInternal { get; set; } = false;
    public string AasRepositoryUrl { get; set; } = string.Empty;
    public string SmRepositoryUrl { get; set; } = string.Empty;
    public string AasRegistryUrl { get; set; } = string.Empty;
    public string SmRegistryUrl { get; set; } = string.Empty;
    public string CdRepositoryUrl { get; set; } = string.Empty;

    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<AasInfrastructureSettings, AvailableInfastructure>();
        }
    }
}
