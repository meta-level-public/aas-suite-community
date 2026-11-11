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

        /// <summary>Never filled: the broker password stays on the server.</summary>
        public string Password { get; set; } = string.Empty;
        public bool IsActive { get; set; }

        public class MappingProfile : Profile
        {
            public MappingProfile()
            {
                CreateMap<PcnListener, PcnInformationDto>()
                    .ForMember(dto => dto.Password, options => options.Ignore());
            }
        }
    }
}
