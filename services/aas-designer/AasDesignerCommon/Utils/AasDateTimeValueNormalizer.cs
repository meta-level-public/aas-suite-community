using System.Globalization;
using System.Reflection;
using AasCore.Aas3_1;
using AasRange = AasCore.Aas3_1.Range;

namespace AasDesignerCommon.Utils;

public static class AasDateTimeValueNormalizer
{
    private const string IsoUtcMillisecondsFormat = "yyyy-MM-dd'T'HH:mm:ss.fff'Z'";

    private static readonly string[] SupportedDateTimeFormats =
    [
        "yyyy-MM-dd HH:mm:ss.FFFK",
        "yyyy-MM-dd HH:mm:ssK",
        "yyyy-MM-dd'T'HH:mm:ss.FFFK",
        "yyyy-MM-dd'T'HH:mm:ssK",
        "yyyy-MM-dd'T'HH:mm:ss.fff'Z'",
    ];

    public static void NormalizeEnvironment(AasCore.Aas3_1.Environment environment)
    {
        foreach (var submodel in environment.Submodels ?? [])
        {
            NormalizeSubmodel(submodel);
        }
    }

    public static void NormalizeSubmodel(Submodel submodel)
    {
        NormalizeSubmodel((ISubmodel)submodel);
    }

    public static void NormalizeSubmodel(ISubmodel submodel)
    {
        NormalizeQualifiers(submodel);

        foreach (var submodelElement in submodel.SubmodelElements ?? [])
        {
            NormalizeSubmodelElement(submodelElement);
        }
    }

    internal static bool TryNormalizeDateTimeValue(string value, out string normalized)
    {
        if (
            DateTimeOffset.TryParseExact(
                value,
                SupportedDateTimeFormats,
                CultureInfo.InvariantCulture,
                DateTimeStyles.AssumeUniversal | DateTimeStyles.AdjustToUniversal,
                out var parsedExact
            )
            || DateTimeOffset.TryParse(
                value,
                CultureInfo.InvariantCulture,
                DateTimeStyles.AssumeUniversal | DateTimeStyles.AdjustToUniversal,
                out parsedExact
            )
        )
        {
            normalized = parsedExact.UtcDateTime.ToString(
                IsoUtcMillisecondsFormat,
                CultureInfo.InvariantCulture
            );
            return true;
        }

        normalized = value;
        return false;
    }

    private static void NormalizeSubmodelElement(ISubmodelElement submodelElement)
    {
        NormalizeQualifiers(submodelElement as IQualifiable);

        switch (submodelElement)
        {
            case Property property when property.ValueType == DataTypeDefXsd.DateTime:
                property.Value = NormalizeDateTimeValue(property.Value);
                break;
            case AasRange range when range.ValueType == DataTypeDefXsd.DateTime:
                range.Min = NormalizeDateTimeValue(range.Min);
                range.Max = NormalizeDateTimeValue(range.Max);
                break;
        }

        foreach (var childElement in EnumerateChildSubmodelElements(submodelElement))
        {
            NormalizeSubmodelElement(childElement);
        }
    }

    private static void NormalizeQualifiers(IQualifiable? qualifiable)
    {
        foreach (var qualifier in qualifiable?.Qualifiers ?? [])
        {
            if (qualifier.ValueType == DataTypeDefXsd.DateTime)
            {
                qualifier.Value = NormalizeDateTimeValue(qualifier.Value);
            }
        }
    }

    private static string? NormalizeDateTimeValue(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return value;
        }

        return TryNormalizeDateTimeValue(value, out var normalized) ? normalized : value;
    }

    private static IEnumerable<ISubmodelElement> EnumerateChildSubmodelElements(
        ISubmodelElement submodelElement
    )
    {
        foreach (var propertyName in new[] { "Value", "Statements", "Annotations" })
        {
            foreach (
                var child in EnumerateSubmodelElementsFromProperty(submodelElement, propertyName)
            )
            {
                yield return child;
            }
        }

        foreach (
            var propertyName in new[] { "InputVariables", "OutputVariables", "InoutputVariables" }
        )
        {
            var operationVariablesProperty = submodelElement
                .GetType()
                .GetProperty(propertyName, BindingFlags.Instance | BindingFlags.Public);

            if (
                operationVariablesProperty?.GetValue(submodelElement)
                is not System.Collections.IEnumerable operationVariables
            )
            {
                continue;
            }

            foreach (var operationVariable in operationVariables)
            {
                if (operationVariable == null)
                {
                    continue;
                }

                var valueProperty = operationVariable
                    .GetType()
                    .GetProperty("Value", BindingFlags.Instance | BindingFlags.Public);

                if (valueProperty?.GetValue(operationVariable) is ISubmodelElement value)
                {
                    yield return value;
                }
            }
        }
    }

    private static IEnumerable<ISubmodelElement> EnumerateSubmodelElementsFromProperty(
        object owner,
        string propertyName
    )
    {
        var property = owner
            .GetType()
            .GetProperty(propertyName, BindingFlags.Instance | BindingFlags.Public);
        if (property?.GetValue(owner) is not System.Collections.IEnumerable values)
        {
            yield break;
        }

        foreach (var value in values)
        {
            if (value is ISubmodelElement submodelElement)
            {
                yield return submodelElement;
            }
        }
    }
}
