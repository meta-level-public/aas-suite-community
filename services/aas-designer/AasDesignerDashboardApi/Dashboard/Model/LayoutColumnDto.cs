using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AasDesignerModel.Model;
using AutoMapper;

namespace AasDesignerDashboardApi.Dashboard.Model;

public class LayoutColumnDto
{
    public long Id { get; set; }
    public string ContentUrl { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public int Width { get; set; } = 1;
    public string Icon { get; set; } = string.Empty;
    public int RefreshInterval { get; set; } = 0;
    public int Index { get; set; } = 0;
    public string ContentJson { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public string FontColor { get; set; } = string.Empty;
    public long? InfrastructureId { get; set; }
    public DashboardWidgetType Type { get; set; } = DashboardWidgetType.Unknown;

    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<LayoutColumn, LayoutColumnDto>();
        }
    }
}
