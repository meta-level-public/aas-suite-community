using System.Text.Json;
using System.Text.RegularExpressions;
using AasDesignerApi.Model;
using AasDesignerModel;
using AasDesignerSystemManagementApi.SystemManagement.Model;
using Microsoft.EntityFrameworkCore;

namespace AasDesignerSystemManagementApi.SystemManagement.ThemeConfiguration;

public static class ThemeDefinitionStore
{
    public const string SettingName = "DesignerThemeDefinitionsV1";

    private static readonly Regex ThemeKeyRegex = new("^[a-z0-9-]+$", RegexOptions.Compiled);
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    private static readonly ThemeDefinitionDto[] BuiltInThemes =
    [
        new ThemeDefinitionDto
        {
            Key = "ml",
            DisplayName = "AAS Suite (ML)",
            BaseTheme = "ml",
            IsBuiltIn = true,
        },
        new ThemeDefinitionDto
        {
            Key = "cobalt",
            DisplayName = "AAS Suite (Cobalt)",
            BaseTheme = "cobalt",
            IsBuiltIn = true,
        },
        new ThemeDefinitionDto
        {
            Key = "evergreen",
            DisplayName = "AAS Suite (Evergreen)",
            BaseTheme = "evergreen",
            IsBuiltIn = true,
        },
        new ThemeDefinitionDto
        {
            Key = "amber",
            DisplayName = "AAS Suite (Amber)",
            BaseTheme = "amber",
            IsBuiltIn = true,
        },
    ];

    public static bool IsBuiltIn(string key)
    {
        var normalizedKey = NormalizeKey(key);
        return BuiltInThemes.Any(t => t.Key == normalizedKey);
    }

    public static bool IsSupportedBaseTheme(string key)
    {
        var normalizedKey = NormalizeKey(key);
        return BuiltInThemes.Any(t => t.Key == normalizedKey);
    }

    public static string NormalizeKey(string key)
    {
        return (key ?? string.Empty).Trim().ToLowerInvariant();
    }

    public static bool IsValidCustomKey(string key)
    {
        var normalizedKey = NormalizeKey(key);
        return normalizedKey != string.Empty
            && normalizedKey != "default"
            && !IsBuiltIn(normalizedKey)
            && ThemeKeyRegex.IsMatch(normalizedKey);
    }

    public static async Task<List<ThemeDefinitionDto>> LoadAsync(
        IApplicationDbContext context,
        CancellationToken cancellationToken
    )
    {
        var stored = await context
            .PersistentSettings.AsNoTracking()
            .Where(s => s.Name == SettingName)
            .Select(s => s.Value)
            .FirstOrDefaultAsync(cancellationToken);

        var storedThemes = Deserialize(stored);
        var normalizedCustomEntries = NormalizeCustomEntries(storedThemes);

        if (!string.IsNullOrWhiteSpace(stored))
        {
            var normalizedJson = JsonSerializer.Serialize(normalizedCustomEntries);
            if (!string.Equals(stored, normalizedJson, StringComparison.Ordinal))
            {
                await SaveAsync(context, normalizedCustomEntries, cancellationToken);
            }
        }

        return MergeWithBuiltIn(normalizedCustomEntries);
    }

    public static async Task SaveAsync(
        IApplicationDbContext context,
        IEnumerable<ThemeDefinitionDto> definitions,
        CancellationToken cancellationToken
    )
    {
        var normalizedCustomEntries = NormalizeCustomEntries(definitions.ToList());
        var json = JsonSerializer.Serialize(normalizedCustomEntries);

        var setting = await context.PersistentSettings.FirstOrDefaultAsync(
            s => s.Name == SettingName,
            cancellationToken
        );

        if (setting == null)
        {
            setting = new PersistentSetting { Name = SettingName, Value = json };
            context.PersistentSettings.Add(setting);
        }
        else
        {
            setting.Value = json;
            context.PersistentSettings.Update(setting);
        }

        await context.SaveChangesAsync(cancellationToken);
    }

    private static List<ThemeDefinitionDto> Deserialize(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
        {
            return [];
        }

        try
        {
            return JsonSerializer.Deserialize<List<ThemeDefinitionDto>>(json, JsonOptions) ?? [];
        }
        catch
        {
            return [];
        }
    }

    private static List<ThemeDefinitionDto> MergeWithBuiltIn(List<ThemeDefinitionDto> input)
    {
        var ordered = BuiltInThemes.Select(Clone).ToList();
        ordered.AddRange(NormalizeCustomEntries(input));
        return ordered;
    }

    private static List<ThemeDefinitionDto> NormalizeCustomEntries(List<ThemeDefinitionDto> input)
    {
        var customEntries = new List<ThemeDefinitionDto>();

        foreach (var entry in input)
        {
            var normalizedKey = NormalizeKey(entry.Key);
            if (normalizedKey == string.Empty || normalizedKey == "default")
            {
                continue;
            }

            if (IsBuiltIn(normalizedKey))
            {
                continue;
            }

            if (!IsValidCustomKey(normalizedKey))
            {
                continue;
            }

            var baseTheme = NormalizeBaseTheme(entry.BaseTheme);
            customEntries.Add(
                new ThemeDefinitionDto
                {
                    Key = normalizedKey,
                    DisplayName = string.IsNullOrWhiteSpace(entry.DisplayName)
                        ? normalizedKey
                        : entry.DisplayName.Trim(),
                    BaseTheme = baseTheme,
                    CustomCss = entry.CustomCss ?? string.Empty,
                    DarkCustomCss = entry.DarkCustomCss ?? string.Empty,
                    CustomerLogoUrl = entry.CustomerLogoUrl ?? string.Empty,
                    BackgroundImageUrl = entry.BackgroundImageUrl ?? string.Empty,
                    DarkBackgroundImageUrl = entry.DarkBackgroundImageUrl ?? string.Empty,
                    BackgroundColor = entry.BackgroundColor ?? string.Empty,
                    DarkBackgroundColor = entry.DarkBackgroundColor ?? string.Empty,
                    BackgroundMode = string.IsNullOrWhiteSpace(entry.BackgroundMode)
                        ? "image"
                        : entry.BackgroundMode.Trim(),
                    DarkBackgroundMode = string.IsNullOrWhiteSpace(entry.DarkBackgroundMode)
                        ? "image"
                        : entry.DarkBackgroundMode.Trim(),
                    FontFamily = entry.FontFamily ?? string.Empty,
                    DarkFontFamily = entry.DarkFontFamily ?? string.Empty,
                    BaseFontSize = entry.BaseFontSize ?? string.Empty,
                    DarkBaseFontSize = entry.DarkBaseFontSize ?? string.Empty,
                    PrimaryColor = entry.PrimaryColor ?? string.Empty,
                    DarkPrimaryColor = entry.DarkPrimaryColor ?? string.Empty,
                    HighlightColor = entry.HighlightColor ?? string.Empty,
                    DarkHighlightColor = entry.DarkHighlightColor ?? string.Empty,
                    HighlightTextColor = entry.HighlightTextColor ?? string.Empty,
                    DarkHighlightTextColor = entry.DarkHighlightTextColor ?? string.Empty,
                    PrimaryHoverColor = entry.PrimaryHoverColor ?? string.Empty,
                    DarkPrimaryHoverColor = entry.DarkPrimaryHoverColor ?? string.Empty,
                    SurfaceColor = entry.SurfaceColor ?? string.Empty,
                    DarkSurfaceColor = entry.DarkSurfaceColor ?? string.Empty,
                    TextColor = entry.TextColor ?? string.Empty,
                    DarkTextColor = entry.DarkTextColor ?? string.Empty,
                    InputTextColor = entry.InputTextColor ?? string.Empty,
                    DarkInputTextColor = entry.DarkInputTextColor ?? string.Empty,
                    PrimaryOpacity = entry.PrimaryOpacity ?? string.Empty,
                    DarkPrimaryOpacity = entry.DarkPrimaryOpacity ?? string.Empty,
                    SurfaceOpacity = entry.SurfaceOpacity ?? string.Empty,
                    DarkSurfaceOpacity = entry.DarkSurfaceOpacity ?? string.Empty,
                    TextOpacity = entry.TextOpacity ?? string.Empty,
                    DarkTextOpacity = entry.DarkTextOpacity ?? string.Empty,
                    BorderRadius = entry.BorderRadius ?? string.Empty,
                    DarkBorderRadius = entry.DarkBorderRadius ?? string.Empty,
                    DarkInheritFromLight = entry.DarkInheritFromLight,
                    IsBuiltIn = false,
                }
            );
        }

        return customEntries.OrderBy(t => t.DisplayName, StringComparer.OrdinalIgnoreCase).ToList();
    }

    public static string NormalizeBaseTheme(string? baseTheme)
    {
        var normalized = NormalizeKey(baseTheme ?? "ml");
        return IsSupportedBaseTheme(normalized) ? normalized : "ml";
    }

    private static ThemeDefinitionDto Clone(ThemeDefinitionDto source)
    {
        return new ThemeDefinitionDto
        {
            Key = source.Key,
            DisplayName = source.DisplayName,
            BaseTheme = source.BaseTheme,
            CustomCss = source.CustomCss,
            DarkCustomCss = source.DarkCustomCss,
            CustomerLogoUrl = source.CustomerLogoUrl,
            BackgroundImageUrl = source.BackgroundImageUrl,
            DarkBackgroundImageUrl = source.DarkBackgroundImageUrl,
            BackgroundColor = source.BackgroundColor,
            DarkBackgroundColor = source.DarkBackgroundColor,
            BackgroundMode = source.BackgroundMode,
            DarkBackgroundMode = source.DarkBackgroundMode,
            FontFamily = source.FontFamily,
            DarkFontFamily = source.DarkFontFamily,
            BaseFontSize = source.BaseFontSize,
            DarkBaseFontSize = source.DarkBaseFontSize,
            PrimaryColor = source.PrimaryColor,
            DarkPrimaryColor = source.DarkPrimaryColor,
            HighlightColor = source.HighlightColor,
            DarkHighlightColor = source.DarkHighlightColor,
            HighlightTextColor = source.HighlightTextColor,
            DarkHighlightTextColor = source.DarkHighlightTextColor,
            PrimaryHoverColor = source.PrimaryHoverColor,
            DarkPrimaryHoverColor = source.DarkPrimaryHoverColor,
            SurfaceColor = source.SurfaceColor,
            DarkSurfaceColor = source.DarkSurfaceColor,
            TextColor = source.TextColor,
            DarkTextColor = source.DarkTextColor,
            InputTextColor = source.InputTextColor,
            DarkInputTextColor = source.DarkInputTextColor,
            PrimaryOpacity = source.PrimaryOpacity,
            DarkPrimaryOpacity = source.DarkPrimaryOpacity,
            SurfaceOpacity = source.SurfaceOpacity,
            DarkSurfaceOpacity = source.DarkSurfaceOpacity,
            TextOpacity = source.TextOpacity,
            DarkTextOpacity = source.DarkTextOpacity,
            BorderRadius = source.BorderRadius,
            DarkBorderRadius = source.DarkBorderRadius,
            DarkInheritFromLight = source.DarkInheritFromLight,
            IsBuiltIn = source.IsBuiltIn,
        };
    }
}
