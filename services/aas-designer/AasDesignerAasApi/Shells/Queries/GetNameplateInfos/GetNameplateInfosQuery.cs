using AasCore.Aas3_1;
using AasDesignerApi.Model;
using AasDesignerModel;
using AasShared.Configuration;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AasDesignerAasApi.Shells.Queries.GetNameplateInfos;

public class GetNameplateInfosQuery : IRequest<NameplateInfosVm>
{
    public AppUser AppUser { get; set; } = null!;
    public string AasIdentifier { get; set; } = string.Empty;
}

public class GetNameplateInfosHandler : IRequestHandler<GetNameplateInfosQuery, NameplateInfosVm>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly AppSettings _appSettings;

    public GetNameplateInfosHandler(
        IApplicationDbContext context,
        IMapper mapper,
        AppSettings appSettings
    )
    {
        _context = context;
        _mapper = mapper;
        _appSettings = appSettings;
    }

    public async Task<NameplateInfosVm> Handle(
        GetNameplateInfosQuery request,
        CancellationToken cancellationToken
    )
    {
        var result = new NameplateInfosVm();
        var orga = await _context
            .Organisations.Where(o => o.Id == request.AppUser.OrganisationId)
            .FirstOrDefaultAsync();

        if (orga == null)
            throw new Exception("Organisation not found");

        var nameplate = await SubmodelMetadataLoader.LoadNameplate(
            request.AppUser.CurrentInfrastructureSettings,
            request.AasIdentifier,
            cancellationToken,
            request.AppUser
        );

        if (nameplate != null)
        {
            result.AasId = request.AasIdentifier;
            result.ProductDesignation = GetProductDesignation(
                nameplate,
                request.AppUser.CurrrentLanguage
            );
            result.ManufacturerName = GetManufacturerName(
                nameplate,
                request.AppUser.CurrrentLanguage
            );
        }

        return result;
    }

    public string GetProductDesignation(Submodel submodel, string lang)
    {
        if (submodel.SubmodelElements == null)
            return string.Empty;
        ISubmodelElement? prop;

        prop = submodel.SubmodelElements.Find(sme =>
            sme.SemanticId?.Keys.Where(k =>
                    k.Value == "0112/2///61987#ABA567#009" || k.Value == "0173-1#02-AAW338#001"
                )
                .Any()
            ?? false
        );

        if (prop != null && prop is MultiLanguageProperty mlProp)
        {
            var res = mlProp.Value?.FirstOrDefault(v => v.Language == lang)?.Text;
            if (res != null)
                return res;
            return mlProp.Value?.FirstOrDefault()?.Text ?? string.Empty;
        }
        return string.Empty;
    }

    public string GetManufacturerName(Submodel submodel, string lang)
    {
        if (submodel.SubmodelElements == null)
            return string.Empty;
        ISubmodelElement? prop;

        prop = submodel.SubmodelElements.Find(sme =>
            sme.SemanticId?.Keys.Where(k =>
                    k.Value == "0112/2///61987#ABA565#009" || k.Value == "0173-1#02-AAO677#002"
                )
                .Any()
            ?? false
        );

        if (prop != null && prop is MultiLanguageProperty mlProp)
        {
            var res = mlProp.Value?.FirstOrDefault(v => v.Language == lang)?.Text;
            if (res != null)
                return res;
            return mlProp.Value?.FirstOrDefault()?.Text ?? string.Empty;
        }
        return string.Empty;
    }
}
