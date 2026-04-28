using System.Text.Json;
using AasDesignerApi.Model;
using AasDesignerModel;
using Microsoft.EntityFrameworkCore;

namespace AasDesignerApi.Jobs.Markt;

public sealed record MarktRegexSyncSettingsDto(int IntervalMinutes, bool IsEnabled);

public static class MarktRegexSyncSettingsStore
{
    public const string SettingName = "MarktRegexSyncSettingsV1";
    public const int DefaultIntervalMinutes = 15;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    public static MarktRegexSyncSettingsDto Deserialize(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
            return new MarktRegexSyncSettingsDto(DefaultIntervalMinutes, true);

        try
        {
            return JsonSerializer.Deserialize<MarktRegexSyncSettingsDto>(json, JsonOptions)
                ?? new MarktRegexSyncSettingsDto(DefaultIntervalMinutes, true);
        }
        catch
        {
            return new MarktRegexSyncSettingsDto(DefaultIntervalMinutes, true);
        }
    }

    public static async Task<MarktRegexSyncSettingsDto> LoadAsync(
        IApplicationDbContext context,
        CancellationToken cancellationToken
    )
    {
        var stored = await context
            .PersistentSettings.AsNoTracking()
            .Where(s => s.Name == SettingName)
            .Select(s => s.Value)
            .FirstOrDefaultAsync(cancellationToken);

        return Deserialize(stored);
    }

    public static async Task SaveAsync(
        IApplicationDbContext context,
        MarktRegexSyncSettingsDto settings,
        CancellationToken cancellationToken
    )
    {
        var json = JsonSerializer.Serialize(settings);

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
        }

        await context.SaveChangesAsync(cancellationToken);
    }
}
