using System.Text.Json;
using AasDesignerApi.Model;
using AasDesignerModel;
using Microsoft.EntityFrameworkCore;

namespace AasDesignerApi.Jobs;

public sealed record DailyStatisticCalculatorSettingsDto(int IntervalMinutes, bool IsEnabled);

public static class DailyStatisticCalculatorSettingsStore
{
    public const string SettingName = "DailyStatisticCalculatorSettingsV1";
    public const int DefaultIntervalMinutes = 1440;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    public static DailyStatisticCalculatorSettingsDto Deserialize(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
            return new DailyStatisticCalculatorSettingsDto(DefaultIntervalMinutes, true);

        try
        {
            return JsonSerializer.Deserialize<DailyStatisticCalculatorSettingsDto>(
                    json,
                    JsonOptions
                ) ?? new DailyStatisticCalculatorSettingsDto(DefaultIntervalMinutes, true);
        }
        catch
        {
            return new DailyStatisticCalculatorSettingsDto(DefaultIntervalMinutes, true);
        }
    }

    public static async Task<DailyStatisticCalculatorSettingsDto> LoadAsync(
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
        DailyStatisticCalculatorSettingsDto settings,
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
