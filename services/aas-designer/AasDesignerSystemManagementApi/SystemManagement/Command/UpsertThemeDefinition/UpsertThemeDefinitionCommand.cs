using AasDesignerModel;
using AasDesignerSystemManagementApi.SystemManagement.Model;
using AasDesignerSystemManagementApi.SystemManagement.ThemeConfiguration;
using MediatR;

namespace AasDesignerSystemManagementApi.SystemManagement.Command.UpsertThemeDefinition;

public class UpsertThemeDefinitionCommand : IRequest<ThemeDefinitionDto>
{
    public ThemeDefinitionDto Theme { get; set; } = new();
}

public class UpsertThemeDefinitionHandler
    : IRequestHandler<UpsertThemeDefinitionCommand, ThemeDefinitionDto>
{
    private readonly IApplicationDbContext _context;

    public UpsertThemeDefinitionHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ThemeDefinitionDto> Handle(
        UpsertThemeDefinitionCommand request,
        CancellationToken cancellationToken
    )
    {
        var normalizedKey = ThemeDefinitionStore.NormalizeKey(request.Theme.Key);
        if (
            !ThemeDefinitionStore.IsValidCustomKey(normalizedKey)
            && !ThemeDefinitionStore.IsBuiltIn(normalizedKey)
        )
        {
            throw new InvalidOperationException("INVALID_THEME_KEY");
        }

        if (ThemeDefinitionStore.IsBuiltIn(normalizedKey))
        {
            throw new InvalidOperationException("BUILT_IN_THEME_READ_ONLY");
        }

        var current = await ThemeDefinitionStore.LoadAsync(_context, cancellationToken);
        var existing = current.FirstOrDefault(t => t.Key == normalizedKey);
        if (existing == null)
        {
            existing = new ThemeDefinitionDto { Key = normalizedKey, IsBuiltIn = false };
            current.Add(existing);
        }

        existing.DisplayName = string.IsNullOrWhiteSpace(request.Theme.DisplayName)
            ? normalizedKey
            : request.Theme.DisplayName.Trim();
        existing.CustomCss = request.Theme.CustomCss ?? string.Empty;
        existing.DarkCustomCss = request.Theme.DarkCustomCss ?? string.Empty;
        existing.CustomerLogoUrl = request.Theme.CustomerLogoUrl ?? string.Empty;
        existing.BackgroundImageUrl = request.Theme.BackgroundImageUrl ?? string.Empty;
        existing.DarkBackgroundImageUrl = request.Theme.DarkBackgroundImageUrl ?? string.Empty;
        existing.BackgroundColor = request.Theme.BackgroundColor ?? string.Empty;
        existing.DarkBackgroundColor = request.Theme.DarkBackgroundColor ?? string.Empty;
        existing.BackgroundMode = string.IsNullOrWhiteSpace(request.Theme.BackgroundMode)
            ? "image"
            : request.Theme.BackgroundMode.Trim();
        existing.DarkBackgroundMode = string.IsNullOrWhiteSpace(request.Theme.DarkBackgroundMode)
            ? "image"
            : request.Theme.DarkBackgroundMode.Trim();
        existing.FontFamily = request.Theme.FontFamily ?? string.Empty;
        existing.DarkFontFamily = request.Theme.DarkFontFamily ?? string.Empty;
        existing.BaseFontSize = request.Theme.BaseFontSize ?? string.Empty;
        existing.DarkBaseFontSize = request.Theme.DarkBaseFontSize ?? string.Empty;
        existing.PrimaryColor = request.Theme.PrimaryColor ?? string.Empty;
        existing.DarkPrimaryColor = request.Theme.DarkPrimaryColor ?? string.Empty;
        existing.HighlightColor = request.Theme.HighlightColor ?? string.Empty;
        existing.DarkHighlightColor = request.Theme.DarkHighlightColor ?? string.Empty;
        existing.HighlightTextColor = request.Theme.HighlightTextColor ?? string.Empty;
        existing.DarkHighlightTextColor = request.Theme.DarkHighlightTextColor ?? string.Empty;
        existing.PrimaryHoverColor = request.Theme.PrimaryHoverColor ?? string.Empty;
        existing.DarkPrimaryHoverColor = request.Theme.DarkPrimaryHoverColor ?? string.Empty;
        existing.SurfaceColor = request.Theme.SurfaceColor ?? string.Empty;
        existing.DarkSurfaceColor = request.Theme.DarkSurfaceColor ?? string.Empty;
        existing.TextColor = request.Theme.TextColor ?? string.Empty;
        existing.DarkTextColor = request.Theme.DarkTextColor ?? string.Empty;
        existing.InputTextColor = request.Theme.InputTextColor ?? string.Empty;
        existing.DarkInputTextColor = request.Theme.DarkInputTextColor ?? string.Empty;
        existing.PrimaryOpacity = request.Theme.PrimaryOpacity ?? string.Empty;
        existing.DarkPrimaryOpacity = request.Theme.DarkPrimaryOpacity ?? string.Empty;
        existing.SurfaceOpacity = request.Theme.SurfaceOpacity ?? string.Empty;
        existing.DarkSurfaceOpacity = request.Theme.DarkSurfaceOpacity ?? string.Empty;
        existing.TextOpacity = request.Theme.TextOpacity ?? string.Empty;
        existing.DarkTextOpacity = request.Theme.DarkTextOpacity ?? string.Empty;
        existing.BorderRadius = request.Theme.BorderRadius ?? string.Empty;
        existing.DarkBorderRadius = request.Theme.DarkBorderRadius ?? string.Empty;
        existing.DarkInheritFromLight = request.Theme.DarkInheritFromLight;
        existing.BaseTheme = ThemeDefinitionStore.NormalizeBaseTheme(request.Theme.BaseTheme);

        await ThemeDefinitionStore.SaveAsync(_context, current, cancellationToken);

        return existing;
    }
}
