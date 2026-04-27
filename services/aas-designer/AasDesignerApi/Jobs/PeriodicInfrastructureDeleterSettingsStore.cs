using System.Text.Json;
using AasDesignerApi.Model;
using AasDesignerModel;
using Microsoft.EntityFrameworkCore;

namespace AasDesignerApi.Jobs;

public sealed record PeriodicInfrastructureDeleterSettingsDto(int IntervalMinutes, bool IsEnabled);

public static class PeriodicInfrastructureDeleterSettingsStore
{
    public const string SettingName = "PeriodicInfrastructureDeleterSettingsV1";
    public const int DefaultIntervalMinutes = 60;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    public static PeriodicInfrastructureDeleterSettingsDto Deserialize(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
            return new PeriodicInfrastructureDeleterSettingsDto(DefaultIntervalMinutes, true);

        try
        {
            return JsonSerializer.Deserialize<PeriodicInfrastructureDeleterSettingsDto>(
                    json,
                    JsonOptions
                ) ?? new PeriodicInfrastructureDeleterSettingsDto(DefaultIntervalMinutes, true);
        }
        catch
        {
            return new PeriodicInfrastructureDeleterSettingsDto(DefaultIntervalMinutes, true);
        }
    }

    public static async Task<PeriodicInfrastructureDeleterSettingsDto> LoadAsync(
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
        PeriodicInfrastructureDeleterSettingsDto settings,
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
