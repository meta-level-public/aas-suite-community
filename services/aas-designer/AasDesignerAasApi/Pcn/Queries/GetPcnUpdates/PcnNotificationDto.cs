using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AasDesignerModel.Model;
using AutoMapper;

namespace AasDesignerAasApi.Pcn.Queries.GetPcnUpdates
{
    public class PcnNotificationDto
    {
        public long Id { get; set; }
        public string AasIdentifier { get; set; } = string.Empty;
        public string? AasInfrastructureName { get; set; }
        public long? AasInfrastructureId { get; set; }
        public string Content { get; set; } = string.Empty;

        public class MappingProfile : Profile
        {
            public MappingProfile()
            {
                CreateMap<PcnNotification, PcnNotificationDto>();
            }
        }
    }
}
