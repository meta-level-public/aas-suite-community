using System.Text.Json;
using AasDesignerApi.Model;
using AasDesignerModel;
using Microsoft.EntityFrameworkCore;

namespace AasDesignerApi.Jobs;

public sealed record PeriodicOrganisationDeleterSettingsDto(int IntervalMinutes, bool IsEnabled);

public static class PeriodicOrganisationDeleterSettingsStore
{
    public const string SettingName = "PeriodicOrganisationDeleterSettingsV1";
    public const int DefaultIntervalMinutes = 60;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    public static PeriodicOrganisationDeleterSettingsDto Deserialize(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
            return new PeriodicOrganisationDeleterSettingsDto(DefaultIntervalMinutes, true);

        try
        {
            return JsonSerializer.Deserialize<PeriodicOrganisationDeleterSettingsDto>(
                    json,
                    JsonOptions
                ) ?? new PeriodicOrganisationDeleterSettingsDto(DefaultIntervalMinutes, true);
        }
        catch
        {
            return new PeriodicOrganisationDeleterSettingsDto(DefaultIntervalMinutes, true);
        }
    }

    public static async Task<PeriodicOrganisationDeleterSettingsDto> LoadAsync(
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
        PeriodicOrganisationDeleterSettingsDto settings,
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
