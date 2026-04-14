using AasCore.Aas3_1;
using AutoMapper;

namespace AasDesignerAasApi.Shells.Queries;

public class ShellListDto
{
    public string Id { get; set; } = string.Empty;
    public string GlobalAssetId { get; set; } = string.Empty;
    public string IdShort { get; set; } = string.Empty;
    public AssetKind AssetKind { get; set; }
    public string ThumbnailPath { get; set; } = string.Empty;

    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<AssetAdministrationShell, ShellListDto>()
                .ForMember(
                    dest => dest.GlobalAssetId,
                    opt => opt.MapFrom(src => src.AssetInformation.GlobalAssetId)
                )
                .ForMember(
                    dest => dest.AssetKind,
                    opt => opt.MapFrom(src => src.AssetInformation.AssetKind)
                )
                .ForMember(
                    dest => dest.ThumbnailPath,
                    opt =>
                        opt.MapFrom(src =>
                            src.AssetInformation.DefaultThumbnail != null
                                ? src.AssetInformation.DefaultThumbnail.Path
                                : string.Empty
                        )
                );
        }
    }
}
