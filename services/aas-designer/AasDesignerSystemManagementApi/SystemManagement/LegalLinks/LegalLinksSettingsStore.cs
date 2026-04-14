using System.Text.Json;
using AasDesignerApi.Model;
using AasDesignerModel;
using AasDesignerSystemManagementApi.SystemManagement.Model;
using Microsoft.EntityFrameworkCore;

namespace AasDesignerSystemManagementApi.SystemManagement.LegalLinks;

public static class LegalLinksSettingsStore
{
    public const string SettingName = "LegalLinksSettingsV1";

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    public static async Task<LegalLinksSettingsDto> LoadAsync(
        IApplicationDbContext context,
        LegalLinksSettingsDto fallback,
        CancellationToken cancellationToken
    )
    {
        var stored = await context
            .PersistentSettings.AsNoTracking()
            .Where(s => s.Name == SettingName)
            .Select(s => s.Value)
            .FirstOrDefaultAsync(cancellationToken);

        return MergeWithFallback(Deserialize(stored), fallback);
    }

    public static async Task SaveAsync(
        IApplicationDbContext context,
        LegalLinksSettingsDto settings,
        CancellationToken cancellationToken
    )
    {
        var normalized = Normalize(settings);
        var json = JsonSerializer.Serialize(normalized);

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

    public static LegalLinksSettingsDto Normalize(LegalLinksSettingsDto settings)
    {
        return new LegalLinksSettingsDto
        {
            DatenschutzLinkDe = NormalizeLink(settings.DatenschutzLinkDe),
            DatenschutzLinkEn = NormalizeLink(settings.DatenschutzLinkEn),
            AgbLinkDe = NormalizeLink(settings.AgbLinkDe),
            AgbLinkEn = NormalizeLink(settings.AgbLinkEn),
            AvvLinkDe = NormalizeLink(settings.AvvLinkDe),
            AvvLinkEn = NormalizeLink(settings.AvvLinkEn),
            ImprintLink = NormalizeLink(settings.ImprintLink),
        };
    }

    private static LegalLinksSettingsDto Deserialize(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
        {
            return new LegalLinksSettingsDto();
        }

        try
        {
            return JsonSerializer.Deserialize<LegalLinksSettingsDto>(json, JsonOptions)
                ?? new LegalLinksSettingsDto();
        }
        catch
        {
            return new LegalLinksSettingsDto();
        }
    }

    private static LegalLinksSettingsDto MergeWithFallback(
        LegalLinksSettingsDto stored,
        LegalLinksSettingsDto fallback
    )
    {
        var normalizedStored = Normalize(stored);
        var normalizedFallback = Normalize(fallback);

        return new LegalLinksSettingsDto
        {
            DatenschutzLinkDe = Choose(
                normalizedStored.DatenschutzLinkDe,
                normalizedFallback.DatenschutzLinkDe
            ),
            DatenschutzLinkEn = Choose(
                normalizedStored.DatenschutzLinkEn,
                normalizedFallback.DatenschutzLinkEn
            ),
            AgbLinkDe = Choose(normalizedStored.AgbLinkDe, normalizedFallback.AgbLinkDe),
            AgbLinkEn = Choose(normalizedStored.AgbLinkEn, normalizedFallback.AgbLinkEn),
            AvvLinkDe = Choose(normalizedStored.AvvLinkDe, normalizedFallback.AvvLinkDe),
            AvvLinkEn = Choose(normalizedStored.AvvLinkEn, normalizedFallback.AvvLinkEn),
            ImprintLink = Choose(normalizedStored.ImprintLink, normalizedFallback.ImprintLink),
        };
    }

    private static string NormalizeLink(string? value)
    {
        return value?.Trim() ?? string.Empty;
    }

    private static string Choose(string value, string fallback)
    {
        return string.IsNullOrWhiteSpace(value) ? fallback : value;
    }
}
