using AasCore.Aas3_1;
using AasDesignerApi.Model;
using AasDesignerApi.Statistics;
using AasDesignerCommon.Utils;

namespace AasDesignerCommon.Statistics;

public static class RecentAasDataFactory
{
    public static AdditionalDataSaveShell Create(
        string aasId,
        long infrastructureId,
        string? idShort,
        StatisticActionType eventType
    )
    {
        return new AdditionalDataSaveShell
        {
            AasId = aasId,
            InfrastructureId = infrastructureId,
            IdShort = idShort ?? string.Empty,
            EventType = ToEventType(eventType),
        };
    }

    public static AdditionalDataSaveShell CreateFromEnvironment(
        AasCore.Aas3_1.Environment? environment,
        string aasId,
        long infrastructureId,
        StatisticActionType eventType
    )
    {
        return Create(
            aasId,
            infrastructureId,
            environment?.AssetAdministrationShells?.FirstOrDefault()?.IdShort,
            eventType
        );
    }

    public static AdditionalDataSaveShell CreateFromPlainJson(
        string plainJson,
        string aasId,
        long infrastructureId,
        StatisticActionType eventType
    )
    {
        return Create(aasId, infrastructureId, TryReadIdShortFromPlainJson(plainJson), eventType);
    }

    public static string ToEventType(StatisticActionType eventType)
    {
        return eventType switch
        {
            StatisticActionType.CREATE_SHELL => "create",
            StatisticActionType.SAVE_SHELL => "save",
            _ => string.Empty,
        };
    }

    public static string TryReadIdShortFromPlainJson(string plainJson)
    {
        if (string.IsNullOrWhiteSpace(plainJson))
        {
            return string.Empty;
        }

        try
        {
            var jsonNode = AasJsonNodeParser.Parse(plainJson);
            var environment = AasCore.Aas3_1.Jsonization.Deserialize.EnvironmentFrom(jsonNode);
            return environment?.AssetAdministrationShells?.FirstOrDefault()?.IdShort
                ?? string.Empty;
        }
        catch
        {
            return string.Empty;
        }
    }
}
