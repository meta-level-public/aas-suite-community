using System.ComponentModel;
using System.Globalization;
using System.Runtime.Serialization;
using Newtonsoft.Json.Serialization;

namespace AasDesignerApi.Middleware;

public class EnumMemberConverter<T> : EnumConverter
{
    private readonly CamelCaseNamingStrategy _camelCaseNamingStrategy;

    public EnumMemberConverter(Type type)
        : base(type)
    {
        _camelCaseNamingStrategy = new CamelCaseNamingStrategy();
    }

    public override object? ConvertFrom(
        ITypeDescriptorContext? context,
        CultureInfo? culture,
        object value
    )
    {
        var type = typeof(T).GetFields();

        return type.AsEnumerable()
                .Where(field =>
                {
                    var attributeValue = Attribute.GetCustomAttribute(
                        field,
                        typeof(EnumMemberAttribute)
                    );
                    return attributeValue is EnumMemberAttribute attribute
                        && value is string enumValue
                        && _camelCaseNamingStrategy.GetPropertyName(
                            attribute?.Value ?? string.Empty,
                            false
                        ) == _camelCaseNamingStrategy.GetPropertyName(enumValue, false);
                })
                .Select(fieldInfo => fieldInfo.GetValue(null))
                .FirstOrDefault()
            ?? base.ConvertFrom(context, culture, value);
    }
}
