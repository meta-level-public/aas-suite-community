using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AasDesignerModel.Model;
using AutoMapper;

namespace AasDesignerDashboardApi.Dashboard.Model;

public class LayoutRowDto
{
    public long Id { get; set; }
    public int Index { get; set; } = 0;

    public List<LayoutColumnDto> Columns { get; set; } = [];

    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<LayoutRow, LayoutRowDto>();
        }
    }
}
