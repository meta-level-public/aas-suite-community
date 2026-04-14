using AasDesignerModel.Model;
using AutoMapper;

namespace AasDesignerAasApi.Pcn
{
    public class PcnInformationDto
    {
        public long Id { get; set; }
        public string AasIdentifier { get; set; } = string.Empty;
        public string BrokerUrl { get; set; } = string.Empty;
        public string Topic { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty; // sollte vielleicht encodiert abgespeichert werden
        public bool IsActive { get; set; }

        public class MappingProfile : Profile
        {
            public MappingProfile()
            {
                CreateMap<PcnListener, PcnInformationDto>();
            }
        }
    }
}
