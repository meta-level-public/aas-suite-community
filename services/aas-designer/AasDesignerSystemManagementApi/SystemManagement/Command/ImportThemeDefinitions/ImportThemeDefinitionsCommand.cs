using System.IO.Compression;
using System.Text.Json;
using System.Text.RegularExpressions;
using AasDesignerModel;
using AasDesignerSystemManagementApi.SystemManagement.Model;
using AasDesignerSystemManagementApi.SystemManagement.ThemeConfiguration;
using MediatR;

namespace AasDesignerSystemManagementApi.SystemManagement.Command.ImportThemeDefinitions;

public class ImportThemeDefinitionsCommand : IRequest<bool>
{
    public string FileAsBase64 { get; set; } = string.Empty;
}

public class ImportThemeDefinitionsHandler : IRequestHandler<ImportThemeDefinitionsCommand, bool>
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    private readonly IApplicationDbContext _context;

    public ImportThemeDefinitionsHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(
        ImportThemeDefinitionsCommand request,
        CancellationToken cancellationToken
    )
    {
        var base64Data = Regex
            .Match(request.FileAsBase64, @"data:(?<type>.+?),(?<data>.+)")
            .Groups["data"]
            .Value;
        var binaryData = Convert.FromBase64String(base64Data);

        using var inputStream = new MemoryStream(binaryData);
        using var gzipStream = new GZipStream(inputStream, CompressionMode.Decompress);
        using var reader = new StreamReader(gzipStream);
        var jsonString = await reader.ReadToEndAsync(cancellationToken);

        var imported =
            JsonSerializer.Deserialize<List<ThemeDefinitionDto>>(jsonString, JsonOptions) ?? [];
        var current = await ThemeDefinitionStore.LoadAsync(_context, cancellationToken);

        var builtInEntries = current
            .Where(theme => theme.IsBuiltIn)
            .ToDictionary(theme => theme.Key, CloneThemeDefinition);
        var customEntries = current
            .Where(theme => !theme.IsBuiltIn)
            .ToDictionary(theme => theme.Key, CloneThemeDefinition);
        var usedCustomKeys = new HashSet<string>(
            customEntries.Keys,
            StringComparer.OrdinalIgnoreCase
        );
        var usedDisplayNames = new HashSet<string>(
            current
                .Select(theme =>
                    string.IsNullOrWhiteSpace(theme.DisplayName) ? theme.Key : theme.DisplayName
                )
                .Where(name => !string.IsNullOrWhiteSpace(name)),
            StringComparer.OrdinalIgnoreCase
        );

        foreach (var importedTheme in imported)
        {
            var normalizedKey = ThemeDefinitionStore.NormalizeKey(importedTheme.Key);
            if (normalizedKey == string.Empty || normalizedKey == "default")
            {
                continue;
            }

            var themeToStore = CloneThemeDefinition(importedTheme);
            themeToStore.Key = normalizedKey;

            if (
                ThemeDefinitionStore.IsBuiltIn(normalizedKey)
                || !ThemeDefinitionStore.IsValidCustomKey(normalizedKey)
            )
            {
                themeToStore.Key = CreateImportedKey(normalizedKey, usedCustomKeys);
                themeToStore.DisplayName = CreateImportedDisplayName(
                    importedTheme.DisplayName,
                    normalizedKey,
                    usedDisplayNames
                );
                themeToStore.IsBuiltIn = false;
            }

            if (ThemeDefinitionStore.IsBuiltIn(themeToStore.Key))
            {
                builtInEntries[themeToStore.Key] = themeToStore;
                continue;
            }

            customEntries[themeToStore.Key] = themeToStore;
            usedCustomKeys.Add(themeToStore.Key);
            if (!string.IsNullOrWhiteSpace(themeToStore.DisplayName))
            {
                usedDisplayNames.Add(themeToStore.DisplayName);
            }
        }

        await ThemeDefinitionStore.SaveAsync(
            _context,
            builtInEntries.Values.Concat(customEntries.Values),
            cancellationToken
        );
        return true;
    }

    private static string CreateImportedKey(string key, ISet<string> usedCustomKeys)
    {
        var baseKey = ThemeDefinitionStore.IsValidCustomKey(key) ? key : "theme-import";
        var candidate = $"{baseKey}-import";
        var suffix = 2;

        while (ThemeDefinitionStore.IsBuiltIn(candidate) || usedCustomKeys.Contains(candidate))
        {
            candidate = $"{baseKey}-import-{suffix}";
            suffix++;
        }

        return candidate;
    }

    private static string CreateImportedDisplayName(
        string? displayName,
        string fallbackKey,
        ISet<string> usedDisplayNames
    )
    {
        var baseName = string.IsNullOrWhiteSpace(displayName) ? fallbackKey : displayName.Trim();
        var candidate = $"{baseName} (Import)";
        var suffix = 2;

        while (usedDisplayNames.Contains(candidate))
        {
            candidate = $"{baseName} (Import {suffix})";
            suffix++;
        }

        return candidate;
    }

    private static ThemeDefinitionDto CloneThemeDefinition(ThemeDefinitionDto source)
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
