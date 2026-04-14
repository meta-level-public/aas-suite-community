using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AasDesignerModel.Model;
using AutoMapper;

namespace AasDesignerDashboardApi.Dashboard.Model;

public class LayoutPageDto
{
    public long Id { get; set; }

    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public int RefreshInterval { get; set; } = 0;
    public int Index { get; set; } = 0;
    public List<LayoutRowDto> Rows { get; set; } = [];

    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<LayoutPage, LayoutPageDto>();
        }
    }
}
