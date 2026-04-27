using System.Text.Json;
using AasDesignerApi.Model;
using AasDesignerModel;
using Microsoft.EntityFrameworkCore;

namespace AasDesignerApi.Jobs;

public sealed record PcnUpdateListenerSettingsDto(int IntervalMinutes, bool IsEnabled);

public static class PcnUpdateListenerSettingsStore
{
    public const string SettingName = "PcnUpdateListenerSettingsV1";
    public const int DefaultIntervalMinutes = 1;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    public static PcnUpdateListenerSettingsDto Deserialize(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
            return new PcnUpdateListenerSettingsDto(DefaultIntervalMinutes, true);

        try
        {
            return JsonSerializer.Deserialize<PcnUpdateListenerSettingsDto>(json, JsonOptions)
                ?? new PcnUpdateListenerSettingsDto(DefaultIntervalMinutes, true);
        }
        catch
        {
            return new PcnUpdateListenerSettingsDto(DefaultIntervalMinutes, true);
        }
    }

    public static async Task<PcnUpdateListenerSettingsDto> LoadAsync(
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
        PcnUpdateListenerSettingsDto settings,
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
