using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;

namespace AasDesignerApi.Orga
{
    public class OrgaTokenDto
    {
        public long Id { get; set; }
        public Guid Key { get; set; } = Guid.Empty;
        public DateTime? ValidUntil { get; set; }
        public bool Active { get; set; }
        public string Notice { get; set; } = string.Empty;

        public string AasInfrastructureName { get; set; } = string.Empty;
        public long? AasInfrastructureId { get; set; }

        public List<string> Scopes { get; set; } = [];

        public class MappingProfile : Profile
        {
            public MappingProfile()
            {
                CreateMap<Model.Apikey, OrgaTokenDto>();
            }
        }
    }
}
