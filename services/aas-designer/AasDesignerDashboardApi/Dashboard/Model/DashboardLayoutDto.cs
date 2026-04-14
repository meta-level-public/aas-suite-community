using AasDesignerApi.Model;
using AasDesignerModel.Model;
using AutoMapper;

namespace AasDesignerDashboardApi.Dashboard.Model;

public class DashboardLayoutDto
{
    public long Id { get; set; }
    public long OrgaId { get; set; }
    public List<LayoutPageDto> Pages { get; set; } = [];

    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<DashboardLayout, DashboardLayoutDto>();
        }
    }
}
