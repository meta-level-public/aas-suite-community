using System.Text.Json;
using AasDesignerApi.Model;
using AasDesignerModel;
using Microsoft.EntityFrameworkCore;

namespace AasDesignerApi.Jobs;

public sealed record DailyExpiredOrganisationsCheckerSettingsDto(
    int IntervalMinutes,
    bool IsEnabled
);

public static class DailyExpiredOrganisationsCheckerSettingsStore
{
    public const string SettingName = "DailyExpiredOrganisationsCheckerSettingsV1";
    public const int DefaultIntervalMinutes = 1440;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    public static DailyExpiredOrganisationsCheckerSettingsDto Deserialize(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
            return new DailyExpiredOrganisationsCheckerSettingsDto(DefaultIntervalMinutes, true);

        try
        {
            return JsonSerializer.Deserialize<DailyExpiredOrganisationsCheckerSettingsDto>(
                    json,
                    JsonOptions
                ) ?? new DailyExpiredOrganisationsCheckerSettingsDto(DefaultIntervalMinutes, true);
        }
        catch
        {
            return new DailyExpiredOrganisationsCheckerSettingsDto(DefaultIntervalMinutes, true);
        }
    }

    public static async Task<DailyExpiredOrganisationsCheckerSettingsDto> LoadAsync(
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
        DailyExpiredOrganisationsCheckerSettingsDto settings,
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
