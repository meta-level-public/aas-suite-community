using System.ComponentModel;
using System.Runtime.Serialization;
using AasDesignerApi.Middleware;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace AasDesignerApi.Model.Client;

[JsonConverter(typeof(StringEnumConverter))]
[TypeConverter(typeof(EnumMemberConverter<ReleaseClassificationVersion>))]
public enum ReleaseClassificationVersion
{
    [EnumMember(Value = "LATEST")]
    LATEST,

    [EnumMember(Value = @"0173-1#11-ECLASS5.1.4#001")]
    _0173_1_11_ECLASS5_1_4_001,

    [EnumMember(Value = @"0173-1#11-ECLASS6.0#001")]
    _0173_1_11_ECLASS6_0_001,

    [EnumMember(Value = @"0173-1#11-ECLASS6.0.1#001")]
    _0173_1_11_ECLASS6_0_1_001,

    [EnumMember(Value = @"0173-1#11-ECLASS6.2#001")]
    _0173_1_11_ECLASS6_2_001,

    [EnumMember(Value = @"0173-1#11-ECLASS7#001")]
    _0173_1_11_ECLASS7_001,

    [EnumMember(Value = @"0173-1#11-ECLASS7.1#001")]
    _0173_1_11_ECLASS7_1_001,

    [EnumMember(Value = @"0173-1#11-ECLASS8#001")]
    _0173_1_11_ECLASS8_001,

    [EnumMember(Value = @"0173-1#11-ECLASS8.1#001")]
    _0173_1_11_ECLASS8_1_001,

    [EnumMember(Value = @"0173-1#11-ECLASS9#001")]
    _0173_1_11_ECLASS9_001,

    [EnumMember(Value = @"0173-1#11-ECLASS91#001")]
    _0173_1_11_ECLASS91_001,

    [EnumMember(Value = @"0173-1#11-ECLASS10.0.1#001")]
    _0173_1_11_ECLASS10_0_1_001,

    [EnumMember(Value = @"0173-1#11-ECLASS10.1#001")]
    _0173_1_11_ECLASS10_1_001,

    [EnumMember(Value = @"0173-1#11-ECLASS11#001")]
    _0173_1_11_ECLASS11_001,

    [EnumMember(Value = @"0173-1#11-ECLASS11.1#001")]
    _0173_1_11_ECLASS11_1_001,
}
