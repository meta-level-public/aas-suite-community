using AasDesignerApi.Model;
using AutoMapper;

namespace AasDesignerSharedLinksApi.SharedLinks.Queries.GetMySharedLinks;

public class MySharedLink
{
    public string AasIdentifier { get; set; } = string.Empty;
    public string GeneratedLink { get; set; } = string.Empty;
    public DateTime? ValidUntil { get; set; }
    public bool IsPasswordSecured { get; set; } = false;
    public int NumberOfViews { get; set; } = 0;
    public long Id { get; set; }

    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<SharedLink, MySharedLink>()
                .ForMember(
                    dest => dest.IsPasswordSecured,
                    opt => opt.MapFrom(src => !string.IsNullOrWhiteSpace(src.Passwort))
                )
                .ForMember(dest => dest.NumberOfViews, opt => opt.MapFrom(src => src.CountViews));
        }
    }
}
