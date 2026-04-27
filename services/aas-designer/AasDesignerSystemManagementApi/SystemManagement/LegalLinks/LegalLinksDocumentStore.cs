using System.Text.Json;
using AasDesignerApi.Model;
using AasDesignerModel;
using AasDesignerSystemManagementApi.SystemManagement.Model;
using Microsoft.EntityFrameworkCore;

namespace AasDesignerSystemManagementApi.SystemManagement.LegalLinks;

public static class LegalLinksDocumentStore
{
    private const string KeyPrefix = "LegalDocumentV1_";

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    private static readonly HashSet<string> ValidFieldNames = new(StringComparer.OrdinalIgnoreCase)
    {
        nameof(LegalLinksSettingsDto.DatenschutzLinkDe),
        nameof(LegalLinksSettingsDto.DatenschutzLinkEn),
        nameof(LegalLinksSettingsDto.AgbLinkDe),
        nameof(LegalLinksSettingsDto.AgbLinkEn),
        nameof(LegalLinksSettingsDto.AvvLinkDe),
        nameof(LegalLinksSettingsDto.AvvLinkEn),
        nameof(LegalLinksSettingsDto.ImprintLink),
    };

    public sealed record LegalLinksDocumentData(
        string FileName,
        string ContentType,
        string ContentBase64
    );

    public static bool IsValidFieldName(string fieldName) => ValidFieldNames.Contains(fieldName);

    public static async Task<LegalLinksDocumentData?> LoadAsync(
        IApplicationDbContext context,
        string fieldName,
        CancellationToken cancellationToken
    )
    {
        var key = KeyPrefix + fieldName;
        var json = await context
            .PersistentSettings.AsNoTracking()
            .Where(s => s.Name == key)
            .Select(s => s.Value)
            .FirstOrDefaultAsync(cancellationToken);

        if (string.IsNullOrWhiteSpace(json))
            return null;

        try
        {
            return JsonSerializer.Deserialize<LegalLinksDocumentData>(json, JsonOptions);
        }
        catch
        {
            return null;
        }
    }

    public static async Task<LegalLinksDocumentInfoDto?> LoadInfoAsync(
        IApplicationDbContext context,
        string fieldName,
        CancellationToken cancellationToken
    )
    {
        var data = await LoadAsync(context, fieldName, cancellationToken);
        if (data == null)
            return null;

        return new LegalLinksDocumentInfoDto
        {
            FileName = data.FileName,
            ContentType = data.ContentType,
        };
    }

    public static async Task SaveAsync(
        IApplicationDbContext context,
        string fieldName,
        LegalLinksDocumentData data,
        CancellationToken cancellationToken
    )
    {
        var key = KeyPrefix + fieldName;
        var json = JsonSerializer.Serialize(data);

        var setting = await context.PersistentSettings.FirstOrDefaultAsync(
            s => s.Name == key,
            cancellationToken
        );

        if (setting == null)
        {
            setting = new PersistentSetting { Name = key, Value = json };
            context.PersistentSettings.Add(setting);
        }
        else
        {
            setting.Value = json;
            context.PersistentSettings.Update(setting);
        }

        await context.SaveChangesAsync(cancellationToken);
    }

    public static async Task DeleteAsync(
        IApplicationDbContext context,
        string fieldName,
        CancellationToken cancellationToken
    )
    {
        var key = KeyPrefix + fieldName;
        var setting = await context.PersistentSettings.FirstOrDefaultAsync(
            s => s.Name == key,
            cancellationToken
        );

        if (setting != null)
        {
            context.PersistentSettings.Remove(setting);
            await context.SaveChangesAsync(cancellationToken);
        }
    }
}
