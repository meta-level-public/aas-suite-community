///////////////////////////////////////////////////////////////////////////
//           Liquid XML Objects GENERATED CODE - DO NOT MODIFY           //
//            https://www.liquid-technologies.com/xml-objects            //
//=======================================================================//
// Dependencies                                                          //
//     Nuget : LiquidTechnologies.XmlObjects.Runtime                     //
//           : MUST BE VERSION 20.4.2                                    //
//=======================================================================//
// Online Help                                                           //
//     https://www.liquid-technologies.com/xml-objects-quick-start-guide //
//=======================================================================//
// Licensing Information                                                 //
//     https://www.liquid-technologies.com/eula                          //
///////////////////////////////////////////////////////////////////////////
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Numerics;
using System.Xml.Linq;
using LiquidTechnologies.XmlObjects;
using LiquidTechnologies.XmlObjects.Attribution;

// ------------------------------------------------------
// |                      Settings                      |
// ------------------------------------------------------
// GenerateCommonBaseClass                  = False
// GenerateUnprocessedNodeHandlers          = True
// RaiseChangeEvents                        = False
// CollectionNaming                         = Pluralize
// Language                                 = CS
// OutputNamespace                          = AasSchema
// WriteDefaultValuesForOptionalAttributes  = True
// WriteDefaultValuesForOptionalElements    = False
// MixedContentHandling                     = TreatAsAny
// GenerationModel                          = Simple
//                                            *WARNING* this simplified model that is very easy to work with
//                                            but may cause the XML to be produced without regard for element
//                                            cardinality or order. Where very high compliance with the XML Schema
//                                            standard is required use GenerationModelType.Conformant
// XSD Schema Files
//    C:\_DEV\aas-produkt\xsd\aas.xsd

namespace AasSchema
{
    #region Global Settings
    /// <summary>Contains library level properties, and ensures the version of the runtime used matches the version used to generate it.</summary>
    [LxRuntimeRequirements(
        "20.4.2.12285",
        "Mustafa Dwaidari ",
        "05LYLPKM3HWAK38M",
        LicenseTermsType.FullLicense
    )]
    public partial class LxRuntimeRequirementsWritten { }

    #endregion

    #region Global Base Class
    /// <summary>All generated Lx classes derive from this base class.</summary>
    /// <remarks>Notes to implementers. The class is declared partial, so additional members and properties can be added that will be available in all Lx generated classes.</remarks>
    public partial class LxBase
    {
        #region Unprocessed Node Handlers
        /// <summary>Any child elements that do not belong in this element are added to the UnprocessedElements collection.</summary>
        [LxElementUnprocessed(0)]
        public List<XElement> UnprocessedElements { get; } = new List<XElement>();

        /// <summary>Any attributes that do not belong in this element are added to the UnprocessedAttributes collection.</summary>
        [LxAttributeUnprocessed()]
        public List<XAttribute> UnprocessedAttributes { get; } = new List<XAttribute>();

        #endregion
    }

    #endregion
}

namespace AasSchema.Tns
{
    #region Enumerations
    /// <summary>An enumeration representing XSD simple type aasSubmodelElements_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/simpleType:aasSubmodelElements_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>939:3-959:19</XsdLocation>
    [LxSimpleTypeDefinition("aasSubmodelElements_t", "https://admin-shell.io/aas/3/0")]
    public enum AasSubmodelElements_T1Enum
    {
        /// <summary>Represents the value 'AnnotatedRelationshipElement' in the XML</summary>
        [LxEnumValue("AnnotatedRelationshipElement")]
        AnnotatedRelationshipElement,

        /// <summary>Represents the value 'BasicEventElement' in the XML</summary>
        [LxEnumValue("BasicEventElement")]
        BasicEventElement,

        /// <summary>Represents the value 'Blob' in the XML</summary>
        [LxEnumValue("Blob")]
        Blob,

        /// <summary>Represents the value 'Capability' in the XML</summary>
        [LxEnumValue("Capability")]
        Capability,

        /// <summary>Represents the value 'DataElement' in the XML</summary>
        [LxEnumValue("DataElement")]
        DataElement,

        /// <summary>Represents the value 'Entity' in the XML</summary>
        [LxEnumValue("Entity")]
        Entity,

        /// <summary>Represents the value 'EventElement' in the XML</summary>
        [LxEnumValue("EventElement")]
        EventElement,

        /// <summary>Represents the value 'File' in the XML</summary>
        [LxEnumValue("File")]
        File,

        /// <summary>Represents the value 'MultiLanguageProperty' in the XML</summary>
        [LxEnumValue("MultiLanguageProperty")]
        MultiLanguageProperty,

        /// <summary>Represents the value 'Operation' in the XML</summary>
        [LxEnumValue("Operation")]
        Operation,

        /// <summary>Represents the value 'Property' in the XML</summary>
        [LxEnumValue("Property")]
        Property,

        /// <summary>Represents the value 'Range' in the XML</summary>
        [LxEnumValue("Range")]
        Range,

        /// <summary>Represents the value 'ReferenceElement' in the XML</summary>
        [LxEnumValue("ReferenceElement")]
        ReferenceElement,

        /// <summary>Represents the value 'RelationshipElement' in the XML</summary>
        [LxEnumValue("RelationshipElement")]
        RelationshipElement,

        /// <summary>Represents the value 'SubmodelElement' in the XML</summary>
        [LxEnumValue("SubmodelElement")]
        SubmodelElement,

        /// <summary>Represents the value 'SubmodelElementList' in the XML</summary>
        [LxEnumValue("SubmodelElementList")]
        SubmodelElementList,

        /// <summary>Represents the value 'SubmodelElementCollection' in the XML</summary>
        [LxEnumValue("SubmodelElementCollection")]
        SubmodelElementCollection,
    }

    /// <summary>An enumeration representing XSD simple type aasSubmodelElements_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/simpleType:aasSubmodelElements_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>939:3-959:19</XsdLocation>
    [LxSimpleTypeDefinition("aasSubmodelElements_t", "https://admin-shell.io/aas/3/0")]
    public enum AasSubmodelElements_TEnum
    {
        /// <summary>Represents the value 'AnnotatedRelationshipElement' in the XML</summary>
        [LxEnumValue("AnnotatedRelationshipElement")]
        AnnotatedRelationshipElement,

        /// <summary>Represents the value 'BasicEventElement' in the XML</summary>
        [LxEnumValue("BasicEventElement")]
        BasicEventElement,

        /// <summary>Represents the value 'Blob' in the XML</summary>
        [LxEnumValue("Blob")]
        Blob,

        /// <summary>Represents the value 'Capability' in the XML</summary>
        [LxEnumValue("Capability")]
        Capability,

        /// <summary>Represents the value 'DataElement' in the XML</summary>
        [LxEnumValue("DataElement")]
        DataElement,

        /// <summary>Represents the value 'Entity' in the XML</summary>
        [LxEnumValue("Entity")]
        Entity,

        /// <summary>Represents the value 'EventElement' in the XML</summary>
        [LxEnumValue("EventElement")]
        EventElement,

        /// <summary>Represents the value 'File' in the XML</summary>
        [LxEnumValue("File")]
        File,

        /// <summary>Represents the value 'MultiLanguageProperty' in the XML</summary>
        [LxEnumValue("MultiLanguageProperty")]
        MultiLanguageProperty,

        /// <summary>Represents the value 'Operation' in the XML</summary>
        [LxEnumValue("Operation")]
        Operation,

        /// <summary>Represents the value 'Property' in the XML</summary>
        [LxEnumValue("Property")]
        Property,

        /// <summary>Represents the value 'Range' in the XML</summary>
        [LxEnumValue("Range")]
        Range,

        /// <summary>Represents the value 'ReferenceElement' in the XML</summary>
        [LxEnumValue("ReferenceElement")]
        ReferenceElement,

        /// <summary>Represents the value 'RelationshipElement' in the XML</summary>
        [LxEnumValue("RelationshipElement")]
        RelationshipElement,

        /// <summary>Represents the value 'SubmodelElement' in the XML</summary>
        [LxEnumValue("SubmodelElement")]
        SubmodelElement,

        /// <summary>Represents the value 'SubmodelElementList' in the XML</summary>
        [LxEnumValue("SubmodelElementList")]
        SubmodelElementList,

        /// <summary>Represents the value 'SubmodelElementCollection' in the XML</summary>
        [LxEnumValue("SubmodelElementCollection")]
        SubmodelElementCollection,
    }

    /// <summary>An enumeration representing XSD simple type assetKind_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/simpleType:assetKind_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>960:3-966:19</XsdLocation>
    [LxSimpleTypeDefinition("assetKind_t", "https://admin-shell.io/aas/3/0")]
    public enum AssetKind_T1Enum
    {
        /// <summary>Represents the value 'Type' in the XML</summary>
        [LxEnumValue("Type")]
        Type,

        /// <summary>Represents the value 'Instance' in the XML</summary>
        [LxEnumValue("Instance")]
        Instance,

        /// <summary>Represents the value 'NotApplicable' in the XML</summary>
        [LxEnumValue("NotApplicable")]
        NotApplicable,
    }

    /// <summary>An enumeration representing XSD simple type assetKind_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/simpleType:assetKind_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>960:3-966:19</XsdLocation>
    [LxSimpleTypeDefinition("assetKind_t", "https://admin-shell.io/aas/3/0")]
    public enum AssetKind_TEnum
    {
        /// <summary>Represents the value 'Type' in the XML</summary>
        [LxEnumValue("Type")]
        Type,

        /// <summary>Represents the value 'Instance' in the XML</summary>
        [LxEnumValue("Instance")]
        Instance,

        /// <summary>Represents the value 'NotApplicable' in the XML</summary>
        [LxEnumValue("NotApplicable")]
        NotApplicable,
    }

    /// <summary>An enumeration representing XSD simple type dataTypeDefXsd_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/simpleType:dataTypeDefXsd_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>967:3-1000:19</XsdLocation>
    [LxSimpleTypeDefinition("dataTypeDefXsd_t", "https://admin-shell.io/aas/3/0")]
    public enum DataTypeDefXsd_T1Enum
    {
        /// <summary>Represents the value 'xs:anyURI' in the XML</summary>
        [LxEnumValue("xs:anyURI")]
        Xs_AnyURI,

        /// <summary>Represents the value 'xs:base64Binary' in the XML</summary>
        [LxEnumValue("xs:base64Binary")]
        Xs_Base64Binary,

        /// <summary>Represents the value 'xs:boolean' in the XML</summary>
        [LxEnumValue("xs:boolean")]
        Xs_Boolean,

        /// <summary>Represents the value 'xs:byte' in the XML</summary>
        [LxEnumValue("xs:byte")]
        Xs_Byte,

        /// <summary>Represents the value 'xs:date' in the XML</summary>
        [LxEnumValue("xs:date")]
        Xs_Date,

        /// <summary>Represents the value 'xs:dateTime' in the XML</summary>
        [LxEnumValue("xs:dateTime")]
        Xs_DateTime,

        /// <summary>Represents the value 'xs:decimal' in the XML</summary>
        [LxEnumValue("xs:decimal")]
        Xs_Decimal,

        /// <summary>Represents the value 'xs:double' in the XML</summary>
        [LxEnumValue("xs:double")]
        Xs_Double,

        /// <summary>Represents the value 'xs:duration' in the XML</summary>
        [LxEnumValue("xs:duration")]
        Xs_Duration,

        /// <summary>Represents the value 'xs:float' in the XML</summary>
        [LxEnumValue("xs:float")]
        Xs_Float,

        /// <summary>Represents the value 'xs:gDay' in the XML</summary>
        [LxEnumValue("xs:gDay")]
        Xs_GDay,

        /// <summary>Represents the value 'xs:gMonth' in the XML</summary>
        [LxEnumValue("xs:gMonth")]
        Xs_GMonth,

        /// <summary>Represents the value 'xs:gMonthDay' in the XML</summary>
        [LxEnumValue("xs:gMonthDay")]
        Xs_GMonthDay,

        /// <summary>Represents the value 'xs:gYear' in the XML</summary>
        [LxEnumValue("xs:gYear")]
        Xs_GYear,

        /// <summary>Represents the value 'xs:gYearMonth' in the XML</summary>
        [LxEnumValue("xs:gYearMonth")]
        Xs_GYearMonth,

        /// <summary>Represents the value 'xs:hexBinary' in the XML</summary>
        [LxEnumValue("xs:hexBinary")]
        Xs_HexBinary,

        /// <summary>Represents the value 'xs:int' in the XML</summary>
        [LxEnumValue("xs:int")]
        Xs_Int,

        /// <summary>Represents the value 'xs:integer' in the XML</summary>
        [LxEnumValue("xs:integer")]
        Xs_Integer,

        /// <summary>Represents the value 'xs:long' in the XML</summary>
        [LxEnumValue("xs:long")]
        Xs_Long,

        /// <summary>Represents the value 'xs:negativeInteger' in the XML</summary>
        [LxEnumValue("xs:negativeInteger")]
        Xs_NegativeInteger,

        /// <summary>Represents the value 'xs:nonNegativeInteger' in the XML</summary>
        [LxEnumValue("xs:nonNegativeInteger")]
        Xs_NonNegativeInteger,

        /// <summary>Represents the value 'xs:nonPositiveInteger' in the XML</summary>
        [LxEnumValue("xs:nonPositiveInteger")]
        Xs_NonPositiveInteger,

        /// <summary>Represents the value 'xs:positiveInteger' in the XML</summary>
        [LxEnumValue("xs:positiveInteger")]
        Xs_PositiveInteger,

        /// <summary>Represents the value 'xs:short' in the XML</summary>
        [LxEnumValue("xs:short")]
        Xs_Short,

        /// <summary>Represents the value 'xs:string' in the XML</summary>
        [LxEnumValue("xs:string")]
        Xs_String,

        /// <summary>Represents the value 'xs:time' in the XML</summary>
        [LxEnumValue("xs:time")]
        Xs_Time,

        /// <summary>Represents the value 'xs:unsignedByte' in the XML</summary>
        [LxEnumValue("xs:unsignedByte")]
        Xs_UnsignedByte,

        /// <summary>Represents the value 'xs:unsignedInt' in the XML</summary>
        [LxEnumValue("xs:unsignedInt")]
        Xs_UnsignedInt,

        /// <summary>Represents the value 'xs:unsignedLong' in the XML</summary>
        [LxEnumValue("xs:unsignedLong")]
        Xs_UnsignedLong,

        /// <summary>Represents the value 'xs:unsignedShort' in the XML</summary>
        [LxEnumValue("xs:unsignedShort")]
        Xs_UnsignedShort,
    }

    /// <summary>An enumeration representing XSD simple type dataTypeDefXsd_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/simpleType:dataTypeDefXsd_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>967:3-1000:19</XsdLocation>
    [LxSimpleTypeDefinition("dataTypeDefXsd_t", "https://admin-shell.io/aas/3/0")]
    public enum DataTypeDefXsd_TEnum
    {
        /// <summary>Represents the value 'xs:anyURI' in the XML</summary>
        [LxEnumValue("xs:anyURI")]
        Xs_AnyURI,

        /// <summary>Represents the value 'xs:base64Binary' in the XML</summary>
        [LxEnumValue("xs:base64Binary")]
        Xs_Base64Binary,

        /// <summary>Represents the value 'xs:boolean' in the XML</summary>
        [LxEnumValue("xs:boolean")]
        Xs_Boolean,

        /// <summary>Represents the value 'xs:byte' in the XML</summary>
        [LxEnumValue("xs:byte")]
        Xs_Byte,

        /// <summary>Represents the value 'xs:date' in the XML</summary>
        [LxEnumValue("xs:date")]
        Xs_Date,

        /// <summary>Represents the value 'xs:dateTime' in the XML</summary>
        [LxEnumValue("xs:dateTime")]
        Xs_DateTime,

        /// <summary>Represents the value 'xs:decimal' in the XML</summary>
        [LxEnumValue("xs:decimal")]
        Xs_Decimal,

        /// <summary>Represents the value 'xs:double' in the XML</summary>
        [LxEnumValue("xs:double")]
        Xs_Double,

        /// <summary>Represents the value 'xs:duration' in the XML</summary>
        [LxEnumValue("xs:duration")]
        Xs_Duration,

        /// <summary>Represents the value 'xs:float' in the XML</summary>
        [LxEnumValue("xs:float")]
        Xs_Float,

        /// <summary>Represents the value 'xs:gDay' in the XML</summary>
        [LxEnumValue("xs:gDay")]
        Xs_GDay,

        /// <summary>Represents the value 'xs:gMonth' in the XML</summary>
        [LxEnumValue("xs:gMonth")]
        Xs_GMonth,

        /// <summary>Represents the value 'xs:gMonthDay' in the XML</summary>
        [LxEnumValue("xs:gMonthDay")]
        Xs_GMonthDay,

        /// <summary>Represents the value 'xs:gYear' in the XML</summary>
        [LxEnumValue("xs:gYear")]
        Xs_GYear,

        /// <summary>Represents the value 'xs:gYearMonth' in the XML</summary>
        [LxEnumValue("xs:gYearMonth")]
        Xs_GYearMonth,

        /// <summary>Represents the value 'xs:hexBinary' in the XML</summary>
        [LxEnumValue("xs:hexBinary")]
        Xs_HexBinary,

        /// <summary>Represents the value 'xs:int' in the XML</summary>
        [LxEnumValue("xs:int")]
        Xs_Int,

        /// <summary>Represents the value 'xs:integer' in the XML</summary>
        [LxEnumValue("xs:integer")]
        Xs_Integer,

        /// <summary>Represents the value 'xs:long' in the XML</summary>
        [LxEnumValue("xs:long")]
        Xs_Long,

        /// <summary>Represents the value 'xs:negativeInteger' in the XML</summary>
        [LxEnumValue("xs:negativeInteger")]
        Xs_NegativeInteger,

        /// <summary>Represents the value 'xs:nonNegativeInteger' in the XML</summary>
        [LxEnumValue("xs:nonNegativeInteger")]
        Xs_NonNegativeInteger,

        /// <summary>Represents the value 'xs:nonPositiveInteger' in the XML</summary>
        [LxEnumValue("xs:nonPositiveInteger")]
        Xs_NonPositiveInteger,

        /// <summary>Represents the value 'xs:positiveInteger' in the XML</summary>
        [LxEnumValue("xs:positiveInteger")]
        Xs_PositiveInteger,

        /// <summary>Represents the value 'xs:short' in the XML</summary>
        [LxEnumValue("xs:short")]
        Xs_Short,

        /// <summary>Represents the value 'xs:string' in the XML</summary>
        [LxEnumValue("xs:string")]
        Xs_String,

        /// <summary>Represents the value 'xs:time' in the XML</summary>
        [LxEnumValue("xs:time")]
        Xs_Time,

        /// <summary>Represents the value 'xs:unsignedByte' in the XML</summary>
        [LxEnumValue("xs:unsignedByte")]
        Xs_UnsignedByte,

        /// <summary>Represents the value 'xs:unsignedInt' in the XML</summary>
        [LxEnumValue("xs:unsignedInt")]
        Xs_UnsignedInt,

        /// <summary>Represents the value 'xs:unsignedLong' in the XML</summary>
        [LxEnumValue("xs:unsignedLong")]
        Xs_UnsignedLong,

        /// <summary>Represents the value 'xs:unsignedShort' in the XML</summary>
        [LxEnumValue("xs:unsignedShort")]
        Xs_UnsignedShort,
    }

    /// <summary>An enumeration representing XSD simple type dataTypeIec61360_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/simpleType:dataTypeIec61360_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>1001:3-1023:19</XsdLocation>
    [LxSimpleTypeDefinition("dataTypeIec61360_t", "https://admin-shell.io/aas/3/0")]
    public enum DataTypeIec61360_T1Enum
    {
        /// <summary>Represents the value 'DATE' in the XML</summary>
        [LxEnumValue("DATE")]
        DATE,

        /// <summary>Represents the value 'STRING' in the XML</summary>
        [LxEnumValue("STRING")]
        STRING_,

        /// <summary>Represents the value 'STRING_TRANSLATABLE' in the XML</summary>
        [LxEnumValue("STRING_TRANSLATABLE")]
        STRING_TRANSLATABLE,

        /// <summary>Represents the value 'INTEGER_MEASURE' in the XML</summary>
        [LxEnumValue("INTEGER_MEASURE")]
        INTEGER_MEASURE,

        /// <summary>Represents the value 'INTEGER_COUNT' in the XML</summary>
        [LxEnumValue("INTEGER_COUNT")]
        INTEGER_COUNT,

        /// <summary>Represents the value 'INTEGER_CURRENCY' in the XML</summary>
        [LxEnumValue("INTEGER_CURRENCY")]
        INTEGER_CURRENCY,

        /// <summary>Represents the value 'REAL_MEASURE' in the XML</summary>
        [LxEnumValue("REAL_MEASURE")]
        REAL_MEASURE,

        /// <summary>Represents the value 'REAL_COUNT' in the XML</summary>
        [LxEnumValue("REAL_COUNT")]
        REAL_COUNT,

        /// <summary>Represents the value 'REAL_CURRENCY' in the XML</summary>
        [LxEnumValue("REAL_CURRENCY")]
        REAL_CURRENCY,

        /// <summary>Represents the value 'BOOLEAN' in the XML</summary>
        [LxEnumValue("BOOLEAN")]
        BOOLEAN_,

        /// <summary>Represents the value 'IRI' in the XML</summary>
        [LxEnumValue("IRI")]
        IRI,

        /// <summary>Represents the value 'IRDI' in the XML</summary>
        [LxEnumValue("IRDI")]
        IRDI,

        /// <summary>Represents the value 'RATIONAL' in the XML</summary>
        [LxEnumValue("RATIONAL")]
        RATIONAL,

        /// <summary>Represents the value 'RATIONAL_MEASURE' in the XML</summary>
        [LxEnumValue("RATIONAL_MEASURE")]
        RATIONAL_MEASURE,

        /// <summary>Represents the value 'TIME' in the XML</summary>
        [LxEnumValue("TIME")]
        TIME,

        /// <summary>Represents the value 'TIMESTAMP' in the XML</summary>
        [LxEnumValue("TIMESTAMP")]
        TIMESTAMP,

        /// <summary>Represents the value 'FILE' in the XML</summary>
        [LxEnumValue("FILE")]
        FILE,

        /// <summary>Represents the value 'HTML' in the XML</summary>
        [LxEnumValue("HTML")]
        HTML,

        /// <summary>Represents the value 'BLOB' in the XML</summary>
        [LxEnumValue("BLOB")]
        BLOB,
    }

    /// <summary>An enumeration representing XSD simple type dataTypeIec61360_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/simpleType:dataTypeIec61360_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>1001:3-1023:19</XsdLocation>
    [LxSimpleTypeDefinition("dataTypeIec61360_t", "https://admin-shell.io/aas/3/0")]
    public enum DataTypeIec61360_TEnum
    {
        /// <summary>Represents the value 'DATE' in the XML</summary>
        [LxEnumValue("DATE")]
        DATE,

        /// <summary>Represents the value 'STRING' in the XML</summary>
        [LxEnumValue("STRING")]
        STRING_,

        /// <summary>Represents the value 'STRING_TRANSLATABLE' in the XML</summary>
        [LxEnumValue("STRING_TRANSLATABLE")]
        STRING_TRANSLATABLE,

        /// <summary>Represents the value 'INTEGER_MEASURE' in the XML</summary>
        [LxEnumValue("INTEGER_MEASURE")]
        INTEGER_MEASURE,

        /// <summary>Represents the value 'INTEGER_COUNT' in the XML</summary>
        [LxEnumValue("INTEGER_COUNT")]
        INTEGER_COUNT,

        /// <summary>Represents the value 'INTEGER_CURRENCY' in the XML</summary>
        [LxEnumValue("INTEGER_CURRENCY")]
        INTEGER_CURRENCY,

        /// <summary>Represents the value 'REAL_MEASURE' in the XML</summary>
        [LxEnumValue("REAL_MEASURE")]
        REAL_MEASURE,

        /// <summary>Represents the value 'REAL_COUNT' in the XML</summary>
        [LxEnumValue("REAL_COUNT")]
        REAL_COUNT,

        /// <summary>Represents the value 'REAL_CURRENCY' in the XML</summary>
        [LxEnumValue("REAL_CURRENCY")]
        REAL_CURRENCY,

        /// <summary>Represents the value 'BOOLEAN' in the XML</summary>
        [LxEnumValue("BOOLEAN")]
        BOOLEAN_,

        /// <summary>Represents the value 'IRI' in the XML</summary>
        [LxEnumValue("IRI")]
        IRI,

        /// <summary>Represents the value 'IRDI' in the XML</summary>
        [LxEnumValue("IRDI")]
        IRDI,

        /// <summary>Represents the value 'RATIONAL' in the XML</summary>
        [LxEnumValue("RATIONAL")]
        RATIONAL,

        /// <summary>Represents the value 'RATIONAL_MEASURE' in the XML</summary>
        [LxEnumValue("RATIONAL_MEASURE")]
        RATIONAL_MEASURE,

        /// <summary>Represents the value 'TIME' in the XML</summary>
        [LxEnumValue("TIME")]
        TIME,

        /// <summary>Represents the value 'TIMESTAMP' in the XML</summary>
        [LxEnumValue("TIMESTAMP")]
        TIMESTAMP,

        /// <summary>Represents the value 'FILE' in the XML</summary>
        [LxEnumValue("FILE")]
        FILE,

        /// <summary>Represents the value 'HTML' in the XML</summary>
        [LxEnumValue("HTML")]
        HTML,

        /// <summary>Represents the value 'BLOB' in the XML</summary>
        [LxEnumValue("BLOB")]
        BLOB,
    }

    /// <summary>An enumeration representing XSD simple type direction_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/simpleType:direction_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>1024:3-1029:19</XsdLocation>
    [LxSimpleTypeDefinition("direction_t", "https://admin-shell.io/aas/3/0")]
    public enum Direction_T1Enum
    {
        /// <summary>Represents the value 'input' in the XML</summary>
        [LxEnumValue("input")]
        Input,

        /// <summary>Represents the value 'output' in the XML</summary>
        [LxEnumValue("output")]
        Output,
    }

    /// <summary>An enumeration representing XSD simple type direction_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/simpleType:direction_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>1024:3-1029:19</XsdLocation>
    [LxSimpleTypeDefinition("direction_t", "https://admin-shell.io/aas/3/0")]
    public enum Direction_TEnum
    {
        /// <summary>Represents the value 'input' in the XML</summary>
        [LxEnumValue("input")]
        Input,

        /// <summary>Represents the value 'output' in the XML</summary>
        [LxEnumValue("output")]
        Output,
    }

    /// <summary>An enumeration representing XSD simple type entityType_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/simpleType:entityType_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>1030:3-1035:19</XsdLocation>
    [LxSimpleTypeDefinition("entityType_t", "https://admin-shell.io/aas/3/0")]
    public enum EntityType_T1Enum
    {
        /// <summary>Represents the value 'CoManagedEntity' in the XML</summary>
        [LxEnumValue("CoManagedEntity")]
        CoManagedEntity,

        /// <summary>Represents the value 'SelfManagedEntity' in the XML</summary>
        [LxEnumValue("SelfManagedEntity")]
        SelfManagedEntity,
    }

    /// <summary>An enumeration representing XSD simple type entityType_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/simpleType:entityType_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>1030:3-1035:19</XsdLocation>
    [LxSimpleTypeDefinition("entityType_t", "https://admin-shell.io/aas/3/0")]
    public enum EntityType_TEnum
    {
        /// <summary>Represents the value 'CoManagedEntity' in the XML</summary>
        [LxEnumValue("CoManagedEntity")]
        CoManagedEntity,

        /// <summary>Represents the value 'SelfManagedEntity' in the XML</summary>
        [LxEnumValue("SelfManagedEntity")]
        SelfManagedEntity,
    }

    /// <summary>An enumeration representing XSD simple type keyTypes_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/simpleType:keyTypes_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>1036:3-1063:19</XsdLocation>
    [LxSimpleTypeDefinition("keyTypes_t", "https://admin-shell.io/aas/3/0")]
    public enum KeyTypes_T1Enum
    {
        /// <summary>Represents the value 'AnnotatedRelationshipElement' in the XML</summary>
        [LxEnumValue("AnnotatedRelationshipElement")]
        AnnotatedRelationshipElement,

        /// <summary>Represents the value 'AssetAdministrationShell' in the XML</summary>
        [LxEnumValue("AssetAdministrationShell")]
        AssetAdministrationShell,

        /// <summary>Represents the value 'BasicEventElement' in the XML</summary>
        [LxEnumValue("BasicEventElement")]
        BasicEventElement,

        /// <summary>Represents the value 'Blob' in the XML</summary>
        [LxEnumValue("Blob")]
        Blob,

        /// <summary>Represents the value 'Capability' in the XML</summary>
        [LxEnumValue("Capability")]
        Capability,

        /// <summary>Represents the value 'ConceptDescription' in the XML</summary>
        [LxEnumValue("ConceptDescription")]
        ConceptDescription,

        /// <summary>Represents the value 'DataElement' in the XML</summary>
        [LxEnumValue("DataElement")]
        DataElement,

        /// <summary>Represents the value 'Entity' in the XML</summary>
        [LxEnumValue("Entity")]
        Entity,

        /// <summary>Represents the value 'EventElement' in the XML</summary>
        [LxEnumValue("EventElement")]
        EventElement,

        /// <summary>Represents the value 'File' in the XML</summary>
        [LxEnumValue("File")]
        File,

        /// <summary>Represents the value 'FragmentReference' in the XML</summary>
        [LxEnumValue("FragmentReference")]
        FragmentReference,

        /// <summary>Represents the value 'GlobalReference' in the XML</summary>
        [LxEnumValue("GlobalReference")]
        GlobalReference,

        /// <summary>Represents the value 'Identifiable' in the XML</summary>
        [LxEnumValue("Identifiable")]
        Identifiable,

        /// <summary>Represents the value 'MultiLanguageProperty' in the XML</summary>
        [LxEnumValue("MultiLanguageProperty")]
        MultiLanguageProperty,

        /// <summary>Represents the value 'Operation' in the XML</summary>
        [LxEnumValue("Operation")]
        Operation,

        /// <summary>Represents the value 'Property' in the XML</summary>
        [LxEnumValue("Property")]
        Property,

        /// <summary>Represents the value 'Range' in the XML</summary>
        [LxEnumValue("Range")]
        Range,

        /// <summary>Represents the value 'Referable' in the XML</summary>
        [LxEnumValue("Referable")]
        Referable,

        /// <summary>Represents the value 'ReferenceElement' in the XML</summary>
        [LxEnumValue("ReferenceElement")]
        ReferenceElement,

        /// <summary>Represents the value 'RelationshipElement' in the XML</summary>
        [LxEnumValue("RelationshipElement")]
        RelationshipElement,

        /// <summary>Represents the value 'Submodel' in the XML</summary>
        [LxEnumValue("Submodel")]
        Submodel,

        /// <summary>Represents the value 'SubmodelElement' in the XML</summary>
        [LxEnumValue("SubmodelElement")]
        SubmodelElement,

        /// <summary>Represents the value 'SubmodelElementCollection' in the XML</summary>
        [LxEnumValue("SubmodelElementCollection")]
        SubmodelElementCollection,

        /// <summary>Represents the value 'SubmodelElementList' in the XML</summary>
        [LxEnumValue("SubmodelElementList")]
        SubmodelElementList,
    }

    /// <summary>An enumeration representing XSD simple type keyTypes_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/simpleType:keyTypes_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>1036:3-1063:19</XsdLocation>
    [LxSimpleTypeDefinition("keyTypes_t", "https://admin-shell.io/aas/3/0")]
    public enum KeyTypes_TEnum
    {
        /// <summary>Represents the value 'AnnotatedRelationshipElement' in the XML</summary>
        [LxEnumValue("AnnotatedRelationshipElement")]
        AnnotatedRelationshipElement,

        /// <summary>Represents the value 'AssetAdministrationShell' in the XML</summary>
        [LxEnumValue("AssetAdministrationShell")]
        AssetAdministrationShell,

        /// <summary>Represents the value 'BasicEventElement' in the XML</summary>
        [LxEnumValue("BasicEventElement")]
        BasicEventElement,

        /// <summary>Represents the value 'Blob' in the XML</summary>
        [LxEnumValue("Blob")]
        Blob,

        /// <summary>Represents the value 'Capability' in the XML</summary>
        [LxEnumValue("Capability")]
        Capability,

        /// <summary>Represents the value 'ConceptDescription' in the XML</summary>
        [LxEnumValue("ConceptDescription")]
        ConceptDescription,

        /// <summary>Represents the value 'DataElement' in the XML</summary>
        [LxEnumValue("DataElement")]
        DataElement,

        /// <summary>Represents the value 'Entity' in the XML</summary>
        [LxEnumValue("Entity")]
        Entity,

        /// <summary>Represents the value 'EventElement' in the XML</summary>
        [LxEnumValue("EventElement")]
        EventElement,

        /// <summary>Represents the value 'File' in the XML</summary>
        [LxEnumValue("File")]
        File,

        /// <summary>Represents the value 'FragmentReference' in the XML</summary>
        [LxEnumValue("FragmentReference")]
        FragmentReference,

        /// <summary>Represents the value 'GlobalReference' in the XML</summary>
        [LxEnumValue("GlobalReference")]
        GlobalReference,

        /// <summary>Represents the value 'Identifiable' in the XML</summary>
        [LxEnumValue("Identifiable")]
        Identifiable,

        /// <summary>Represents the value 'MultiLanguageProperty' in the XML</summary>
        [LxEnumValue("MultiLanguageProperty")]
        MultiLanguageProperty,

        /// <summary>Represents the value 'Operation' in the XML</summary>
        [LxEnumValue("Operation")]
        Operation,

        /// <summary>Represents the value 'Property' in the XML</summary>
        [LxEnumValue("Property")]
        Property,

        /// <summary>Represents the value 'Range' in the XML</summary>
        [LxEnumValue("Range")]
        Range,

        /// <summary>Represents the value 'Referable' in the XML</summary>
        [LxEnumValue("Referable")]
        Referable,

        /// <summary>Represents the value 'ReferenceElement' in the XML</summary>
        [LxEnumValue("ReferenceElement")]
        ReferenceElement,

        /// <summary>Represents the value 'RelationshipElement' in the XML</summary>
        [LxEnumValue("RelationshipElement")]
        RelationshipElement,

        /// <summary>Represents the value 'Submodel' in the XML</summary>
        [LxEnumValue("Submodel")]
        Submodel,

        /// <summary>Represents the value 'SubmodelElement' in the XML</summary>
        [LxEnumValue("SubmodelElement")]
        SubmodelElement,

        /// <summary>Represents the value 'SubmodelElementCollection' in the XML</summary>
        [LxEnumValue("SubmodelElementCollection")]
        SubmodelElementCollection,

        /// <summary>Represents the value 'SubmodelElementList' in the XML</summary>
        [LxEnumValue("SubmodelElementList")]
        SubmodelElementList,
    }

    /// <summary>An enumeration representing XSD simple type modellingKind_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/simpleType:modellingKind_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>1064:3-1069:19</XsdLocation>
    [LxSimpleTypeDefinition("modellingKind_t", "https://admin-shell.io/aas/3/0")]
    public enum ModellingKind_T1Enum
    {
        /// <summary>Represents the value 'Template' in the XML</summary>
        [LxEnumValue("Template")]
        Template,

        /// <summary>Represents the value 'Instance' in the XML</summary>
        [LxEnumValue("Instance")]
        Instance,
    }

    /// <summary>An enumeration representing XSD simple type modellingKind_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/simpleType:modellingKind_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>1064:3-1069:19</XsdLocation>
    [LxSimpleTypeDefinition("modellingKind_t", "https://admin-shell.io/aas/3/0")]
    public enum ModellingKind_TEnum
    {
        /// <summary>Represents the value 'Template' in the XML</summary>
        [LxEnumValue("Template")]
        Template,

        /// <summary>Represents the value 'Instance' in the XML</summary>
        [LxEnumValue("Instance")]
        Instance,
    }

    /// <summary>An enumeration representing XSD simple type qualifierKind_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/simpleType:qualifierKind_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>1070:3-1076:19</XsdLocation>
    [LxSimpleTypeDefinition("qualifierKind_t", "https://admin-shell.io/aas/3/0")]
    public enum QualifierKind_T1Enum
    {
        /// <summary>Represents the value 'ValueQualifier' in the XML</summary>
        [LxEnumValue("ValueQualifier")]
        ValueQualifier,

        /// <summary>Represents the value 'ConceptQualifier' in the XML</summary>
        [LxEnumValue("ConceptQualifier")]
        ConceptQualifier,

        /// <summary>Represents the value 'TemplateQualifier' in the XML</summary>
        [LxEnumValue("TemplateQualifier")]
        TemplateQualifier,
    }

    /// <summary>An enumeration representing XSD simple type qualifierKind_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/simpleType:qualifierKind_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>1070:3-1076:19</XsdLocation>
    [LxSimpleTypeDefinition("qualifierKind_t", "https://admin-shell.io/aas/3/0")]
    public enum QualifierKind_TEnum
    {
        /// <summary>Represents the value 'ValueQualifier' in the XML</summary>
        [LxEnumValue("ValueQualifier")]
        ValueQualifier,

        /// <summary>Represents the value 'ConceptQualifier' in the XML</summary>
        [LxEnumValue("ConceptQualifier")]
        ConceptQualifier,

        /// <summary>Represents the value 'TemplateQualifier' in the XML</summary>
        [LxEnumValue("TemplateQualifier")]
        TemplateQualifier,
    }

    /// <summary>An enumeration representing XSD simple type referenceTypes_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/simpleType:referenceTypes_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>1077:3-1082:19</XsdLocation>
    [LxSimpleTypeDefinition("referenceTypes_t", "https://admin-shell.io/aas/3/0")]
    public enum ReferenceTypes_T1Enum
    {
        /// <summary>Represents the value 'ExternalReference' in the XML</summary>
        [LxEnumValue("ExternalReference")]
        ExternalReference,

        /// <summary>Represents the value 'ModelReference' in the XML</summary>
        [LxEnumValue("ModelReference")]
        ModelReference,
    }

    /// <summary>An enumeration representing XSD simple type referenceTypes_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/simpleType:referenceTypes_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>1077:3-1082:19</XsdLocation>
    [LxSimpleTypeDefinition("referenceTypes_t", "https://admin-shell.io/aas/3/0")]
    public enum ReferenceTypes_TEnum
    {
        /// <summary>Represents the value 'ExternalReference' in the XML</summary>
        [LxEnumValue("ExternalReference")]
        ExternalReference,

        /// <summary>Represents the value 'ModelReference' in the XML</summary>
        [LxEnumValue("ModelReference")]
        ModelReference,
    }

    /// <summary>An enumeration representing XSD simple type stateOfEvent_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/simpleType:stateOfEvent_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>1083:3-1088:19</XsdLocation>
    [LxSimpleTypeDefinition("stateOfEvent_t", "https://admin-shell.io/aas/3/0")]
    public enum StateOfEvent_T1Enum
    {
        /// <summary>Represents the value 'on' in the XML</summary>
        [LxEnumValue("on")]
        On,

        /// <summary>Represents the value 'off' in the XML</summary>
        [LxEnumValue("off")]
        Off,
    }

    /// <summary>An enumeration representing XSD simple type stateOfEvent_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/simpleType:stateOfEvent_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>1083:3-1088:19</XsdLocation>
    [LxSimpleTypeDefinition("stateOfEvent_t", "https://admin-shell.io/aas/3/0")]
    public enum StateOfEvent_TEnum
    {
        /// <summary>Represents the value 'on' in the XML</summary>
        [LxEnumValue("on")]
        On,

        /// <summary>Represents the value 'off' in the XML</summary>
        [LxEnumValue("off")]
        Off,
    }
    #endregion

    #region Complex Types
    /// <summary>A class representing the root XSD complexType abstractLangString_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/complexType:abstractLangString_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>1092:3-1096:20</XsdLocation>
    [LxSimpleComplexTypeDefinition("abstractLangString_t", "https://admin-shell.io/aas/3/0")]
    public partial class AbstractLangString_TCt : AasSchema.LxBase
    {
        /// <summary>A <see cref="System.String" />, Required : should not be set to null</summary>
        [LxElementValue(
            0,
            "language",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 1,
            MaxOccurs = 1,
            Pattern = "(([a-zA-Z]{2,3}(-[a-zA-Z]{3}(-[a-zA-Z]{3}){2})?|[a-zA-Z]{4}|[a-zA-Z]{5,8})(-[a-zA-Z]{4})?(-([a-zA-Z]{2}|[0-9]{3}))?(-(([a-zA-Z0-9]){5,8}|[0-9]([a-zA-Z0-9]){3}))*(-[0-9A-WY-Za-wy-z](-([a-zA-Z0-9]){2,8})+)*(-[xX](-([a-zA-Z0-9]){1,8})+)?|[xX](-([a-zA-Z0-9]){1,8})+|((en-GB-oed|i-ami|i-bnn|i-default|i-enochian|i-hak|i-klingon|i-lux|i-mingo|i-navajo|i-pwn|i-tao|i-tay|i-tsu|sgn-BE-FR|sgn-BE-NL|sgn-CH-DE)|(art-lojban|cel-gaulish|no-bok|no-nyn|zh-guoyu|zh-hakka|zh-min|zh-min-nan|zh-xiang)))"
        )]
        public System.String Language { get; set; } = "";

        /// <summary>A <see cref="System.String" />, Required : should not be set to null</summary>
        [LxElementValue(
            1,
            "text",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 1,
            MaxOccurs = 1,
            MinLength = "1"
        )]
        public System.String Text { get; set; } = "";
    }

    /// <summary>A class representing the root XSD complexType administrativeInformation_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/complexType:administrativeInformation_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>1097:3-1101:20</XsdLocation>
    [LxSimpleComplexTypeDefinition("administrativeInformation_t", "https://admin-shell.io/aas/3/0")]
    public partial class AdministrativeInformation_TCt : AasSchema.LxBase
    {
        /// <summary>A <see cref="AasSchema.Tns.AdministrativeInformation_TCt.EmbeddedDataSpecificationsElm" />, Optional : null when not set</summary>
        [LxElementRef(0, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AdministrativeInformation_TCt.EmbeddedDataSpecificationsElm? EmbeddedDataSpecifications { get; set; }

        /// <summary>A <see cref="System.String" />, Optional : null when not set</summary>
        [LxElementValue(
            1,
            "version",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 0,
            MaxOccurs = 1,
            MinLength = "1",
            MaxLength = "4",
            Pattern = "(0|[1-9][0-9]*)"
        )]
        public System.String? Version { get; set; }

        /// <summary>A <see cref="System.String" />, Optional : null when not set</summary>
        [LxElementValue(
            2,
            "revision",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 0,
            MaxOccurs = 1,
            MinLength = "1",
            MaxLength = "4",
            Pattern = "(0|[1-9][0-9]*)"
        )]
        public System.String? Revision { get; set; }

        /// <summary>
        ///   A class derived from <see cref="AasSchema.Tns.Reference_TCt" />.<br/><br/>
        ///   Allowable types are <br/>
        ///       <see cref="AasSchema.Tns.Reference_TCt" />
        /// </summary>
        [LxElementCt(3, "creator", "https://admin-shell.io/aas/3/0", MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.Reference_TCt? Creator { get; set; }

        /// <summary>A <see cref="System.String" />, Optional : null when not set</summary>
        [LxElementValue(
            4,
            "templateId",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 0,
            MaxOccurs = 1,
            MinLength = "1",
            MaxLength = "2000"
        )]
        public System.String? TemplateId { get; set; }

        /// <summary>Represent the inline xs:element embeddedDataSpecifications@https://admin-shell.io/aas/3/0.</summary>
        /// <XsdPath>schema:aas.xsd/group:hasDataSpecification/sequence/element:embeddedDataSpecifications</XsdPath>
        /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
        /// <XsdLocation>425:7-431:20</XsdLocation>
        [LxSimpleElementDefinition(
            "embeddedDataSpecifications",
            "https://admin-shell.io/aas/3/0",
            ElementScopeType.InlineElement
        )]
        public partial class EmbeddedDataSpecificationsElm : AasSchema.LxBase
        {
            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.EmbeddedDataSpecification_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.EmbeddedDataSpecification_TCt" />
            /// </summary>
            [LxElementCt(
                0,
                "embeddedDataSpecification",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.EmbeddedDataSpecification_TCt> EmbeddedDataSpecifications { get; } =
                new List<AasSchema.Tns.EmbeddedDataSpecification_TCt>();
        }
    }

    /// <summary>A class representing the root XSD complexType annotatedRelationshipElement_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/complexType:annotatedRelationshipElement_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>1102:3-1106:20</XsdLocation>
    [LxSimpleComplexTypeDefinition(
        "annotatedRelationshipElement_t",
        "https://admin-shell.io/aas/3/0"
    )]
    public partial class AnnotatedRelationshipElement_TCt : AasSchema.LxBase
    {
        /// <summary>A <see cref="AasSchema.Tns.AssetAdministrationShell_TCt.ExtensionsElm" />, Optional : null when not set</summary>
        [LxElementRef(0, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetAdministrationShell_TCt.ExtensionsElm? Extensions { get; set; }

        /// <summary>A <see cref="System.String" />, Optional : null when not set</summary>
        [LxElementValue(
            1,
            "category",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 0,
            MaxOccurs = 1,
            MinLength = "1",
            MaxLength = "128"
        )]
        public System.String? Category { get; set; }

        /// <summary>A <see cref="System.String" />, Optional : null when not set</summary>
        [LxElementValue(
            2,
            "idShort",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 0,
            MaxOccurs = 1,
            MinLength = "1",
            MaxLength = "128",
            Pattern = "[a-zA-Z][a-zA-Z0-9_]*"
        )]
        public System.String? IdShort { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.AssetAdministrationShell_TCt.DisplayNameElm" />, Optional : null when not set</summary>
        [LxElementRef(3, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetAdministrationShell_TCt.DisplayNameElm? DisplayName { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.AssetAdministrationShell_TCt.DescriptionElm" />, Optional : null when not set</summary>
        [LxElementRef(4, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetAdministrationShell_TCt.DescriptionElm? Description { get; set; }

        /// <summary>
        ///   A class derived from <see cref="AasSchema.Tns.Reference_TCt" />.<br/><br/>
        ///   Allowable types are <br/>
        ///       <see cref="AasSchema.Tns.Reference_TCt" />
        /// </summary>
        [LxElementCt(
            5,
            "semanticId",
            "https://admin-shell.io/aas/3/0",
            MinOccurs = 0,
            MaxOccurs = 1
        )]
        public AasSchema.Tns.Reference_TCt? SemanticId { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.Extension_TCt.SupplementalSemanticIdsElm" />, Optional : null when not set</summary>
        [LxElementRef(6, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.Extension_TCt.SupplementalSemanticIdsElm? SupplementalSemanticIds { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.Submodel_TCt.QualifiersElm" />, Optional : null when not set</summary>
        [LxElementRef(7, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.Submodel_TCt.QualifiersElm? Qualifiers { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.AdministrativeInformation_TCt.EmbeddedDataSpecificationsElm" />, Optional : null when not set</summary>
        [LxElementRef(8, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AdministrativeInformation_TCt.EmbeddedDataSpecificationsElm? EmbeddedDataSpecifications { get; set; }

        /// <summary>
        ///   A class derived from <see cref="AasSchema.Tns.Reference_TCt" />.<br/><br/>
        ///   Allowable types are <br/>
        ///       <see cref="AasSchema.Tns.Reference_TCt" />
        /// </summary>
        [LxElementCt(9, "first", "https://admin-shell.io/aas/3/0", MinOccurs = 1, MaxOccurs = 1)]
        public AasSchema.Tns.Reference_TCt First { get; set; } = new AasSchema.Tns.Reference_TCt();

        /// <summary>
        ///   A class derived from <see cref="AasSchema.Tns.Reference_TCt" />.<br/><br/>
        ///   Allowable types are <br/>
        ///       <see cref="AasSchema.Tns.Reference_TCt" />
        /// </summary>
        [LxElementCt(10, "second", "https://admin-shell.io/aas/3/0", MinOccurs = 1, MaxOccurs = 1)]
        public AasSchema.Tns.Reference_TCt Second { get; set; } = new AasSchema.Tns.Reference_TCt();

        /// <summary>A <see cref="AasSchema.Tns.AnnotatedRelationshipElement_TCt.AnnotationsElm" />, Optional : null when not set</summary>
        [LxElementRef(11, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AnnotatedRelationshipElement_TCt.AnnotationsElm? Annotations { get; set; }

        /// <summary>Represent the inline xs:element annotations@https://admin-shell.io/aas/3/0.</summary>
        /// <XsdPath>schema:aas.xsd/group:annotatedRelationshipElement/sequence/element:annotations</XsdPath>
        /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
        /// <XsdLocation>65:7-71:20</XsdLocation>
        [LxSimpleElementDefinition(
            "annotations",
            "https://admin-shell.io/aas/3/0",
            ElementScopeType.InlineElement
        )]
        public partial class AnnotationsElm : AasSchema.LxBase
        {
            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.Blob_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.Blob_TCt" />
            /// </summary>
            [LxElementCt(
                0,
                "blob",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.Blob_TCt> Blobs { get; } = new List<AasSchema.Tns.Blob_TCt>();

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.File_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.File_TCt" />
            /// </summary>
            [LxElementCt(
                1,
                "file",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.File_TCt> Files { get; } = new List<AasSchema.Tns.File_TCt>();

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.MultiLanguageProperty_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.MultiLanguageProperty_TCt" />
            /// </summary>
            [LxElementCt(
                2,
                "multiLanguageProperty",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.MultiLanguageProperty_TCt> MultiLanguageProperties { get; } =
                new List<AasSchema.Tns.MultiLanguageProperty_TCt>();

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.Property_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.Property_TCt" />
            /// </summary>
            [LxElementCt(
                3,
                "property",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.Property_TCt> Properties { get; } =
                new List<AasSchema.Tns.Property_TCt>();

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.Range_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.Range_TCt" />
            /// </summary>
            [LxElementCt(
                4,
                "range",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.Range_TCt> Ranges { get; } =
                new List<AasSchema.Tns.Range_TCt>();

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.ReferenceElement_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.ReferenceElement_TCt" />
            /// </summary>
            [LxElementCt(
                5,
                "referenceElement",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.ReferenceElement_TCt> ReferenceElements { get; } =
                new List<AasSchema.Tns.ReferenceElement_TCt>();
        }
    }

    /// <summary>A class representing the root XSD complexType assetAdministrationShell_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/complexType:assetAdministrationShell_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>1107:3-1111:20</XsdLocation>
    [LxSimpleComplexTypeDefinition("assetAdministrationShell_t", "https://admin-shell.io/aas/3/0")]
    public partial class AssetAdministrationShell_TCt : AasSchema.LxBase
    {
        /// <summary>A <see cref="AasSchema.Tns.AssetAdministrationShell_TCt.ExtensionsElm" />, Optional : null when not set</summary>
        [LxElementRef(0, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetAdministrationShell_TCt.ExtensionsElm? Extensions { get; set; }

        /// <summary>A <see cref="System.String" />, Optional : null when not set</summary>
        [LxElementValue(
            1,
            "category",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 0,
            MaxOccurs = 1,
            MinLength = "1",
            MaxLength = "128"
        )]
        public System.String? Category { get; set; }

        /// <summary>A <see cref="System.String" />, Optional : null when not set</summary>
        [LxElementValue(
            2,
            "idShort",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 0,
            MaxOccurs = 1,
            MinLength = "1",
            MaxLength = "128",
            Pattern = "[a-zA-Z][a-zA-Z0-9_]*"
        )]
        public System.String? IdShort { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.AssetAdministrationShell_TCt.DisplayNameElm" />, Optional : null when not set</summary>
        [LxElementRef(3, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetAdministrationShell_TCt.DisplayNameElm? DisplayName { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.AssetAdministrationShell_TCt.DescriptionElm" />, Optional : null when not set</summary>
        [LxElementRef(4, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetAdministrationShell_TCt.DescriptionElm? Description { get; set; }

        /// <summary>
        ///   A class derived from <see cref="AasSchema.Tns.AdministrativeInformation_TCt" />.<br/><br/>
        ///   Allowable types are <br/>
        ///       <see cref="AasSchema.Tns.AdministrativeInformation_TCt" />
        /// </summary>
        [LxElementCt(
            5,
            "administration",
            "https://admin-shell.io/aas/3/0",
            MinOccurs = 0,
            MaxOccurs = 1
        )]
        public AasSchema.Tns.AdministrativeInformation_TCt? Administration { get; set; }

        /// <summary>A <see cref="System.String" />, Required : should not be set to null</summary>
        [LxElementValue(
            6,
            "id",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 1,
            MaxOccurs = 1,
            MinLength = "1",
            MaxLength = "2000"
        )]
        public System.String Id { get; set; } = "";

        /// <summary>A <see cref="AasSchema.Tns.AdministrativeInformation_TCt.EmbeddedDataSpecificationsElm" />, Optional : null when not set</summary>
        [LxElementRef(7, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AdministrativeInformation_TCt.EmbeddedDataSpecificationsElm? EmbeddedDataSpecifications { get; set; }

        /// <summary>
        ///   A class derived from <see cref="AasSchema.Tns.Reference_TCt" />.<br/><br/>
        ///   Allowable types are <br/>
        ///       <see cref="AasSchema.Tns.Reference_TCt" />
        /// </summary>
        [LxElementCt(
            8,
            "derivedFrom",
            "https://admin-shell.io/aas/3/0",
            MinOccurs = 0,
            MaxOccurs = 1
        )]
        public AasSchema.Tns.Reference_TCt? DerivedFrom { get; set; }

        /// <summary>
        ///   A class derived from <see cref="AasSchema.Tns.AssetInformation_TCt" />.<br/><br/>
        ///   Allowable types are <br/>
        ///       <see cref="AasSchema.Tns.AssetInformation_TCt" />
        /// </summary>
        [LxElementCt(
            9,
            "assetInformation",
            "https://admin-shell.io/aas/3/0",
            MinOccurs = 1,
            MaxOccurs = 1
        )]
        public AasSchema.Tns.AssetInformation_TCt AssetInformation { get; set; } =
            new AasSchema.Tns.AssetInformation_TCt();

        /// <summary>A <see cref="AasSchema.Tns.AssetAdministrationShell_TCt.SubmodelsElm" />, Optional : null when not set</summary>
        [LxElementRef(10, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetAdministrationShell_TCt.SubmodelsElm? Submodels { get; set; }

        /// <summary>Represent the inline xs:element extensions@https://admin-shell.io/aas/3/0.</summary>
        /// <XsdPath>schema:aas.xsd/group:hasExtensions/sequence/element:extensions</XsdPath>
        /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
        /// <XsdLocation>458:7-464:20</XsdLocation>
        [LxSimpleElementDefinition(
            "extensions",
            "https://admin-shell.io/aas/3/0",
            ElementScopeType.InlineElement
        )]
        public partial class ExtensionsElm : AasSchema.LxBase
        {
            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.Extension_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.Extension_TCt" />
            /// </summary>
            [LxElementCt(
                0,
                "extension",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.Extension_TCt> Extensions { get; } =
                new List<AasSchema.Tns.Extension_TCt>();
        }

        /// <summary>Represent the inline xs:element displayName@https://admin-shell.io/aas/3/0.</summary>
        /// <XsdPath>schema:aas.xsd/group:referable/sequence/element:displayName</XsdPath>
        /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
        /// <XsdLocation>732:7-738:20</XsdLocation>
        [LxSimpleElementDefinition(
            "displayName",
            "https://admin-shell.io/aas/3/0",
            ElementScopeType.InlineElement
        )]
        public partial class DisplayNameElm : AasSchema.LxBase
        {
            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.LangStringNameType_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.LangStringNameType_TCt" />
            /// </summary>
            [LxElementCt(
                0,
                "langStringNameType",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.LangStringNameType_TCt> LangStringNameTypes { get; } =
                new List<AasSchema.Tns.LangStringNameType_TCt>();
        }

        /// <summary>Represent the inline xs:element description@https://admin-shell.io/aas/3/0.</summary>
        /// <XsdPath>schema:aas.xsd/group:referable/sequence/element:description</XsdPath>
        /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
        /// <XsdLocation>739:7-745:20</XsdLocation>
        [LxSimpleElementDefinition(
            "description",
            "https://admin-shell.io/aas/3/0",
            ElementScopeType.InlineElement
        )]
        public partial class DescriptionElm : AasSchema.LxBase
        {
            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.LangStringTextType_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.LangStringTextType_TCt" />
            /// </summary>
            [LxElementCt(
                0,
                "langStringTextType",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.LangStringTextType_TCt> LangStringTextTypes { get; } =
                new List<AasSchema.Tns.LangStringTextType_TCt>();
        }

        /// <summary>Represent the inline xs:element submodels@https://admin-shell.io/aas/3/0.</summary>
        /// <XsdPath>schema:aas.xsd/group:assetAdministrationShell/sequence/element:submodels</XsdPath>
        /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
        /// <XsdLocation>80:7-86:20</XsdLocation>
        [LxSimpleElementDefinition(
            "submodels",
            "https://admin-shell.io/aas/3/0",
            ElementScopeType.InlineElement
        )]
        public partial class SubmodelsElm : AasSchema.LxBase
        {
            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.Reference_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.Reference_TCt" />
            /// </summary>
            [LxElementCt(
                0,
                "reference",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.Reference_TCt> References { get; } =
                new List<AasSchema.Tns.Reference_TCt>();
        }
    }

    /// <summary>A class representing the root XSD complexType assetInformation_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/complexType:assetInformation_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>1112:3-1116:20</XsdLocation>
    [LxSimpleComplexTypeDefinition("assetInformation_t", "https://admin-shell.io/aas/3/0")]
    public partial class AssetInformation_TCt : AasSchema.LxBase
    {
        /// <summary>A <see cref="AasSchema.Tns.AssetKind_T1Enum" />, Required</summary>
        [LxElementValue(
            0,
            "assetKind",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Enum,
            XsdType.Enum,
            MinOccurs = 1,
            MaxOccurs = 1,
            WhiteSpace = WhiteSpaceType.Preserve
        )]
        public AasSchema.Tns.AssetKind_T1Enum AssetKind { get; set; }

        /// <summary>A <see cref="System.String" />, Optional : null when not set</summary>
        [LxElementValue(
            1,
            "globalAssetId",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 0,
            MaxOccurs = 1,
            MinLength = "1",
            MaxLength = "2000"
        )]
        public System.String? GlobalAssetId { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.AssetInformation_TCt.SpecificAssetIdsElm" />, Optional : null when not set</summary>
        [LxElementRef(2, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetInformation_TCt.SpecificAssetIdsElm? SpecificAssetIds { get; set; }

        /// <summary>A <see cref="System.String" />, Optional : null when not set</summary>
        [LxElementValue(
            3,
            "assetType",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 0,
            MaxOccurs = 1,
            MinLength = "1",
            MaxLength = "2000"
        )]
        public System.String? AssetType { get; set; }

        /// <summary>
        ///   A class derived from <see cref="AasSchema.Tns.Resource_TCt" />.<br/><br/>
        ///   Allowable types are <br/>
        ///       <see cref="AasSchema.Tns.Resource_TCt" />
        /// </summary>
        [LxElementCt(
            4,
            "defaultThumbnail",
            "https://admin-shell.io/aas/3/0",
            MinOccurs = 0,
            MaxOccurs = 1
        )]
        public AasSchema.Tns.Resource_TCt? DefaultThumbnail { get; set; }

        /// <summary>Represent the inline xs:element specificAssetIds@https://admin-shell.io/aas/3/0.</summary>
        /// <XsdPath>schema:aas.xsd/group:assetInformation/sequence/element:specificAssetIds</XsdPath>
        /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
        /// <XsdLocation>100:7-106:20</XsdLocation>
        [LxSimpleElementDefinition(
            "specificAssetIds",
            "https://admin-shell.io/aas/3/0",
            ElementScopeType.InlineElement
        )]
        public partial class SpecificAssetIdsElm : AasSchema.LxBase
        {
            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.SpecificAssetId_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.SpecificAssetId_TCt" />
            /// </summary>
            [LxElementCt(
                0,
                "specificAssetId",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.SpecificAssetId_TCt> SpecificAssetIds { get; } =
                new List<AasSchema.Tns.SpecificAssetId_TCt>();
        }
    }

    /// <summary>A class representing the root XSD complexType basicEventElement_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/complexType:basicEventElement_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>1117:3-1121:20</XsdLocation>
    [LxSimpleComplexTypeDefinition("basicEventElement_t", "https://admin-shell.io/aas/3/0")]
    public partial class BasicEventElement_TCt : AasSchema.LxBase
    {
        /// <summary>A <see cref="AasSchema.Tns.AssetAdministrationShell_TCt.ExtensionsElm" />, Optional : null when not set</summary>
        [LxElementRef(0, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetAdministrationShell_TCt.ExtensionsElm? Extensions { get; set; }

        /// <summary>A <see cref="System.String" />, Optional : null when not set</summary>
        [LxElementValue(
            1,
            "category",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 0,
            MaxOccurs = 1,
            MinLength = "1",
            MaxLength = "128"
        )]
        public System.String? Category { get; set; }

        /// <summary>A <see cref="System.String" />, Optional : null when not set</summary>
        [LxElementValue(
            2,
            "idShort",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 0,
            MaxOccurs = 1,
            MinLength = "1",
            MaxLength = "128",
            Pattern = "[a-zA-Z][a-zA-Z0-9_]*"
        )]
        public System.String? IdShort { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.AssetAdministrationShell_TCt.DisplayNameElm" />, Optional : null when not set</summary>
        [LxElementRef(3, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetAdministrationShell_TCt.DisplayNameElm? DisplayName { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.AssetAdministrationShell_TCt.DescriptionElm" />, Optional : null when not set</summary>
        [LxElementRef(4, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetAdministrationShell_TCt.DescriptionElm? Description { get; set; }

        /// <summary>
        ///   A class derived from <see cref="AasSchema.Tns.Reference_TCt" />.<br/><br/>
        ///   Allowable types are <br/>
        ///       <see cref="AasSchema.Tns.Reference_TCt" />
        /// </summary>
        [LxElementCt(
            5,
            "semanticId",
            "https://admin-shell.io/aas/3/0",
            MinOccurs = 0,
            MaxOccurs = 1
        )]
        public AasSchema.Tns.Reference_TCt? SemanticId { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.Extension_TCt.SupplementalSemanticIdsElm" />, Optional : null when not set</summary>
        [LxElementRef(6, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.Extension_TCt.SupplementalSemanticIdsElm? SupplementalSemanticIds { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.Submodel_TCt.QualifiersElm" />, Optional : null when not set</summary>
        [LxElementRef(7, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.Submodel_TCt.QualifiersElm? Qualifiers { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.AdministrativeInformation_TCt.EmbeddedDataSpecificationsElm" />, Optional : null when not set</summary>
        [LxElementRef(8, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AdministrativeInformation_TCt.EmbeddedDataSpecificationsElm? EmbeddedDataSpecifications { get; set; }

        /// <summary>
        ///   A class derived from <see cref="AasSchema.Tns.Reference_TCt" />.<br/><br/>
        ///   Allowable types are <br/>
        ///       <see cref="AasSchema.Tns.Reference_TCt" />
        /// </summary>
        [LxElementCt(9, "observed", "https://admin-shell.io/aas/3/0", MinOccurs = 1, MaxOccurs = 1)]
        public AasSchema.Tns.Reference_TCt Observed { get; set; } =
            new AasSchema.Tns.Reference_TCt();

        /// <summary>A <see cref="AasSchema.Tns.Direction_T1Enum" />, Required</summary>
        [LxElementValue(
            10,
            "direction",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Enum,
            XsdType.Enum,
            MinOccurs = 1,
            MaxOccurs = 1,
            WhiteSpace = WhiteSpaceType.Preserve
        )]
        public AasSchema.Tns.Direction_T1Enum Direction { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.StateOfEvent_T1Enum" />, Required</summary>
        [LxElementValue(
            11,
            "state",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Enum,
            XsdType.Enum,
            MinOccurs = 1,
            MaxOccurs = 1,
            WhiteSpace = WhiteSpaceType.Preserve
        )]
        public AasSchema.Tns.StateOfEvent_T1Enum State { get; set; }

        /// <summary>A <see cref="System.String" />, Optional : null when not set</summary>
        [LxElementValue(
            12,
            "messageTopic",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 0,
            MaxOccurs = 1,
            MinLength = "1",
            MaxLength = "255"
        )]
        public System.String? MessageTopic { get; set; }

        /// <summary>
        ///   A class derived from <see cref="AasSchema.Tns.Reference_TCt" />.<br/><br/>
        ///   Allowable types are <br/>
        ///       <see cref="AasSchema.Tns.Reference_TCt" />
        /// </summary>
        [LxElementCt(
            13,
            "messageBroker",
            "https://admin-shell.io/aas/3/0",
            MinOccurs = 0,
            MaxOccurs = 1
        )]
        public AasSchema.Tns.Reference_TCt? MessageBroker { get; set; }

        /// <summary>A <see cref="System.String" />, Optional : null when not set</summary>
        [LxElementValue(
            14,
            "lastUpdate",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 0,
            MaxOccurs = 1,
            Pattern = "-?(([1-9][0-9][0-9][0-9]+)|(0[0-9][0-9][0-9]))-((0[1-9])|(1[0-2]))-((0[1-9])|([12][0-9])|(3[01]))T(((([01][0-9])|(2[0-3])):[0-5][0-9]:([0-5][0-9])(\\.[0-9]+)?)|24:00:00(\\.0+)?)(Z|\\+00:00|-00:00)"
        )]
        public System.String? LastUpdate { get; set; }

        /// <summary>A <see cref="System.String" />, Optional : null when not set</summary>
        [LxElementValue(
            15,
            "minInterval",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 0,
            MaxOccurs = 1,
            Pattern = "-?P((([0-9]+Y([0-9]+M)?([0-9]+D)?|([0-9]+M)([0-9]+D)?|([0-9]+D))(T(([0-9]+H)([0-9]+M)?([0-9]+(\\.[0-9]+)?S)?|([0-9]+M)([0-9]+(\\.[0-9]+)?S)?|([0-9]+(\\.[0-9]+)?S)))?)|(T(([0-9]+H)([0-9]+M)?([0-9]+(\\.[0-9]+)?S)?|([0-9]+M)([0-9]+(\\.[0-9]+)?S)?|([0-9]+(\\.[0-9]+)?S))))"
        )]
        public System.String? MinInterval { get; set; }

        /// <summary>A <see cref="System.String" />, Optional : null when not set</summary>
        [LxElementValue(
            16,
            "maxInterval",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 0,
            MaxOccurs = 1,
            Pattern = "-?P((([0-9]+Y([0-9]+M)?([0-9]+D)?|([0-9]+M)([0-9]+D)?|([0-9]+D))(T(([0-9]+H)([0-9]+M)?([0-9]+(\\.[0-9]+)?S)?|([0-9]+M)([0-9]+(\\.[0-9]+)?S)?|([0-9]+(\\.[0-9]+)?S)))?)|(T(([0-9]+H)([0-9]+M)?([0-9]+(\\.[0-9]+)?S)?|([0-9]+M)([0-9]+(\\.[0-9]+)?S)?|([0-9]+(\\.[0-9]+)?S))))"
        )]
        public System.String? MaxInterval { get; set; }
    }

    /// <summary>A class representing the root XSD complexType blob_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/complexType:blob_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>1122:3-1126:20</XsdLocation>
    [LxSimpleComplexTypeDefinition("blob_t", "https://admin-shell.io/aas/3/0")]
    public partial class Blob_TCt : AasSchema.LxBase
    {
        /// <summary>A <see cref="AasSchema.Tns.AssetAdministrationShell_TCt.ExtensionsElm" />, Optional : null when not set</summary>
        [LxElementRef(0, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetAdministrationShell_TCt.ExtensionsElm? Extensions { get; set; }

        /// <summary>A <see cref="System.String" />, Optional : null when not set</summary>
        [LxElementValue(
            1,
            "category",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 0,
            MaxOccurs = 1,
            MinLength = "1",
            MaxLength = "128"
        )]
        public System.String? Category { get; set; }

        /// <summary>A <see cref="System.String" />, Optional : null when not set</summary>
        [LxElementValue(
            2,
            "idShort",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 0,
            MaxOccurs = 1,
            MinLength = "1",
            MaxLength = "128",
            Pattern = "[a-zA-Z][a-zA-Z0-9_]*"
        )]
        public System.String? IdShort { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.AssetAdministrationShell_TCt.DisplayNameElm" />, Optional : null when not set</summary>
        [LxElementRef(3, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetAdministrationShell_TCt.DisplayNameElm? DisplayName { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.AssetAdministrationShell_TCt.DescriptionElm" />, Optional : null when not set</summary>
        [LxElementRef(4, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetAdministrationShell_TCt.DescriptionElm? Description { get; set; }

        /// <summary>
        ///   A class derived from <see cref="AasSchema.Tns.Reference_TCt" />.<br/><br/>
        ///   Allowable types are <br/>
        ///       <see cref="AasSchema.Tns.Reference_TCt" />
        /// </summary>
        [LxElementCt(
            5,
            "semanticId",
            "https://admin-shell.io/aas/3/0",
            MinOccurs = 0,
            MaxOccurs = 1
        )]
        public AasSchema.Tns.Reference_TCt? SemanticId { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.Extension_TCt.SupplementalSemanticIdsElm" />, Optional : null when not set</summary>
        [LxElementRef(6, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.Extension_TCt.SupplementalSemanticIdsElm? SupplementalSemanticIds { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.Submodel_TCt.QualifiersElm" />, Optional : null when not set</summary>
        [LxElementRef(7, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.Submodel_TCt.QualifiersElm? Qualifiers { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.AdministrativeInformation_TCt.EmbeddedDataSpecificationsElm" />, Optional : null when not set</summary>
        [LxElementRef(8, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AdministrativeInformation_TCt.EmbeddedDataSpecificationsElm? EmbeddedDataSpecifications { get; set; }

        /// <summary>A <see cref="System.Byte" />[], Optional : null when not set</summary>
        [LxElementValue(
            9,
            "value",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdBase64Binary,
            MinOccurs = 0,
            MaxOccurs = 1
        )]
        public System.Byte[]? Value1 { get; set; }

        /// <summary>A <see cref="System.String" />, Required : should not be set to null</summary>
        [LxElementValue(
            10,
            "contentType",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 1,
            MaxOccurs = 1,
            MinLength = "1",
            MaxLength = "100",
            Pattern = "([!#$%&'*+\\-.^_`|~0-9a-zA-Z])+/([!#$%&'*+\\-.^_`|~0-9a-zA-Z])+([ \\t]*;[ \\t]*([!#$%&'*+\\-.^_`|~0-9a-zA-Z])+=(([!#$%&'*+\\-.^_`|~0-9a-zA-Z])+|\"(([\\t !#-\\[\\]-~]|[-ÿ])|\\\\([\\t !-~]|[-ÿ]))*\"))*"
        )]
        public System.String ContentType { get; set; } = "";
    }

    /// <summary>A class representing the root XSD complexType capability_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/complexType:capability_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>1127:3-1131:20</XsdLocation>
    [LxSimpleComplexTypeDefinition("capability_t", "https://admin-shell.io/aas/3/0")]
    public partial class Capability_TCt : AasSchema.LxBase
    {
        /// <summary>A <see cref="AasSchema.Tns.AssetAdministrationShell_TCt.ExtensionsElm" />, Optional : null when not set</summary>
        [LxElementRef(0, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetAdministrationShell_TCt.ExtensionsElm? Extensions { get; set; }

        /// <summary>A <see cref="System.String" />, Optional : null when not set</summary>
        [LxElementValue(
            1,
            "category",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 0,
            MaxOccurs = 1,
            MinLength = "1",
            MaxLength = "128"
        )]
        public System.String? Category { get; set; }

        /// <summary>A <see cref="System.String" />, Optional : null when not set</summary>
        [LxElementValue(
            2,
            "idShort",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 0,
            MaxOccurs = 1,
            MinLength = "1",
            MaxLength = "128",
            Pattern = "[a-zA-Z][a-zA-Z0-9_]*"
        )]
        public System.String? IdShort { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.AssetAdministrationShell_TCt.DisplayNameElm" />, Optional : null when not set</summary>
        [LxElementRef(3, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetAdministrationShell_TCt.DisplayNameElm? DisplayName { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.AssetAdministrationShell_TCt.DescriptionElm" />, Optional : null when not set</summary>
        [LxElementRef(4, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetAdministrationShell_TCt.DescriptionElm? Description { get; set; }

        /// <summary>
        ///   A class derived from <see cref="AasSchema.Tns.Reference_TCt" />.<br/><br/>
        ///   Allowable types are <br/>
        ///       <see cref="AasSchema.Tns.Reference_TCt" />
        /// </summary>
        [LxElementCt(
            5,
            "semanticId",
            "https://admin-shell.io/aas/3/0",
            MinOccurs = 0,
            MaxOccurs = 1
        )]
        public AasSchema.Tns.Reference_TCt? SemanticId { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.Extension_TCt.SupplementalSemanticIdsElm" />, Optional : null when not set</summary>
        [LxElementRef(6, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.Extension_TCt.SupplementalSemanticIdsElm? SupplementalSemanticIds { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.Submodel_TCt.QualifiersElm" />, Optional : null when not set</summary>
        [LxElementRef(7, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.Submodel_TCt.QualifiersElm? Qualifiers { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.AdministrativeInformation_TCt.EmbeddedDataSpecificationsElm" />, Optional : null when not set</summary>
        [LxElementRef(8, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AdministrativeInformation_TCt.EmbeddedDataSpecificationsElm? EmbeddedDataSpecifications { get; set; }
    }

    /// <summary>A class representing the root XSD complexType conceptDescription_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/complexType:conceptDescription_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>1132:3-1136:20</XsdLocation>
    [LxSimpleComplexTypeDefinition("conceptDescription_t", "https://admin-shell.io/aas/3/0")]
    public partial class ConceptDescription_TCt : AasSchema.LxBase
    {
        /// <summary>A <see cref="AasSchema.Tns.AssetAdministrationShell_TCt.ExtensionsElm" />, Optional : null when not set</summary>
        [LxElementRef(0, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetAdministrationShell_TCt.ExtensionsElm? Extensions { get; set; }

        /// <summary>A <see cref="System.String" />, Optional : null when not set</summary>
        [LxElementValue(
            1,
            "category",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 0,
            MaxOccurs = 1,
            MinLength = "1",
            MaxLength = "128"
        )]
        public System.String? Category { get; set; }

        /// <summary>A <see cref="System.String" />, Optional : null when not set</summary>
        [LxElementValue(
            2,
            "idShort",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 0,
            MaxOccurs = 1,
            MinLength = "1",
            MaxLength = "128",
            Pattern = "[a-zA-Z][a-zA-Z0-9_]*"
        )]
        public System.String? IdShort { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.AssetAdministrationShell_TCt.DisplayNameElm" />, Optional : null when not set</summary>
        [LxElementRef(3, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetAdministrationShell_TCt.DisplayNameElm? DisplayName { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.AssetAdministrationShell_TCt.DescriptionElm" />, Optional : null when not set</summary>
        [LxElementRef(4, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetAdministrationShell_TCt.DescriptionElm? Description { get; set; }

        /// <summary>
        ///   A class derived from <see cref="AasSchema.Tns.AdministrativeInformation_TCt" />.<br/><br/>
        ///   Allowable types are <br/>
        ///       <see cref="AasSchema.Tns.AdministrativeInformation_TCt" />
        /// </summary>
        [LxElementCt(
            5,
            "administration",
            "https://admin-shell.io/aas/3/0",
            MinOccurs = 0,
            MaxOccurs = 1
        )]
        public AasSchema.Tns.AdministrativeInformation_TCt? Administration { get; set; }

        /// <summary>A <see cref="System.String" />, Required : should not be set to null</summary>
        [LxElementValue(
            6,
            "id",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 1,
            MaxOccurs = 1,
            MinLength = "1",
            MaxLength = "2000"
        )]
        public System.String Id { get; set; } = "";

        /// <summary>A <see cref="AasSchema.Tns.AdministrativeInformation_TCt.EmbeddedDataSpecificationsElm" />, Optional : null when not set</summary>
        [LxElementRef(7, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AdministrativeInformation_TCt.EmbeddedDataSpecificationsElm? EmbeddedDataSpecifications { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.ConceptDescription_TCt.IsCaseOfElm" />, Optional : null when not set</summary>
        [LxElementRef(8, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.ConceptDescription_TCt.IsCaseOfElm? IsCaseOf { get; set; }

        /// <summary>Represent the inline xs:element isCaseOf@https://admin-shell.io/aas/3/0.</summary>
        /// <XsdPath>schema:aas.xsd/group:conceptDescription/sequence/element:isCaseOf</XsdPath>
        /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
        /// <XsdLocation>180:7-186:20</XsdLocation>
        [LxSimpleElementDefinition(
            "isCaseOf",
            "https://admin-shell.io/aas/3/0",
            ElementScopeType.InlineElement
        )]
        public partial class IsCaseOfElm : AasSchema.LxBase
        {
            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.Reference_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.Reference_TCt" />
            /// </summary>
            [LxElementCt(
                0,
                "reference",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.Reference_TCt> References { get; } =
                new List<AasSchema.Tns.Reference_TCt>();
        }
    }

    /// <summary>A class representing the root XSD complexType dataElement_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/complexType:dataElement_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>1137:3-1141:20</XsdLocation>
    [LxSimpleComplexTypeDefinition("dataElement_t", "https://admin-shell.io/aas/3/0")]
    public partial class DataElement_TCt : AasSchema.LxBase
    {
        /// <summary>A <see cref="AasSchema.Tns.AssetAdministrationShell_TCt.ExtensionsElm" />, Optional : null when not set</summary>
        [LxElementRef(0, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetAdministrationShell_TCt.ExtensionsElm? Extensions { get; set; }

        /// <summary>A <see cref="System.String" />, Optional : null when not set</summary>
        [LxElementValue(
            1,
            "category",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 0,
            MaxOccurs = 1,
            MinLength = "1",
            MaxLength = "128"
        )]
        public System.String? Category { get; set; }

        /// <summary>A <see cref="System.String" />, Optional : null when not set</summary>
        [LxElementValue(
            2,
            "idShort",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 0,
            MaxOccurs = 1,
            MinLength = "1",
            MaxLength = "128",
            Pattern = "[a-zA-Z][a-zA-Z0-9_]*"
        )]
        public System.String? IdShort { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.AssetAdministrationShell_TCt.DisplayNameElm" />, Optional : null when not set</summary>
        [LxElementRef(3, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetAdministrationShell_TCt.DisplayNameElm? DisplayName { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.AssetAdministrationShell_TCt.DescriptionElm" />, Optional : null when not set</summary>
        [LxElementRef(4, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetAdministrationShell_TCt.DescriptionElm? Description { get; set; }

        /// <summary>
        ///   A class derived from <see cref="AasSchema.Tns.Reference_TCt" />.<br/><br/>
        ///   Allowable types are <br/>
        ///       <see cref="AasSchema.Tns.Reference_TCt" />
        /// </summary>
        [LxElementCt(
            5,
            "semanticId",
            "https://admin-shell.io/aas/3/0",
            MinOccurs = 0,
            MaxOccurs = 1
        )]
        public AasSchema.Tns.Reference_TCt? SemanticId { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.Extension_TCt.SupplementalSemanticIdsElm" />, Optional : null when not set</summary>
        [LxElementRef(6, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.Extension_TCt.SupplementalSemanticIdsElm? SupplementalSemanticIds { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.Submodel_TCt.QualifiersElm" />, Optional : null when not set</summary>
        [LxElementRef(7, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.Submodel_TCt.QualifiersElm? Qualifiers { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.AdministrativeInformation_TCt.EmbeddedDataSpecificationsElm" />, Optional : null when not set</summary>
        [LxElementRef(8, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AdministrativeInformation_TCt.EmbeddedDataSpecificationsElm? EmbeddedDataSpecifications { get; set; }
    }

    /// <summary>A class representing the root XSD complexType dataSpecificationContent_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/complexType:dataSpecificationContent_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>1142:3-1146:20</XsdLocation>
    [LxSimpleComplexTypeDefinition("dataSpecificationContent_t", "https://admin-shell.io/aas/3/0")]
    public partial class DataSpecificationContent_TCt : AasSchema.LxBase { }

    /// <summary>A class representing the root XSD complexType dataSpecificationIec61360_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/complexType:dataSpecificationIec61360_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>1147:3-1151:20</XsdLocation>
    [LxSimpleComplexTypeDefinition("dataSpecificationIec61360_t", "https://admin-shell.io/aas/3/0")]
    public partial class DataSpecificationIec61360_TCt : AasSchema.LxBase
    {
        /// <summary>A <see cref="AasSchema.Tns.DataSpecificationIec61360_TCt.PreferredNameElm" />, Required : should not be set to null</summary>
        [LxElementRef(0, MinOccurs = 1, MaxOccurs = 1)]
        public AasSchema.Tns.DataSpecificationIec61360_TCt.PreferredNameElm PreferredName { get; set; } =
            new AasSchema.Tns.DataSpecificationIec61360_TCt.PreferredNameElm();

        /// <summary>A <see cref="AasSchema.Tns.DataSpecificationIec61360_TCt.ShortNameElm" />, Optional : null when not set</summary>
        [LxElementRef(1, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.DataSpecificationIec61360_TCt.ShortNameElm? ShortName { get; set; }

        /// <summary>A <see cref="System.String" />, Optional : null when not set</summary>
        [LxElementValue(
            2,
            "unit",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 0,
            MaxOccurs = 1,
            MinLength = "1"
        )]
        public System.String? Unit { get; set; }

        /// <summary>
        ///   A class derived from <see cref="AasSchema.Tns.Reference_TCt" />.<br/><br/>
        ///   Allowable types are <br/>
        ///       <see cref="AasSchema.Tns.Reference_TCt" />
        /// </summary>
        [LxElementCt(3, "unitId", "https://admin-shell.io/aas/3/0", MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.Reference_TCt? UnitId { get; set; }

        /// <summary>A <see cref="System.String" />, Optional : null when not set</summary>
        [LxElementValue(
            4,
            "sourceOfDefinition",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 0,
            MaxOccurs = 1,
            MinLength = "1"
        )]
        public System.String? SourceOfDefinition { get; set; }

        /// <summary>A <see cref="System.String" />, Optional : null when not set</summary>
        [LxElementValue(
            5,
            "symbol",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 0,
            MaxOccurs = 1,
            MinLength = "1"
        )]
        public System.String? Symbol { get; set; }

        /// <summary>A nullable <see cref="AasSchema.Tns.DataTypeIec61360_T1Enum" />, Optional : null when not set</summary>
        [LxElementValue(
            6,
            "dataType",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Enum,
            XsdType.Enum,
            MinOccurs = 0,
            MaxOccurs = 1,
            WhiteSpace = WhiteSpaceType.Preserve
        )]
        public AasSchema.Tns.DataTypeIec61360_T1Enum? DataType { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.DataSpecificationIec61360_TCt.DefinitionElm" />, Optional : null when not set</summary>
        [LxElementRef(7, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.DataSpecificationIec61360_TCt.DefinitionElm? Definition { get; set; }

        /// <summary>A <see cref="System.String" />, Optional : null when not set</summary>
        [LxElementValue(
            8,
            "valueFormat",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 0,
            MaxOccurs = 1,
            MinLength = "1"
        )]
        public System.String? ValueFormat { get; set; }

        /// <summary>
        ///   A class derived from <see cref="AasSchema.Tns.ValueList_TCt" />.<br/><br/>
        ///   Allowable types are <br/>
        ///       <see cref="AasSchema.Tns.ValueList_TCt" />
        /// </summary>
        [LxElementCt(
            9,
            "valueList",
            "https://admin-shell.io/aas/3/0",
            MinOccurs = 0,
            MaxOccurs = 1
        )]
        public AasSchema.Tns.ValueList_TCt? ValueList { get; set; }

        /// <summary>A <see cref="System.String" />, Optional : null when not set</summary>
        [LxElementValue(
            10,
            "value",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 0,
            MaxOccurs = 1,
            MinLength = "1",
            MaxLength = "2000"
        )]
        public System.String? Value1 { get; set; }

        /// <summary>
        ///   A class derived from <see cref="AasSchema.Tns.LevelType_TCt" />.<br/><br/>
        ///   Allowable types are <br/>
        ///       <see cref="AasSchema.Tns.LevelType_TCt" />
        /// </summary>
        [LxElementCt(
            11,
            "levelType",
            "https://admin-shell.io/aas/3/0",
            MinOccurs = 0,
            MaxOccurs = 1
        )]
        public AasSchema.Tns.LevelType_TCt? LevelType { get; set; }

        /// <summary>Represent the inline xs:element preferredName@https://admin-shell.io/aas/3/0.</summary>
        /// <XsdPath>schema:aas.xsd/group:dataSpecificationIec61360/sequence/element:preferredName</XsdPath>
        /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
        /// <XsdLocation>215:7-221:20</XsdLocation>
        [LxSimpleElementDefinition(
            "preferredName",
            "https://admin-shell.io/aas/3/0",
            ElementScopeType.InlineElement
        )]
        public partial class PreferredNameElm : AasSchema.LxBase
        {
            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.LangStringPreferredNameTypeIec61360_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.LangStringPreferredNameTypeIec61360_TCt" />
            /// </summary>
            [LxElementCt(
                0,
                "langStringPreferredNameTypeIec61360",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.LangStringPreferredNameTypeIec61360_TCt> LangStringPreferredNameTypeIec61360s { get; } =
                new List<AasSchema.Tns.LangStringPreferredNameTypeIec61360_TCt>();
        }

        /// <summary>Represent the inline xs:element shortName@https://admin-shell.io/aas/3/0.</summary>
        /// <XsdPath>schema:aas.xsd/group:dataSpecificationIec61360/sequence/element:shortName</XsdPath>
        /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
        /// <XsdLocation>222:7-228:20</XsdLocation>
        [LxSimpleElementDefinition(
            "shortName",
            "https://admin-shell.io/aas/3/0",
            ElementScopeType.InlineElement
        )]
        public partial class ShortNameElm : AasSchema.LxBase
        {
            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.LangStringShortNameTypeIec61360_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.LangStringShortNameTypeIec61360_TCt" />
            /// </summary>
            [LxElementCt(
                0,
                "langStringShortNameTypeIec61360",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.LangStringShortNameTypeIec61360_TCt> LangStringShortNameTypeIec61360s { get; } =
                new List<AasSchema.Tns.LangStringShortNameTypeIec61360_TCt>();
        }

        /// <summary>Represent the inline xs:element definition@https://admin-shell.io/aas/3/0.</summary>
        /// <XsdPath>schema:aas.xsd/group:dataSpecificationIec61360/sequence/element:definition</XsdPath>
        /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
        /// <XsdLocation>252:7-258:20</XsdLocation>
        [LxSimpleElementDefinition(
            "definition",
            "https://admin-shell.io/aas/3/0",
            ElementScopeType.InlineElement
        )]
        public partial class DefinitionElm : AasSchema.LxBase
        {
            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.LangStringDefinitionTypeIec61360_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.LangStringDefinitionTypeIec61360_TCt" />
            /// </summary>
            [LxElementCt(
                0,
                "langStringDefinitionTypeIec61360",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.LangStringDefinitionTypeIec61360_TCt> LangStringDefinitionTypeIec61360s { get; } =
                new List<AasSchema.Tns.LangStringDefinitionTypeIec61360_TCt>();
        }
    }

    /// <summary>A class representing the root XSD complexType embeddedDataSpecification_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/complexType:embeddedDataSpecification_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>1152:3-1156:20</XsdLocation>
    [LxSimpleComplexTypeDefinition("embeddedDataSpecification_t", "https://admin-shell.io/aas/3/0")]
    public partial class EmbeddedDataSpecification_TCt : AasSchema.LxBase
    {
        /// <summary>
        ///   A class derived from <see cref="AasSchema.Tns.Reference_TCt" />.<br/><br/>
        ///   Allowable types are <br/>
        ///       <see cref="AasSchema.Tns.Reference_TCt" />
        /// </summary>
        [LxElementCt(
            0,
            "dataSpecification",
            "https://admin-shell.io/aas/3/0",
            MinOccurs = 1,
            MaxOccurs = 1
        )]
        public AasSchema.Tns.Reference_TCt DataSpecification { get; set; } =
            new AasSchema.Tns.Reference_TCt();

        /// <summary>A <see cref="AasSchema.Tns.EmbeddedDataSpecification_TCt.DataSpecificationContentElm" />, Required : should not be set to null</summary>
        [LxElementRef(1, MinOccurs = 1, MaxOccurs = 1)]
        public AasSchema.Tns.EmbeddedDataSpecification_TCt.DataSpecificationContentElm DataSpecificationContent { get; set; } =
            new AasSchema.Tns.EmbeddedDataSpecification_TCt.DataSpecificationContentElm();

        /// <summary>Represent the inline xs:element dataSpecificationContent@https://admin-shell.io/aas/3/0.</summary>
        /// <XsdPath>schema:aas.xsd/group:embeddedDataSpecification/sequence/element:dataSpecificationContent</XsdPath>
        /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
        /// <XsdLocation>281:7-287:20</XsdLocation>
        [LxSimpleElementDefinition(
            "dataSpecificationContent",
            "https://admin-shell.io/aas/3/0",
            ElementScopeType.InlineElement
        )]
        public partial class DataSpecificationContentElm : AasSchema.LxBase
        {
            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.DataSpecificationIec61360_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.DataSpecificationIec61360_TCt" />
            /// </summary>
            [LxElementCt(
                0,
                "dataSpecificationIec61360",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = 1
            )]
            public AasSchema.Tns.DataSpecificationIec61360_TCt? DataSpecificationIec61360 { get; set; }
        }
    }

    /// <summary>A class representing the root XSD complexType entity_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/complexType:entity_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>1157:3-1161:20</XsdLocation>
    [LxSimpleComplexTypeDefinition("entity_t", "https://admin-shell.io/aas/3/0")]
    public partial class Entity_TCt : AasSchema.LxBase
    {
        /// <summary>A <see cref="AasSchema.Tns.AssetAdministrationShell_TCt.ExtensionsElm" />, Optional : null when not set</summary>
        [LxElementRef(0, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetAdministrationShell_TCt.ExtensionsElm? Extensions { get; set; }

        /// <summary>A <see cref="System.String" />, Optional : null when not set</summary>
        [LxElementValue(
            1,
            "category",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 0,
            MaxOccurs = 1,
            MinLength = "1",
            MaxLength = "128"
        )]
        public System.String? Category { get; set; }

        /// <summary>A <see cref="System.String" />, Optional : null when not set</summary>
        [LxElementValue(
            2,
            "idShort",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 0,
            MaxOccurs = 1,
            MinLength = "1",
            MaxLength = "128",
            Pattern = "[a-zA-Z][a-zA-Z0-9_]*"
        )]
        public System.String? IdShort { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.AssetAdministrationShell_TCt.DisplayNameElm" />, Optional : null when not set</summary>
        [LxElementRef(3, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetAdministrationShell_TCt.DisplayNameElm? DisplayName { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.AssetAdministrationShell_TCt.DescriptionElm" />, Optional : null when not set</summary>
        [LxElementRef(4, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetAdministrationShell_TCt.DescriptionElm? Description { get; set; }

        /// <summary>
        ///   A class derived from <see cref="AasSchema.Tns.Reference_TCt" />.<br/><br/>
        ///   Allowable types are <br/>
        ///       <see cref="AasSchema.Tns.Reference_TCt" />
        /// </summary>
        [LxElementCt(
            5,
            "semanticId",
            "https://admin-shell.io/aas/3/0",
            MinOccurs = 0,
            MaxOccurs = 1
        )]
        public AasSchema.Tns.Reference_TCt? SemanticId { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.Extension_TCt.SupplementalSemanticIdsElm" />, Optional : null when not set</summary>
        [LxElementRef(6, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.Extension_TCt.SupplementalSemanticIdsElm? SupplementalSemanticIds { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.Submodel_TCt.QualifiersElm" />, Optional : null when not set</summary>
        [LxElementRef(7, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.Submodel_TCt.QualifiersElm? Qualifiers { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.AdministrativeInformation_TCt.EmbeddedDataSpecificationsElm" />, Optional : null when not set</summary>
        [LxElementRef(8, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AdministrativeInformation_TCt.EmbeddedDataSpecificationsElm? EmbeddedDataSpecifications { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.Entity_TCt.StatementsElm" />, Optional : null when not set</summary>
        [LxElementRef(9, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.Entity_TCt.StatementsElm? Statements { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.EntityType_T1Enum" />, Required</summary>
        [LxElementValue(
            10,
            "entityType",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Enum,
            XsdType.Enum,
            MinOccurs = 1,
            MaxOccurs = 1,
            WhiteSpace = WhiteSpaceType.Preserve
        )]
        public AasSchema.Tns.EntityType_T1Enum EntityType { get; set; }

        /// <summary>A <see cref="System.String" />, Optional : null when not set</summary>
        [LxElementValue(
            11,
            "globalAssetId",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 0,
            MaxOccurs = 1,
            MinLength = "1",
            MaxLength = "2000"
        )]
        public System.String? GlobalAssetId { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.Entity_TCt.SpecificAssetIdsElm" />, Optional : null when not set</summary>
        [LxElementRef(12, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.Entity_TCt.SpecificAssetIdsElm? SpecificAssetIds { get; set; }

        /// <summary>Represent the inline xs:element statements@https://admin-shell.io/aas/3/0.</summary>
        /// <XsdPath>schema:aas.xsd/group:entity/sequence/element:statements</XsdPath>
        /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
        /// <XsdLocation>293:7-299:20</XsdLocation>
        [LxSimpleElementDefinition(
            "statements",
            "https://admin-shell.io/aas/3/0",
            ElementScopeType.InlineElement
        )]
        public partial class StatementsElm : AasSchema.LxBase
        {
            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.RelationshipElement_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.RelationshipElement_TCt" />
            /// </summary>
            [LxElementCt(
                0,
                "relationshipElement",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.RelationshipElement_TCt> RelationshipElements { get; } =
                new List<AasSchema.Tns.RelationshipElement_TCt>();

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.AnnotatedRelationshipElement_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.AnnotatedRelationshipElement_TCt" />
            /// </summary>
            [LxElementCt(
                1,
                "annotatedRelationshipElement",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.AnnotatedRelationshipElement_TCt> AnnotatedRelationshipElements { get; } =
                new List<AasSchema.Tns.AnnotatedRelationshipElement_TCt>();

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.BasicEventElement_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.BasicEventElement_TCt" />
            /// </summary>
            [LxElementCt(
                2,
                "basicEventElement",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.BasicEventElement_TCt> BasicEventElements { get; } =
                new List<AasSchema.Tns.BasicEventElement_TCt>();

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.Blob_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.Blob_TCt" />
            /// </summary>
            [LxElementCt(
                3,
                "blob",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.Blob_TCt> Blobs { get; } = new List<AasSchema.Tns.Blob_TCt>();

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.Capability_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.Capability_TCt" />
            /// </summary>
            [LxElementCt(
                4,
                "capability",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.Capability_TCt> Capabilities { get; } =
                new List<AasSchema.Tns.Capability_TCt>();

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.Entity_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.Entity_TCt" />
            /// </summary>
            [LxElementCt(
                5,
                "entity",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.Entity_TCt> Entities { get; } =
                new List<AasSchema.Tns.Entity_TCt>();

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.File_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.File_TCt" />
            /// </summary>
            [LxElementCt(
                6,
                "file",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.File_TCt> Files { get; } = new List<AasSchema.Tns.File_TCt>();

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.MultiLanguageProperty_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.MultiLanguageProperty_TCt" />
            /// </summary>
            [LxElementCt(
                7,
                "multiLanguageProperty",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.MultiLanguageProperty_TCt> MultiLanguageProperties { get; } =
                new List<AasSchema.Tns.MultiLanguageProperty_TCt>();

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.Operation_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.Operation_TCt" />
            /// </summary>
            [LxElementCt(
                8,
                "operation",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.Operation_TCt> Operations { get; } =
                new List<AasSchema.Tns.Operation_TCt>();

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.Property_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.Property_TCt" />
            /// </summary>
            [LxElementCt(
                9,
                "property",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.Property_TCt> Properties { get; } =
                new List<AasSchema.Tns.Property_TCt>();

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.Range_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.Range_TCt" />
            /// </summary>
            [LxElementCt(
                10,
                "range",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.Range_TCt> Ranges { get; } =
                new List<AasSchema.Tns.Range_TCt>();

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.ReferenceElement_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.ReferenceElement_TCt" />
            /// </summary>
            [LxElementCt(
                11,
                "referenceElement",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.ReferenceElement_TCt> ReferenceElements { get; } =
                new List<AasSchema.Tns.ReferenceElement_TCt>();

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.SubmodelElementCollection_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.SubmodelElementCollection_TCt" />
            /// </summary>
            [LxElementCt(
                12,
                "submodelElementCollection",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.SubmodelElementCollection_TCt> SubmodelElementCollections { get; } =
                new List<AasSchema.Tns.SubmodelElementCollection_TCt>();

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.SubmodelElementList_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.SubmodelElementList_TCt" />
            /// </summary>
            [LxElementCt(
                13,
                "submodelElementList",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.SubmodelElementList_TCt> SubmodelElementLists { get; } =
                new List<AasSchema.Tns.SubmodelElementList_TCt>();
        }

        /// <summary>Represent the inline xs:element specificAssetIds@https://admin-shell.io/aas/3/0.</summary>
        /// <XsdPath>schema:aas.xsd/group:entity/sequence/element:specificAssetIds</XsdPath>
        /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
        /// <XsdLocation>309:7-315:20</XsdLocation>
        [LxSimpleElementDefinition(
            "specificAssetIds",
            "https://admin-shell.io/aas/3/0",
            ElementScopeType.InlineElement
        )]
        public partial class SpecificAssetIdsElm : AasSchema.LxBase
        {
            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.SpecificAssetId_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.SpecificAssetId_TCt" />
            /// </summary>
            [LxElementCt(
                0,
                "specificAssetId",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.SpecificAssetId_TCt> SpecificAssetIds { get; } =
                new List<AasSchema.Tns.SpecificAssetId_TCt>();
        }
    }

    /// <summary>A class representing the root XSD complexType environment_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/complexType:environment_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>1162:3-1166:20</XsdLocation>
    [LxSimpleComplexTypeDefinition("environment_t", "https://admin-shell.io/aas/3/0")]
    public partial class Environment_TCt : AasSchema.LxBase
    {
        /// <summary>A <see cref="AasSchema.Tns.Environment_TCt.AssetAdministrationShellsElm" />, Optional : null when not set</summary>
        [LxElementRef(0, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.Environment_TCt.AssetAdministrationShellsElm? AssetAdministrationShells { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.Environment_TCt.SubmodelsElm" />, Optional : null when not set</summary>
        [LxElementRef(1, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.Environment_TCt.SubmodelsElm? Submodels { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.Environment_TCt.ConceptDescriptionsElm" />, Optional : null when not set</summary>
        [LxElementRef(2, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.Environment_TCt.ConceptDescriptionsElm? ConceptDescriptions { get; set; }

        /// <summary>Represent the inline xs:element assetAdministrationShells@https://admin-shell.io/aas/3/0.</summary>
        /// <XsdPath>schema:aas.xsd/group:environment/sequence/element:assetAdministrationShells</XsdPath>
        /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
        /// <XsdLocation>320:7-326:20</XsdLocation>
        [LxSimpleElementDefinition(
            "assetAdministrationShells",
            "https://admin-shell.io/aas/3/0",
            ElementScopeType.InlineElement
        )]
        public partial class AssetAdministrationShellsElm : AasSchema.LxBase
        {
            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.AssetAdministrationShell_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.AssetAdministrationShell_TCt" />
            /// </summary>
            [LxElementCt(
                0,
                "assetAdministrationShell",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.AssetAdministrationShell_TCt> AssetAdministrationShells { get; } =
                new List<AasSchema.Tns.AssetAdministrationShell_TCt>();
        }

        /// <summary>Represent the inline xs:element submodels@https://admin-shell.io/aas/3/0.</summary>
        /// <XsdPath>schema:aas.xsd/group:environment/sequence/element:submodels</XsdPath>
        /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
        /// <XsdLocation>327:7-333:20</XsdLocation>
        [LxSimpleElementDefinition(
            "submodels",
            "https://admin-shell.io/aas/3/0",
            ElementScopeType.InlineElement
        )]
        public partial class SubmodelsElm : AasSchema.LxBase
        {
            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.Submodel_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.Submodel_TCt" />
            /// </summary>
            [LxElementCt(
                0,
                "submodel",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.Submodel_TCt> Submodels { get; } =
                new List<AasSchema.Tns.Submodel_TCt>();
        }

        /// <summary>Represent the inline xs:element conceptDescriptions@https://admin-shell.io/aas/3/0.</summary>
        /// <XsdPath>schema:aas.xsd/group:environment/sequence/element:conceptDescriptions</XsdPath>
        /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
        /// <XsdLocation>334:7-340:20</XsdLocation>
        [LxSimpleElementDefinition(
            "conceptDescriptions",
            "https://admin-shell.io/aas/3/0",
            ElementScopeType.InlineElement
        )]
        public partial class ConceptDescriptionsElm : AasSchema.LxBase
        {
            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.ConceptDescription_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.ConceptDescription_TCt" />
            /// </summary>
            [LxElementCt(
                0,
                "conceptDescription",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.ConceptDescription_TCt> ConceptDescriptions { get; } =
                new List<AasSchema.Tns.ConceptDescription_TCt>();
        }
    }

    /// <summary>A class representing the root XSD complexType eventElement_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/complexType:eventElement_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>1167:3-1171:20</XsdLocation>
    [LxSimpleComplexTypeDefinition("eventElement_t", "https://admin-shell.io/aas/3/0")]
    public partial class EventElement_TCt : AasSchema.LxBase
    {
        /// <summary>A <see cref="AasSchema.Tns.AssetAdministrationShell_TCt.ExtensionsElm" />, Optional : null when not set</summary>
        [LxElementRef(0, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetAdministrationShell_TCt.ExtensionsElm? Extensions { get; set; }

        /// <summary>A <see cref="System.String" />, Optional : null when not set</summary>
        [LxElementValue(
            1,
            "category",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 0,
            MaxOccurs = 1,
            MinLength = "1",
            MaxLength = "128"
        )]
        public System.String? Category { get; set; }

        /// <summary>A <see cref="System.String" />, Optional : null when not set</summary>
        [LxElementValue(
            2,
            "idShort",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 0,
            MaxOccurs = 1,
            MinLength = "1",
            MaxLength = "128",
            Pattern = "[a-zA-Z][a-zA-Z0-9_]*"
        )]
        public System.String? IdShort { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.AssetAdministrationShell_TCt.DisplayNameElm" />, Optional : null when not set</summary>
        [LxElementRef(3, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetAdministrationShell_TCt.DisplayNameElm? DisplayName { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.AssetAdministrationShell_TCt.DescriptionElm" />, Optional : null when not set</summary>
        [LxElementRef(4, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetAdministrationShell_TCt.DescriptionElm? Description { get; set; }

        /// <summary>
        ///   A class derived from <see cref="AasSchema.Tns.Reference_TCt" />.<br/><br/>
        ///   Allowable types are <br/>
        ///       <see cref="AasSchema.Tns.Reference_TCt" />
        /// </summary>
        [LxElementCt(
            5,
            "semanticId",
            "https://admin-shell.io/aas/3/0",
            MinOccurs = 0,
            MaxOccurs = 1
        )]
        public AasSchema.Tns.Reference_TCt? SemanticId { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.Extension_TCt.SupplementalSemanticIdsElm" />, Optional : null when not set</summary>
        [LxElementRef(6, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.Extension_TCt.SupplementalSemanticIdsElm? SupplementalSemanticIds { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.Submodel_TCt.QualifiersElm" />, Optional : null when not set</summary>
        [LxElementRef(7, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.Submodel_TCt.QualifiersElm? Qualifiers { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.AdministrativeInformation_TCt.EmbeddedDataSpecificationsElm" />, Optional : null when not set</summary>
        [LxElementRef(8, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AdministrativeInformation_TCt.EmbeddedDataSpecificationsElm? EmbeddedDataSpecifications { get; set; }
    }

    /// <summary>A class representing the root XSD complexType eventPayload_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/complexType:eventPayload_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>1172:3-1176:20</XsdLocation>
    [LxSimpleComplexTypeDefinition("eventPayload_t", "https://admin-shell.io/aas/3/0")]
    public partial class EventPayload_TCt : AasSchema.LxBase
    {
        /// <summary>
        ///   A class derived from <see cref="AasSchema.Tns.Reference_TCt" />.<br/><br/>
        ///   Allowable types are <br/>
        ///       <see cref="AasSchema.Tns.Reference_TCt" />
        /// </summary>
        [LxElementCt(0, "source", "https://admin-shell.io/aas/3/0", MinOccurs = 1, MaxOccurs = 1)]
        public AasSchema.Tns.Reference_TCt Source { get; set; } = new AasSchema.Tns.Reference_TCt();

        /// <summary>
        ///   A class derived from <see cref="AasSchema.Tns.Reference_TCt" />.<br/><br/>
        ///   Allowable types are <br/>
        ///       <see cref="AasSchema.Tns.Reference_TCt" />
        /// </summary>
        [LxElementCt(
            1,
            "sourceSemanticId",
            "https://admin-shell.io/aas/3/0",
            MinOccurs = 0,
            MaxOccurs = 1
        )]
        public AasSchema.Tns.Reference_TCt? SourceSemanticId { get; set; }

        /// <summary>
        ///   A class derived from <see cref="AasSchema.Tns.Reference_TCt" />.<br/><br/>
        ///   Allowable types are <br/>
        ///       <see cref="AasSchema.Tns.Reference_TCt" />
        /// </summary>
        [LxElementCt(
            2,
            "observableReference",
            "https://admin-shell.io/aas/3/0",
            MinOccurs = 1,
            MaxOccurs = 1
        )]
        public AasSchema.Tns.Reference_TCt ObservableReference { get; set; } =
            new AasSchema.Tns.Reference_TCt();

        /// <summary>
        ///   A class derived from <see cref="AasSchema.Tns.Reference_TCt" />.<br/><br/>
        ///   Allowable types are <br/>
        ///       <see cref="AasSchema.Tns.Reference_TCt" />
        /// </summary>
        [LxElementCt(
            3,
            "observableSemanticId",
            "https://admin-shell.io/aas/3/0",
            MinOccurs = 0,
            MaxOccurs = 1
        )]
        public AasSchema.Tns.Reference_TCt? ObservableSemanticId { get; set; }

        /// <summary>A <see cref="System.String" />, Optional : null when not set</summary>
        [LxElementValue(
            4,
            "topic",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 0,
            MaxOccurs = 1,
            MinLength = "1",
            MaxLength = "255"
        )]
        public System.String? Topic { get; set; }

        /// <summary>
        ///   A class derived from <see cref="AasSchema.Tns.Reference_TCt" />.<br/><br/>
        ///   Allowable types are <br/>
        ///       <see cref="AasSchema.Tns.Reference_TCt" />
        /// </summary>
        [LxElementCt(
            5,
            "subjectId",
            "https://admin-shell.io/aas/3/0",
            MinOccurs = 0,
            MaxOccurs = 1
        )]
        public AasSchema.Tns.Reference_TCt? SubjectId { get; set; }

        /// <summary>A <see cref="System.String" />, Required : should not be set to null</summary>
        [LxElementValue(
            6,
            "timeStamp",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 1,
            MaxOccurs = 1,
            Pattern = "-?(([1-9][0-9][0-9][0-9]+)|(0[0-9][0-9][0-9]))-((0[1-9])|(1[0-2]))-((0[1-9])|([12][0-9])|(3[01]))T(((([01][0-9])|(2[0-3])):[0-5][0-9]:([0-5][0-9])(\\.[0-9]+)?)|24:00:00(\\.0+)?)(Z|\\+00:00|-00:00)"
        )]
        public System.String TimeStamp { get; set; } = "";

        /// <summary>A <see cref="System.Byte" />[], Optional : null when not set</summary>
        [LxElementValue(
            7,
            "payload",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdBase64Binary,
            MinOccurs = 0,
            MaxOccurs = 1
        )]
        public System.Byte[]? Payload { get; set; }
    }

    /// <summary>A class representing the root XSD complexType extension_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/complexType:extension_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>1177:3-1181:20</XsdLocation>
    [LxSimpleComplexTypeDefinition("extension_t", "https://admin-shell.io/aas/3/0")]
    public partial class Extension_TCt : AasSchema.LxBase
    {
        /// <summary>
        ///   A class derived from <see cref="AasSchema.Tns.Reference_TCt" />.<br/><br/>
        ///   Allowable types are <br/>
        ///       <see cref="AasSchema.Tns.Reference_TCt" />
        /// </summary>
        [LxElementCt(
            0,
            "semanticId",
            "https://admin-shell.io/aas/3/0",
            MinOccurs = 0,
            MaxOccurs = 1
        )]
        public AasSchema.Tns.Reference_TCt? SemanticId { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.Extension_TCt.SupplementalSemanticIdsElm" />, Optional : null when not set</summary>
        [LxElementRef(1, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.Extension_TCt.SupplementalSemanticIdsElm? SupplementalSemanticIds { get; set; }

        /// <summary>A <see cref="System.String" />, Required : should not be set to null</summary>
        [LxElementValue(
            2,
            "name",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 1,
            MaxOccurs = 1,
            MinLength = "1",
            MaxLength = "128"
        )]
        public System.String Name { get; set; } = "";

        /// <summary>A nullable <see cref="AasSchema.Tns.DataTypeDefXsd_T1Enum" />, Optional : null when not set</summary>
        [LxElementValue(
            3,
            "valueType",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Enum,
            XsdType.Enum,
            MinOccurs = 0,
            MaxOccurs = 1,
            WhiteSpace = WhiteSpaceType.Preserve
        )]
        public AasSchema.Tns.DataTypeDefXsd_T1Enum? ValueType { get; set; }

        /// <summary>A <see cref="System.String" />, Optional : null when not set</summary>
        [LxElementValue(
            4,
            "value",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 0,
            MaxOccurs = 1
        )]
        public System.String? Value1 { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.Extension_TCt.RefersToElm" />, Optional : null when not set</summary>
        [LxElementRef(5, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.Extension_TCt.RefersToElm? RefersTo { get; set; }

        /// <summary>Represent the inline xs:element supplementalSemanticIds@https://admin-shell.io/aas/3/0.</summary>
        /// <XsdPath>schema:aas.xsd/group:hasSemantics/sequence/element:supplementalSemanticIds</XsdPath>
        /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
        /// <XsdLocation>501:7-507:20</XsdLocation>
        [LxSimpleElementDefinition(
            "supplementalSemanticIds",
            "https://admin-shell.io/aas/3/0",
            ElementScopeType.InlineElement
        )]
        public partial class SupplementalSemanticIdsElm : AasSchema.LxBase
        {
            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.Reference_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.Reference_TCt" />
            /// </summary>
            [LxElementCt(
                0,
                "reference",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.Reference_TCt> References { get; } =
                new List<AasSchema.Tns.Reference_TCt>();
        }

        /// <summary>Represent the inline xs:element refersTo@https://admin-shell.io/aas/3/0.</summary>
        /// <XsdPath>schema:aas.xsd/group:extension/sequence/element:refersTo</XsdPath>
        /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
        /// <XsdLocation>391:7-397:20</XsdLocation>
        [LxSimpleElementDefinition(
            "refersTo",
            "https://admin-shell.io/aas/3/0",
            ElementScopeType.InlineElement
        )]
        public partial class RefersToElm : AasSchema.LxBase
        {
            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.Reference_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.Reference_TCt" />
            /// </summary>
            [LxElementCt(
                0,
                "reference",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.Reference_TCt> References { get; } =
                new List<AasSchema.Tns.Reference_TCt>();
        }
    }

    /// <summary>A class representing the root XSD complexType file_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/complexType:file_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>1182:3-1186:20</XsdLocation>
    [LxSimpleComplexTypeDefinition("file_t", "https://admin-shell.io/aas/3/0")]
    public partial class File_TCt : AasSchema.LxBase
    {
        /// <summary>A <see cref="AasSchema.Tns.AssetAdministrationShell_TCt.ExtensionsElm" />, Optional : null when not set</summary>
        [LxElementRef(0, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetAdministrationShell_TCt.ExtensionsElm? Extensions { get; set; }

        /// <summary>A <see cref="System.String" />, Optional : null when not set</summary>
        [LxElementValue(
            1,
            "category",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 0,
            MaxOccurs = 1,
            MinLength = "1",
            MaxLength = "128"
        )]
        public System.String? Category { get; set; }

        /// <summary>A <see cref="System.String" />, Optional : null when not set</summary>
        [LxElementValue(
            2,
            "idShort",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 0,
            MaxOccurs = 1,
            MinLength = "1",
            MaxLength = "128",
            Pattern = "[a-zA-Z][a-zA-Z0-9_]*"
        )]
        public System.String? IdShort { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.AssetAdministrationShell_TCt.DisplayNameElm" />, Optional : null when not set</summary>
        [LxElementRef(3, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetAdministrationShell_TCt.DisplayNameElm? DisplayName { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.AssetAdministrationShell_TCt.DescriptionElm" />, Optional : null when not set</summary>
        [LxElementRef(4, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetAdministrationShell_TCt.DescriptionElm? Description { get; set; }

        /// <summary>
        ///   A class derived from <see cref="AasSchema.Tns.Reference_TCt" />.<br/><br/>
        ///   Allowable types are <br/>
        ///       <see cref="AasSchema.Tns.Reference_TCt" />
        /// </summary>
        [LxElementCt(
            5,
            "semanticId",
            "https://admin-shell.io/aas/3/0",
            MinOccurs = 0,
            MaxOccurs = 1
        )]
        public AasSchema.Tns.Reference_TCt? SemanticId { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.Extension_TCt.SupplementalSemanticIdsElm" />, Optional : null when not set</summary>
        [LxElementRef(6, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.Extension_TCt.SupplementalSemanticIdsElm? SupplementalSemanticIds { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.Submodel_TCt.QualifiersElm" />, Optional : null when not set</summary>
        [LxElementRef(7, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.Submodel_TCt.QualifiersElm? Qualifiers { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.AdministrativeInformation_TCt.EmbeddedDataSpecificationsElm" />, Optional : null when not set</summary>
        [LxElementRef(8, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AdministrativeInformation_TCt.EmbeddedDataSpecificationsElm? EmbeddedDataSpecifications { get; set; }

        /// <summary>A <see cref="System.String" />, Optional : null when not set</summary>
        [LxElementValue(
            9,
            "value",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 0,
            MaxOccurs = 1,
            MinLength = "1",
            MaxLength = "2000",
            Pattern = "file:(//((localhost|(\\[((([0-9A-Fa-f]{1,4}:){6}([0-9A-Fa-f]{1,4}:[0-9A-Fa-f]{1,4}|([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))|::([0-9A-Fa-f]{1,4}:){5}([0-9A-Fa-f]{1,4}:[0-9A-Fa-f]{1,4}|([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))|([0-9A-Fa-f]{1,4})?::([0-9A-Fa-f]{1,4}:){4}([0-9A-Fa-f]{1,4}:[0-9A-Fa-f]{1,4}|([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))|(([0-9A-Fa-f]{1,4}:)?[0-9A-Fa-f]{1,4})?::([0-9A-Fa-f]{1,4}:){3}([0-9A-Fa-f]{1,4}:[0-9A-Fa-f]{1,4}|([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))|(([0-9A-Fa-f]{1,4}:){2}[0-9A-Fa-f]{1,4})?::([0-9A-Fa-f]{1,4}:){2}([0-9A-Fa-f]{1,4}:[0-9A-Fa-f]{1,4}|([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))|(([0-9A-Fa-f]{1,4}:){3}[0-9A-Fa-f]{1,4})?::[0-9A-Fa-f]{1,4}:([0-9A-Fa-f]{1,4}:[0-9A-Fa-f]{1,4}|([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))|(([0-9A-Fa-f]{1,4}:){4}[0-9A-Fa-f]{1,4})?::([0-9A-Fa-f]{1,4}:[0-9A-Fa-f]{1,4}|([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))|(([0-9A-Fa-f]{1,4}:){5}[0-9A-Fa-f]{1,4})?::[0-9A-Fa-f]{1,4}|(([0-9A-Fa-f]{1,4}:){6}[0-9A-Fa-f]{1,4})?::)|[vV][0-9A-Fa-f]+\\.([a-zA-Z0-9\\-._~]|[!$&'()*+,;=]|:)+)\\]|([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])|([a-zA-Z0-9\\-._~]|%[0-9A-Fa-f][0-9A-Fa-f]|[!$&'()*+,;=])*)))?/((([a-zA-Z0-9\\-._~]|%[0-9A-Fa-f][0-9A-Fa-f]|[!$&'()*+,;=]|[:@]))+(/(([a-zA-Z0-9\\-._~]|%[0-9A-Fa-f][0-9A-Fa-f]|[!$&'()*+,;=]|[:@]))*)*)?|/((([a-zA-Z0-9\\-._~]|%[0-9A-Fa-f][0-9A-Fa-f]|[!$&'()*+,;=]|[:@]))+(/(([a-zA-Z0-9\\-._~]|%[0-9A-Fa-f][0-9A-Fa-f]|[!$&'()*+,;=]|[:@]))*)*)?)"
        )]
        public System.String? Value1 { get; set; }

        /// <summary>A <see cref="System.String" />, Required : should not be set to null</summary>
        [LxElementValue(
            10,
            "contentType",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 1,
            MaxOccurs = 1,
            MinLength = "1",
            MaxLength = "100",
            Pattern = "([!#$%&'*+\\-.^_`|~0-9a-zA-Z])+/([!#$%&'*+\\-.^_`|~0-9a-zA-Z])+([ \\t]*;[ \\t]*([!#$%&'*+\\-.^_`|~0-9a-zA-Z])+=(([!#$%&'*+\\-.^_`|~0-9a-zA-Z])+|\"(([\\t !#-\\[\\]-~]|[-ÿ])|\\\\([\\t !-~]|[-ÿ]))*\"))*"
        )]
        public System.String ContentType { get; set; } = "";
    }

    /// <summary>A class representing the root XSD complexType hasDataSpecification_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/complexType:hasDataSpecification_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>1187:3-1191:20</XsdLocation>
    [LxSimpleComplexTypeDefinition("hasDataSpecification_t", "https://admin-shell.io/aas/3/0")]
    public partial class HasDataSpecification_TCt : AasSchema.LxBase
    {
        /// <summary>A <see cref="AasSchema.Tns.AdministrativeInformation_TCt.EmbeddedDataSpecificationsElm" />, Optional : null when not set</summary>
        [LxElementRef(0, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AdministrativeInformation_TCt.EmbeddedDataSpecificationsElm? EmbeddedDataSpecifications { get; set; }
    }

    /// <summary>A class representing the root XSD complexType hasExtensions_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/complexType:hasExtensions_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>1192:3-1196:20</XsdLocation>
    [LxSimpleComplexTypeDefinition("hasExtensions_t", "https://admin-shell.io/aas/3/0")]
    public partial class HasExtensions_TCt : AasSchema.LxBase
    {
        /// <summary>A <see cref="AasSchema.Tns.AssetAdministrationShell_TCt.ExtensionsElm" />, Optional : null when not set</summary>
        [LxElementRef(0, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetAdministrationShell_TCt.ExtensionsElm? Extensions { get; set; }
    }

    /// <summary>A class representing the root XSD complexType hasKind_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/complexType:hasKind_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>1197:3-1201:20</XsdLocation>
    [LxSimpleComplexTypeDefinition("hasKind_t", "https://admin-shell.io/aas/3/0")]
    public partial class HasKind_TCt : AasSchema.LxBase
    {
        /// <summary>A nullable <see cref="AasSchema.Tns.ModellingKind_T1Enum" />, Optional : null when not set</summary>
        [LxElementValue(
            0,
            "kind",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Enum,
            XsdType.Enum,
            MinOccurs = 0,
            MaxOccurs = 1,
            WhiteSpace = WhiteSpaceType.Preserve
        )]
        public AasSchema.Tns.ModellingKind_T1Enum? Kind { get; set; }
    }

    /// <summary>A class representing the root XSD complexType hasSemantics_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/complexType:hasSemantics_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>1202:3-1206:20</XsdLocation>
    [LxSimpleComplexTypeDefinition("hasSemantics_t", "https://admin-shell.io/aas/3/0")]
    public partial class HasSemantics_TCt : AasSchema.LxBase
    {
        /// <summary>
        ///   A class derived from <see cref="AasSchema.Tns.Reference_TCt" />.<br/><br/>
        ///   Allowable types are <br/>
        ///       <see cref="AasSchema.Tns.Reference_TCt" />
        /// </summary>
        [LxElementCt(
            0,
            "semanticId",
            "https://admin-shell.io/aas/3/0",
            MinOccurs = 0,
            MaxOccurs = 1
        )]
        public AasSchema.Tns.Reference_TCt? SemanticId { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.Extension_TCt.SupplementalSemanticIdsElm" />, Optional : null when not set</summary>
        [LxElementRef(1, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.Extension_TCt.SupplementalSemanticIdsElm? SupplementalSemanticIds { get; set; }
    }

    /// <summary>A class representing the root XSD complexType identifiable_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/complexType:identifiable_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>1207:3-1211:20</XsdLocation>
    [LxSimpleComplexTypeDefinition("identifiable_t", "https://admin-shell.io/aas/3/0")]
    public partial class Identifiable_TCt : AasSchema.LxBase
    {
        /// <summary>A <see cref="AasSchema.Tns.AssetAdministrationShell_TCt.ExtensionsElm" />, Optional : null when not set</summary>
        [LxElementRef(0, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetAdministrationShell_TCt.ExtensionsElm? Extensions { get; set; }

        /// <summary>A <see cref="System.String" />, Optional : null when not set</summary>
        [LxElementValue(
            1,
            "category",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 0,
            MaxOccurs = 1,
            MinLength = "1",
            MaxLength = "128"
        )]
        public System.String? Category { get; set; }

        /// <summary>A <see cref="System.String" />, Optional : null when not set</summary>
        [LxElementValue(
            2,
            "idShort",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 0,
            MaxOccurs = 1,
            MinLength = "1",
            MaxLength = "128",
            Pattern = "[a-zA-Z][a-zA-Z0-9_]*"
        )]
        public System.String? IdShort { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.AssetAdministrationShell_TCt.DisplayNameElm" />, Optional : null when not set</summary>
        [LxElementRef(3, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetAdministrationShell_TCt.DisplayNameElm? DisplayName { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.AssetAdministrationShell_TCt.DescriptionElm" />, Optional : null when not set</summary>
        [LxElementRef(4, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetAdministrationShell_TCt.DescriptionElm? Description { get; set; }

        /// <summary>
        ///   A class derived from <see cref="AasSchema.Tns.AdministrativeInformation_TCt" />.<br/><br/>
        ///   Allowable types are <br/>
        ///       <see cref="AasSchema.Tns.AdministrativeInformation_TCt" />
        /// </summary>
        [LxElementCt(
            5,
            "administration",
            "https://admin-shell.io/aas/3/0",
            MinOccurs = 0,
            MaxOccurs = 1
        )]
        public AasSchema.Tns.AdministrativeInformation_TCt? Administration { get; set; }

        /// <summary>A <see cref="System.String" />, Required : should not be set to null</summary>
        [LxElementValue(
            6,
            "id",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 1,
            MaxOccurs = 1,
            MinLength = "1",
            MaxLength = "2000"
        )]
        public System.String Id { get; set; } = "";
    }

    /// <summary>A class representing the root XSD complexType key_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/complexType:key_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>1212:3-1216:20</XsdLocation>
    [LxSimpleComplexTypeDefinition("key_t", "https://admin-shell.io/aas/3/0")]
    public partial class Key_TCt : AasSchema.LxBase
    {
        /// <summary>A <see cref="AasSchema.Tns.KeyTypes_T1Enum" />, Required</summary>
        [LxElementValue(
            0,
            "type",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Enum,
            XsdType.Enum,
            MinOccurs = 1,
            MaxOccurs = 1,
            WhiteSpace = WhiteSpaceType.Preserve
        )]
        public AasSchema.Tns.KeyTypes_T1Enum Type { get; set; }

        /// <summary>A <see cref="System.String" />, Required : should not be set to null</summary>
        [LxElementValue(
            1,
            "value",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 1,
            MaxOccurs = 1,
            MinLength = "1",
            MaxLength = "2000"
        )]
        public System.String Value1 { get; set; } = "";
    }

    /// <summary>A class representing the root XSD complexType langStringDefinitionTypeIec61360_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/complexType:langStringDefinitionTypeIec61360_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>1217:3-1221:20</XsdLocation>
    [LxSimpleComplexTypeDefinition(
        "langStringDefinitionTypeIec61360_t",
        "https://admin-shell.io/aas/3/0"
    )]
    public partial class LangStringDefinitionTypeIec61360_TCt : AasSchema.LxBase
    {
        /// <summary>A <see cref="System.String" />, Required : should not be set to null</summary>
        [LxElementValue(
            0,
            "language",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 1,
            MaxOccurs = 1,
            Pattern = "(([a-zA-Z]{2,3}(-[a-zA-Z]{3}(-[a-zA-Z]{3}){2})?|[a-zA-Z]{4}|[a-zA-Z]{5,8})(-[a-zA-Z]{4})?(-([a-zA-Z]{2}|[0-9]{3}))?(-(([a-zA-Z0-9]){5,8}|[0-9]([a-zA-Z0-9]){3}))*(-[0-9A-WY-Za-wy-z](-([a-zA-Z0-9]){2,8})+)*(-[xX](-([a-zA-Z0-9]){1,8})+)?|[xX](-([a-zA-Z0-9]){1,8})+|((en-GB-oed|i-ami|i-bnn|i-default|i-enochian|i-hak|i-klingon|i-lux|i-mingo|i-navajo|i-pwn|i-tao|i-tay|i-tsu|sgn-BE-FR|sgn-BE-NL|sgn-CH-DE)|(art-lojban|cel-gaulish|no-bok|no-nyn|zh-guoyu|zh-hakka|zh-min|zh-min-nan|zh-xiang)))"
        )]
        public System.String Language { get; set; } = "";

        /// <summary>A <see cref="System.String" />, Required : should not be set to null</summary>
        [LxElementValue(
            1,
            "text",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 1,
            MaxOccurs = 1,
            MinLength = "1"
        )]
        public System.String Text { get; set; } = "";
    }

    /// <summary>A class representing the root XSD complexType langStringNameType_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/complexType:langStringNameType_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>1222:3-1226:20</XsdLocation>
    [LxSimpleComplexTypeDefinition("langStringNameType_t", "https://admin-shell.io/aas/3/0")]
    public partial class LangStringNameType_TCt : AasSchema.LxBase
    {
        /// <summary>A <see cref="System.String" />, Required : should not be set to null</summary>
        [LxElementValue(
            0,
            "language",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 1,
            MaxOccurs = 1,
            Pattern = "(([a-zA-Z]{2,3}(-[a-zA-Z]{3}(-[a-zA-Z]{3}){2})?|[a-zA-Z]{4}|[a-zA-Z]{5,8})(-[a-zA-Z]{4})?(-([a-zA-Z]{2}|[0-9]{3}))?(-(([a-zA-Z0-9]){5,8}|[0-9]([a-zA-Z0-9]){3}))*(-[0-9A-WY-Za-wy-z](-([a-zA-Z0-9]){2,8})+)*(-[xX](-([a-zA-Z0-9]){1,8})+)?|[xX](-([a-zA-Z0-9]){1,8})+|((en-GB-oed|i-ami|i-bnn|i-default|i-enochian|i-hak|i-klingon|i-lux|i-mingo|i-navajo|i-pwn|i-tao|i-tay|i-tsu|sgn-BE-FR|sgn-BE-NL|sgn-CH-DE)|(art-lojban|cel-gaulish|no-bok|no-nyn|zh-guoyu|zh-hakka|zh-min|zh-min-nan|zh-xiang)))"
        )]
        public System.String Language { get; set; } = "";

        /// <summary>A <see cref="System.String" />, Required : should not be set to null</summary>
        [LxElementValue(
            1,
            "text",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 1,
            MaxOccurs = 1,
            MinLength = "1"
        )]
        public System.String Text { get; set; } = "";
    }

    /// <summary>A class representing the root XSD complexType langStringPreferredNameTypeIec61360_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/complexType:langStringPreferredNameTypeIec61360_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>1227:3-1231:20</XsdLocation>
    [LxSimpleComplexTypeDefinition(
        "langStringPreferredNameTypeIec61360_t",
        "https://admin-shell.io/aas/3/0"
    )]
    public partial class LangStringPreferredNameTypeIec61360_TCt : AasSchema.LxBase
    {
        /// <summary>A <see cref="System.String" />, Required : should not be set to null</summary>
        [LxElementValue(
            0,
            "language",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 1,
            MaxOccurs = 1,
            Pattern = "(([a-zA-Z]{2,3}(-[a-zA-Z]{3}(-[a-zA-Z]{3}){2})?|[a-zA-Z]{4}|[a-zA-Z]{5,8})(-[a-zA-Z]{4})?(-([a-zA-Z]{2}|[0-9]{3}))?(-(([a-zA-Z0-9]){5,8}|[0-9]([a-zA-Z0-9]){3}))*(-[0-9A-WY-Za-wy-z](-([a-zA-Z0-9]){2,8})+)*(-[xX](-([a-zA-Z0-9]){1,8})+)?|[xX](-([a-zA-Z0-9]){1,8})+|((en-GB-oed|i-ami|i-bnn|i-default|i-enochian|i-hak|i-klingon|i-lux|i-mingo|i-navajo|i-pwn|i-tao|i-tay|i-tsu|sgn-BE-FR|sgn-BE-NL|sgn-CH-DE)|(art-lojban|cel-gaulish|no-bok|no-nyn|zh-guoyu|zh-hakka|zh-min|zh-min-nan|zh-xiang)))"
        )]
        public System.String Language { get; set; } = "";

        /// <summary>A <see cref="System.String" />, Required : should not be set to null</summary>
        [LxElementValue(
            1,
            "text",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 1,
            MaxOccurs = 1,
            MinLength = "1"
        )]
        public System.String Text { get; set; } = "";
    }

    /// <summary>A class representing the root XSD complexType langStringShortNameTypeIec61360_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/complexType:langStringShortNameTypeIec61360_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>1232:3-1236:20</XsdLocation>
    [LxSimpleComplexTypeDefinition(
        "langStringShortNameTypeIec61360_t",
        "https://admin-shell.io/aas/3/0"
    )]
    public partial class LangStringShortNameTypeIec61360_TCt : AasSchema.LxBase
    {
        /// <summary>A <see cref="System.String" />, Required : should not be set to null</summary>
        [LxElementValue(
            0,
            "language",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 1,
            MaxOccurs = 1,
            Pattern = "(([a-zA-Z]{2,3}(-[a-zA-Z]{3}(-[a-zA-Z]{3}){2})?|[a-zA-Z]{4}|[a-zA-Z]{5,8})(-[a-zA-Z]{4})?(-([a-zA-Z]{2}|[0-9]{3}))?(-(([a-zA-Z0-9]){5,8}|[0-9]([a-zA-Z0-9]){3}))*(-[0-9A-WY-Za-wy-z](-([a-zA-Z0-9]){2,8})+)*(-[xX](-([a-zA-Z0-9]){1,8})+)?|[xX](-([a-zA-Z0-9]){1,8})+|((en-GB-oed|i-ami|i-bnn|i-default|i-enochian|i-hak|i-klingon|i-lux|i-mingo|i-navajo|i-pwn|i-tao|i-tay|i-tsu|sgn-BE-FR|sgn-BE-NL|sgn-CH-DE)|(art-lojban|cel-gaulish|no-bok|no-nyn|zh-guoyu|zh-hakka|zh-min|zh-min-nan|zh-xiang)))"
        )]
        public System.String Language { get; set; } = "";

        /// <summary>A <see cref="System.String" />, Required : should not be set to null</summary>
        [LxElementValue(
            1,
            "text",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 1,
            MaxOccurs = 1,
            MinLength = "1"
        )]
        public System.String Text { get; set; } = "";
    }

    /// <summary>A class representing the root XSD complexType langStringTextType_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/complexType:langStringTextType_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>1237:3-1241:20</XsdLocation>
    [LxSimpleComplexTypeDefinition("langStringTextType_t", "https://admin-shell.io/aas/3/0")]
    public partial class LangStringTextType_TCt : AasSchema.LxBase
    {
        /// <summary>A <see cref="System.String" />, Required : should not be set to null</summary>
        [LxElementValue(
            0,
            "language",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 1,
            MaxOccurs = 1,
            Pattern = "(([a-zA-Z]{2,3}(-[a-zA-Z]{3}(-[a-zA-Z]{3}){2})?|[a-zA-Z]{4}|[a-zA-Z]{5,8})(-[a-zA-Z]{4})?(-([a-zA-Z]{2}|[0-9]{3}))?(-(([a-zA-Z0-9]){5,8}|[0-9]([a-zA-Z0-9]){3}))*(-[0-9A-WY-Za-wy-z](-([a-zA-Z0-9]){2,8})+)*(-[xX](-([a-zA-Z0-9]){1,8})+)?|[xX](-([a-zA-Z0-9]){1,8})+|((en-GB-oed|i-ami|i-bnn|i-default|i-enochian|i-hak|i-klingon|i-lux|i-mingo|i-navajo|i-pwn|i-tao|i-tay|i-tsu|sgn-BE-FR|sgn-BE-NL|sgn-CH-DE)|(art-lojban|cel-gaulish|no-bok|no-nyn|zh-guoyu|zh-hakka|zh-min|zh-min-nan|zh-xiang)))"
        )]
        public System.String Language { get; set; } = "";

        /// <summary>A <see cref="System.String" />, Required : should not be set to null</summary>
        [LxElementValue(
            1,
            "text",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 1,
            MaxOccurs = 1,
            MinLength = "1"
        )]
        public System.String Text { get; set; } = "";
    }

    /// <summary>A class representing the root XSD complexType levelType_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/complexType:levelType_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>1242:3-1246:20</XsdLocation>
    [LxSimpleComplexTypeDefinition("levelType_t", "https://admin-shell.io/aas/3/0")]
    public partial class LevelType_TCt : AasSchema.LxBase
    {
        /// <summary>A <see cref="System.Boolean" />, Required</summary>
        [LxElementValue(
            0,
            "min",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdBoolean,
            MinOccurs = 1,
            MaxOccurs = 1
        )]
        public System.Boolean Min { get; set; }

        /// <summary>A <see cref="System.Boolean" />, Required</summary>
        [LxElementValue(
            1,
            "nom",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdBoolean,
            MinOccurs = 1,
            MaxOccurs = 1
        )]
        public System.Boolean Nom { get; set; }

        /// <summary>A <see cref="System.Boolean" />, Required</summary>
        [LxElementValue(
            2,
            "typ",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdBoolean,
            MinOccurs = 1,
            MaxOccurs = 1
        )]
        public System.Boolean Typ { get; set; }

        /// <summary>A <see cref="System.Boolean" />, Required</summary>
        [LxElementValue(
            3,
            "max",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdBoolean,
            MinOccurs = 1,
            MaxOccurs = 1
        )]
        public System.Boolean Max { get; set; }
    }

    /// <summary>A class representing the root XSD complexType multiLanguageProperty_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/complexType:multiLanguageProperty_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>1247:3-1251:20</XsdLocation>
    [LxSimpleComplexTypeDefinition("multiLanguageProperty_t", "https://admin-shell.io/aas/3/0")]
    public partial class MultiLanguageProperty_TCt : AasSchema.LxBase
    {
        /// <summary>A <see cref="AasSchema.Tns.AssetAdministrationShell_TCt.ExtensionsElm" />, Optional : null when not set</summary>
        [LxElementRef(0, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetAdministrationShell_TCt.ExtensionsElm? Extensions { get; set; }

        /// <summary>A <see cref="System.String" />, Optional : null when not set</summary>
        [LxElementValue(
            1,
            "category",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 0,
            MaxOccurs = 1,
            MinLength = "1",
            MaxLength = "128"
        )]
        public System.String? Category { get; set; }

        /// <summary>A <see cref="System.String" />, Optional : null when not set</summary>
        [LxElementValue(
            2,
            "idShort",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 0,
            MaxOccurs = 1,
            MinLength = "1",
            MaxLength = "128",
            Pattern = "[a-zA-Z][a-zA-Z0-9_]*"
        )]
        public System.String? IdShort { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.AssetAdministrationShell_TCt.DisplayNameElm" />, Optional : null when not set</summary>
        [LxElementRef(3, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetAdministrationShell_TCt.DisplayNameElm? DisplayName { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.AssetAdministrationShell_TCt.DescriptionElm" />, Optional : null when not set</summary>
        [LxElementRef(4, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetAdministrationShell_TCt.DescriptionElm? Description { get; set; }

        /// <summary>
        ///   A class derived from <see cref="AasSchema.Tns.Reference_TCt" />.<br/><br/>
        ///   Allowable types are <br/>
        ///       <see cref="AasSchema.Tns.Reference_TCt" />
        /// </summary>
        [LxElementCt(
            5,
            "semanticId",
            "https://admin-shell.io/aas/3/0",
            MinOccurs = 0,
            MaxOccurs = 1
        )]
        public AasSchema.Tns.Reference_TCt? SemanticId { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.Extension_TCt.SupplementalSemanticIdsElm" />, Optional : null when not set</summary>
        [LxElementRef(6, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.Extension_TCt.SupplementalSemanticIdsElm? SupplementalSemanticIds { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.Submodel_TCt.QualifiersElm" />, Optional : null when not set</summary>
        [LxElementRef(7, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.Submodel_TCt.QualifiersElm? Qualifiers { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.AdministrativeInformation_TCt.EmbeddedDataSpecificationsElm" />, Optional : null when not set</summary>
        [LxElementRef(8, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AdministrativeInformation_TCt.EmbeddedDataSpecificationsElm? EmbeddedDataSpecifications { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.MultiLanguageProperty_TCt.ValueElm" />, Optional : null when not set</summary>
        [LxElementRef(9, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.MultiLanguageProperty_TCt.ValueElm? Value1 { get; set; }

        /// <summary>
        ///   A class derived from <see cref="AasSchema.Tns.Reference_TCt" />.<br/><br/>
        ///   Allowable types are <br/>
        ///       <see cref="AasSchema.Tns.Reference_TCt" />
        /// </summary>
        [LxElementCt(10, "valueId", "https://admin-shell.io/aas/3/0", MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.Reference_TCt? ValueId { get; set; }

        /// <summary>Represent the inline xs:element value@https://admin-shell.io/aas/3/0.</summary>
        /// <XsdPath>schema:aas.xsd/group:multiLanguageProperty/sequence/element:value</XsdPath>
        /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
        /// <XsdLocation>602:7-608:20</XsdLocation>
        [LxSimpleElementDefinition(
            "value",
            "https://admin-shell.io/aas/3/0",
            ElementScopeType.InlineElement
        )]
        public partial class ValueElm : AasSchema.LxBase
        {
            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.LangStringTextType_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.LangStringTextType_TCt" />
            /// </summary>
            [LxElementCt(
                0,
                "langStringTextType",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.LangStringTextType_TCt> LangStringTextTypes { get; } =
                new List<AasSchema.Tns.LangStringTextType_TCt>();
        }
    }

    /// <summary>A class representing the root XSD complexType operation_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/complexType:operation_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>1257:3-1261:20</XsdLocation>
    [LxSimpleComplexTypeDefinition("operation_t", "https://admin-shell.io/aas/3/0")]
    public partial class Operation_TCt : AasSchema.LxBase
    {
        /// <summary>A <see cref="AasSchema.Tns.AssetAdministrationShell_TCt.ExtensionsElm" />, Optional : null when not set</summary>
        [LxElementRef(0, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetAdministrationShell_TCt.ExtensionsElm? Extensions { get; set; }

        /// <summary>A <see cref="System.String" />, Optional : null when not set</summary>
        [LxElementValue(
            1,
            "category",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 0,
            MaxOccurs = 1,
            MinLength = "1",
            MaxLength = "128"
        )]
        public System.String? Category { get; set; }

        /// <summary>A <see cref="System.String" />, Optional : null when not set</summary>
        [LxElementValue(
            2,
            "idShort",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 0,
            MaxOccurs = 1,
            MinLength = "1",
            MaxLength = "128",
            Pattern = "[a-zA-Z][a-zA-Z0-9_]*"
        )]
        public System.String? IdShort { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.AssetAdministrationShell_TCt.DisplayNameElm" />, Optional : null when not set</summary>
        [LxElementRef(3, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetAdministrationShell_TCt.DisplayNameElm? DisplayName { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.AssetAdministrationShell_TCt.DescriptionElm" />, Optional : null when not set</summary>
        [LxElementRef(4, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetAdministrationShell_TCt.DescriptionElm? Description { get; set; }

        /// <summary>
        ///   A class derived from <see cref="AasSchema.Tns.Reference_TCt" />.<br/><br/>
        ///   Allowable types are <br/>
        ///       <see cref="AasSchema.Tns.Reference_TCt" />
        /// </summary>
        [LxElementCt(
            5,
            "semanticId",
            "https://admin-shell.io/aas/3/0",
            MinOccurs = 0,
            MaxOccurs = 1
        )]
        public AasSchema.Tns.Reference_TCt? SemanticId { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.Extension_TCt.SupplementalSemanticIdsElm" />, Optional : null when not set</summary>
        [LxElementRef(6, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.Extension_TCt.SupplementalSemanticIdsElm? SupplementalSemanticIds { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.Submodel_TCt.QualifiersElm" />, Optional : null when not set</summary>
        [LxElementRef(7, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.Submodel_TCt.QualifiersElm? Qualifiers { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.AdministrativeInformation_TCt.EmbeddedDataSpecificationsElm" />, Optional : null when not set</summary>
        [LxElementRef(8, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AdministrativeInformation_TCt.EmbeddedDataSpecificationsElm? EmbeddedDataSpecifications { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.Operation_TCt.InputVariablesElm" />, Optional : null when not set</summary>
        [LxElementRef(9, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.Operation_TCt.InputVariablesElm? InputVariables { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.Operation_TCt.OutputVariablesElm" />, Optional : null when not set</summary>
        [LxElementRef(10, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.Operation_TCt.OutputVariablesElm? OutputVariables { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.Operation_TCt.InoutputVariablesElm" />, Optional : null when not set</summary>
        [LxElementRef(11, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.Operation_TCt.InoutputVariablesElm? InoutputVariables { get; set; }

        /// <summary>Represent the inline xs:element inputVariables@https://admin-shell.io/aas/3/0.</summary>
        /// <XsdPath>schema:aas.xsd/group:operation/sequence/element:inputVariables</XsdPath>
        /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
        /// <XsdLocation>615:7-621:20</XsdLocation>
        [LxSimpleElementDefinition(
            "inputVariables",
            "https://admin-shell.io/aas/3/0",
            ElementScopeType.InlineElement
        )]
        public partial class InputVariablesElm : AasSchema.LxBase
        {
            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.OperationVariable_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.OperationVariable_TCt" />
            /// </summary>
            [LxElementCt(
                0,
                "operationVariable",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.OperationVariable_TCt> OperationVariables { get; } =
                new List<AasSchema.Tns.OperationVariable_TCt>();
        }

        /// <summary>Represent the inline xs:element outputVariables@https://admin-shell.io/aas/3/0.</summary>
        /// <XsdPath>schema:aas.xsd/group:operation/sequence/element:outputVariables</XsdPath>
        /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
        /// <XsdLocation>622:7-628:20</XsdLocation>
        [LxSimpleElementDefinition(
            "outputVariables",
            "https://admin-shell.io/aas/3/0",
            ElementScopeType.InlineElement
        )]
        public partial class OutputVariablesElm : AasSchema.LxBase
        {
            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.OperationVariable_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.OperationVariable_TCt" />
            /// </summary>
            [LxElementCt(
                0,
                "operationVariable",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.OperationVariable_TCt> OperationVariables { get; } =
                new List<AasSchema.Tns.OperationVariable_TCt>();
        }

        /// <summary>Represent the inline xs:element inoutputVariables@https://admin-shell.io/aas/3/0.</summary>
        /// <XsdPath>schema:aas.xsd/group:operation/sequence/element:inoutputVariables</XsdPath>
        /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
        /// <XsdLocation>629:7-635:20</XsdLocation>
        [LxSimpleElementDefinition(
            "inoutputVariables",
            "https://admin-shell.io/aas/3/0",
            ElementScopeType.InlineElement
        )]
        public partial class InoutputVariablesElm : AasSchema.LxBase
        {
            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.OperationVariable_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.OperationVariable_TCt" />
            /// </summary>
            [LxElementCt(
                0,
                "operationVariable",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.OperationVariable_TCt> OperationVariables { get; } =
                new List<AasSchema.Tns.OperationVariable_TCt>();
        }
    }

    /// <summary>A class representing the root XSD complexType operationVariable_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/complexType:operationVariable_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>1252:3-1256:20</XsdLocation>
    [LxSimpleComplexTypeDefinition("operationVariable_t", "https://admin-shell.io/aas/3/0")]
    public partial class OperationVariable_TCt : AasSchema.LxBase
    {
        /// <summary>A <see cref="AasSchema.Tns.OperationVariable_TCt.ValueElm" />, Required : should not be set to null</summary>
        [LxElementRef(0, MinOccurs = 1, MaxOccurs = 1)]
        public AasSchema.Tns.OperationVariable_TCt.ValueElm Value1 { get; set; } =
            new AasSchema.Tns.OperationVariable_TCt.ValueElm();

        /// <summary>Represent the inline xs:element value@https://admin-shell.io/aas/3/0.</summary>
        /// <XsdPath>schema:aas.xsd/group:operationVariable/sequence/element:value</XsdPath>
        /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
        /// <XsdLocation>640:7-646:20</XsdLocation>
        [LxSimpleElementDefinition(
            "value",
            "https://admin-shell.io/aas/3/0",
            ElementScopeType.InlineElement
        )]
        public partial class ValueElm : AasSchema.LxBase
        {
            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.RelationshipElement_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.RelationshipElement_TCt" />
            /// </summary>
            [LxElementCt(
                0,
                "relationshipElement",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = 1
            )]
            public AasSchema.Tns.RelationshipElement_TCt? RelationshipElement { get; set; }

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.AnnotatedRelationshipElement_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.AnnotatedRelationshipElement_TCt" />
            /// </summary>
            [LxElementCt(
                1,
                "annotatedRelationshipElement",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = 1
            )]
            public AasSchema.Tns.AnnotatedRelationshipElement_TCt? AnnotatedRelationshipElement { get; set; }

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.BasicEventElement_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.BasicEventElement_TCt" />
            /// </summary>
            [LxElementCt(
                2,
                "basicEventElement",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = 1
            )]
            public AasSchema.Tns.BasicEventElement_TCt? BasicEventElement { get; set; }

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.Blob_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.Blob_TCt" />
            /// </summary>
            [LxElementCt(3, "blob", "https://admin-shell.io/aas/3/0", MinOccurs = 0, MaxOccurs = 1)]
            public AasSchema.Tns.Blob_TCt? Blob { get; set; }

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.Capability_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.Capability_TCt" />
            /// </summary>
            [LxElementCt(
                4,
                "capability",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = 1
            )]
            public AasSchema.Tns.Capability_TCt? Capability { get; set; }

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.Entity_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.Entity_TCt" />
            /// </summary>
            [LxElementCt(
                5,
                "entity",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = 1
            )]
            public AasSchema.Tns.Entity_TCt? Entity { get; set; }

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.File_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.File_TCt" />
            /// </summary>
            [LxElementCt(6, "file", "https://admin-shell.io/aas/3/0", MinOccurs = 0, MaxOccurs = 1)]
            public AasSchema.Tns.File_TCt? File { get; set; }

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.MultiLanguageProperty_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.MultiLanguageProperty_TCt" />
            /// </summary>
            [LxElementCt(
                7,
                "multiLanguageProperty",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = 1
            )]
            public AasSchema.Tns.MultiLanguageProperty_TCt? MultiLanguageProperty { get; set; }

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.Operation_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.Operation_TCt" />
            /// </summary>
            [LxElementCt(
                8,
                "operation",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = 1
            )]
            public AasSchema.Tns.Operation_TCt? Operation { get; set; }

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.Property_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.Property_TCt" />
            /// </summary>
            [LxElementCt(
                9,
                "property",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = 1
            )]
            public AasSchema.Tns.Property_TCt? Property { get; set; }

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.Range_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.Range_TCt" />
            /// </summary>
            [LxElementCt(
                10,
                "range",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = 1
            )]
            public AasSchema.Tns.Range_TCt? Range { get; set; }

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.ReferenceElement_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.ReferenceElement_TCt" />
            /// </summary>
            [LxElementCt(
                11,
                "referenceElement",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = 1
            )]
            public AasSchema.Tns.ReferenceElement_TCt? ReferenceElement { get; set; }

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.SubmodelElementCollection_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.SubmodelElementCollection_TCt" />
            /// </summary>
            [LxElementCt(
                12,
                "submodelElementCollection",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = 1
            )]
            public AasSchema.Tns.SubmodelElementCollection_TCt? SubmodelElementCollection { get; set; }

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.SubmodelElementList_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.SubmodelElementList_TCt" />
            /// </summary>
            [LxElementCt(
                13,
                "submodelElementList",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = 1
            )]
            public AasSchema.Tns.SubmodelElementList_TCt? SubmodelElementList { get; set; }
        }
    }

    /// <summary>A class representing the root XSD complexType property_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/complexType:property_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>1262:3-1266:20</XsdLocation>
    [LxSimpleComplexTypeDefinition("property_t", "https://admin-shell.io/aas/3/0")]
    public partial class Property_TCt : AasSchema.LxBase
    {
        /// <summary>A <see cref="AasSchema.Tns.AssetAdministrationShell_TCt.ExtensionsElm" />, Optional : null when not set</summary>
        [LxElementRef(0, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetAdministrationShell_TCt.ExtensionsElm? Extensions { get; set; }

        /// <summary>A <see cref="System.String" />, Optional : null when not set</summary>
        [LxElementValue(
            1,
            "category",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 0,
            MaxOccurs = 1,
            MinLength = "1",
            MaxLength = "128"
        )]
        public System.String? Category { get; set; }

        /// <summary>A <see cref="System.String" />, Optional : null when not set</summary>
        [LxElementValue(
            2,
            "idShort",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 0,
            MaxOccurs = 1,
            MinLength = "1",
            MaxLength = "128",
            Pattern = "[a-zA-Z][a-zA-Z0-9_]*"
        )]
        public System.String? IdShort { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.AssetAdministrationShell_TCt.DisplayNameElm" />, Optional : null when not set</summary>
        [LxElementRef(3, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetAdministrationShell_TCt.DisplayNameElm? DisplayName { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.AssetAdministrationShell_TCt.DescriptionElm" />, Optional : null when not set</summary>
        [LxElementRef(4, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetAdministrationShell_TCt.DescriptionElm? Description { get; set; }

        /// <summary>
        ///   A class derived from <see cref="AasSchema.Tns.Reference_TCt" />.<br/><br/>
        ///   Allowable types are <br/>
        ///       <see cref="AasSchema.Tns.Reference_TCt" />
        /// </summary>
        [LxElementCt(
            5,
            "semanticId",
            "https://admin-shell.io/aas/3/0",
            MinOccurs = 0,
            MaxOccurs = 1
        )]
        public AasSchema.Tns.Reference_TCt? SemanticId { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.Extension_TCt.SupplementalSemanticIdsElm" />, Optional : null when not set</summary>
        [LxElementRef(6, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.Extension_TCt.SupplementalSemanticIdsElm? SupplementalSemanticIds { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.Submodel_TCt.QualifiersElm" />, Optional : null when not set</summary>
        [LxElementRef(7, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.Submodel_TCt.QualifiersElm? Qualifiers { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.AdministrativeInformation_TCt.EmbeddedDataSpecificationsElm" />, Optional : null when not set</summary>
        [LxElementRef(8, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AdministrativeInformation_TCt.EmbeddedDataSpecificationsElm? EmbeddedDataSpecifications { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.DataTypeDefXsd_T1Enum" />, Required</summary>
        [LxElementValue(
            9,
            "valueType",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Enum,
            XsdType.Enum,
            MinOccurs = 1,
            MaxOccurs = 1,
            WhiteSpace = WhiteSpaceType.Preserve
        )]
        public AasSchema.Tns.DataTypeDefXsd_T1Enum ValueType { get; set; }

        /// <summary>A <see cref="System.String" />, Optional : null when not set</summary>
        [LxElementValue(
            10,
            "value",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 0,
            MaxOccurs = 1
        )]
        public System.String? Value1 { get; set; }

        /// <summary>
        ///   A class derived from <see cref="AasSchema.Tns.Reference_TCt" />.<br/><br/>
        ///   Allowable types are <br/>
        ///       <see cref="AasSchema.Tns.Reference_TCt" />
        /// </summary>
        [LxElementCt(11, "valueId", "https://admin-shell.io/aas/3/0", MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.Reference_TCt? ValueId { get; set; }
    }

    /// <summary>A class representing the root XSD complexType qualifiable_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/complexType:qualifiable_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>1267:3-1271:20</XsdLocation>
    [LxSimpleComplexTypeDefinition("qualifiable_t", "https://admin-shell.io/aas/3/0")]
    public partial class Qualifiable_TCt : AasSchema.LxBase
    {
        /// <summary>A <see cref="AasSchema.Tns.Submodel_TCt.QualifiersElm" />, Optional : null when not set</summary>
        [LxElementRef(0, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.Submodel_TCt.QualifiersElm? Qualifiers { get; set; }
    }

    /// <summary>A class representing the root XSD complexType qualifier_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/complexType:qualifier_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>1272:3-1276:20</XsdLocation>
    [LxSimpleComplexTypeDefinition("qualifier_t", "https://admin-shell.io/aas/3/0")]
    public partial class Qualifier_TCt : AasSchema.LxBase
    {
        /// <summary>
        ///   A class derived from <see cref="AasSchema.Tns.Reference_TCt" />.<br/><br/>
        ///   Allowable types are <br/>
        ///       <see cref="AasSchema.Tns.Reference_TCt" />
        /// </summary>
        [LxElementCt(
            0,
            "semanticId",
            "https://admin-shell.io/aas/3/0",
            MinOccurs = 0,
            MaxOccurs = 1
        )]
        public AasSchema.Tns.Reference_TCt? SemanticId { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.Extension_TCt.SupplementalSemanticIdsElm" />, Optional : null when not set</summary>
        [LxElementRef(1, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.Extension_TCt.SupplementalSemanticIdsElm? SupplementalSemanticIds { get; set; }

        /// <summary>A nullable <see cref="AasSchema.Tns.QualifierKind_T1Enum" />, Optional : null when not set</summary>
        [LxElementValue(
            2,
            "kind",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Enum,
            XsdType.Enum,
            MinOccurs = 0,
            MaxOccurs = 1,
            WhiteSpace = WhiteSpaceType.Preserve
        )]
        public AasSchema.Tns.QualifierKind_T1Enum? Kind { get; set; }

        /// <summary>A <see cref="System.String" />, Required : should not be set to null</summary>
        [LxElementValue(
            3,
            "type",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 1,
            MaxOccurs = 1,
            MinLength = "1",
            MaxLength = "128"
        )]
        public System.String Type { get; set; } = "";

        /// <summary>A <see cref="AasSchema.Tns.DataTypeDefXsd_T1Enum" />, Required</summary>
        [LxElementValue(
            4,
            "valueType",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Enum,
            XsdType.Enum,
            MinOccurs = 1,
            MaxOccurs = 1,
            WhiteSpace = WhiteSpaceType.Preserve
        )]
        public AasSchema.Tns.DataTypeDefXsd_T1Enum ValueType { get; set; }

        /// <summary>A <see cref="System.String" />, Optional : null when not set</summary>
        [LxElementValue(
            5,
            "value",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 0,
            MaxOccurs = 1
        )]
        public System.String? Value1 { get; set; }

        /// <summary>
        ///   A class derived from <see cref="AasSchema.Tns.Reference_TCt" />.<br/><br/>
        ///   Allowable types are <br/>
        ///       <see cref="AasSchema.Tns.Reference_TCt" />
        /// </summary>
        [LxElementCt(6, "valueId", "https://admin-shell.io/aas/3/0", MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.Reference_TCt? ValueId { get; set; }
    }

    /// <summary>A class representing the root XSD complexType range_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/complexType:range_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>1277:3-1281:20</XsdLocation>
    [LxSimpleComplexTypeDefinition("range_t", "https://admin-shell.io/aas/3/0")]
    public partial class Range_TCt : AasSchema.LxBase
    {
        /// <summary>A <see cref="AasSchema.Tns.AssetAdministrationShell_TCt.ExtensionsElm" />, Optional : null when not set</summary>
        [LxElementRef(0, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetAdministrationShell_TCt.ExtensionsElm? Extensions { get; set; }

        /// <summary>A <see cref="System.String" />, Optional : null when not set</summary>
        [LxElementValue(
            1,
            "category",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 0,
            MaxOccurs = 1,
            MinLength = "1",
            MaxLength = "128"
        )]
        public System.String? Category { get; set; }

        /// <summary>A <see cref="System.String" />, Optional : null when not set</summary>
        [LxElementValue(
            2,
            "idShort",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 0,
            MaxOccurs = 1,
            MinLength = "1",
            MaxLength = "128",
            Pattern = "[a-zA-Z][a-zA-Z0-9_]*"
        )]
        public System.String? IdShort { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.AssetAdministrationShell_TCt.DisplayNameElm" />, Optional : null when not set</summary>
        [LxElementRef(3, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetAdministrationShell_TCt.DisplayNameElm? DisplayName { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.AssetAdministrationShell_TCt.DescriptionElm" />, Optional : null when not set</summary>
        [LxElementRef(4, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetAdministrationShell_TCt.DescriptionElm? Description { get; set; }

        /// <summary>
        ///   A class derived from <see cref="AasSchema.Tns.Reference_TCt" />.<br/><br/>
        ///   Allowable types are <br/>
        ///       <see cref="AasSchema.Tns.Reference_TCt" />
        /// </summary>
        [LxElementCt(
            5,
            "semanticId",
            "https://admin-shell.io/aas/3/0",
            MinOccurs = 0,
            MaxOccurs = 1
        )]
        public AasSchema.Tns.Reference_TCt? SemanticId { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.Extension_TCt.SupplementalSemanticIdsElm" />, Optional : null when not set</summary>
        [LxElementRef(6, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.Extension_TCt.SupplementalSemanticIdsElm? SupplementalSemanticIds { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.Submodel_TCt.QualifiersElm" />, Optional : null when not set</summary>
        [LxElementRef(7, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.Submodel_TCt.QualifiersElm? Qualifiers { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.AdministrativeInformation_TCt.EmbeddedDataSpecificationsElm" />, Optional : null when not set</summary>
        [LxElementRef(8, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AdministrativeInformation_TCt.EmbeddedDataSpecificationsElm? EmbeddedDataSpecifications { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.DataTypeDefXsd_T1Enum" />, Required</summary>
        [LxElementValue(
            9,
            "valueType",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Enum,
            XsdType.Enum,
            MinOccurs = 1,
            MaxOccurs = 1,
            WhiteSpace = WhiteSpaceType.Preserve
        )]
        public AasSchema.Tns.DataTypeDefXsd_T1Enum ValueType { get; set; }

        /// <summary>A <see cref="System.String" />, Optional : null when not set</summary>
        [LxElementValue(
            10,
            "min",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 0,
            MaxOccurs = 1
        )]
        public System.String? Min { get; set; }

        /// <summary>A <see cref="System.String" />, Optional : null when not set</summary>
        [LxElementValue(
            11,
            "max",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 0,
            MaxOccurs = 1
        )]
        public System.String? Max { get; set; }
    }

    /// <summary>A class representing the root XSD complexType referable_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/complexType:referable_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>1282:3-1286:20</XsdLocation>
    [LxSimpleComplexTypeDefinition("referable_t", "https://admin-shell.io/aas/3/0")]
    public partial class Referable_TCt : AasSchema.LxBase
    {
        /// <summary>A <see cref="AasSchema.Tns.AssetAdministrationShell_TCt.ExtensionsElm" />, Optional : null when not set</summary>
        [LxElementRef(0, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetAdministrationShell_TCt.ExtensionsElm? Extensions { get; set; }

        /// <summary>A <see cref="System.String" />, Optional : null when not set</summary>
        [LxElementValue(
            1,
            "category",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 0,
            MaxOccurs = 1,
            MinLength = "1",
            MaxLength = "128"
        )]
        public System.String? Category { get; set; }

        /// <summary>A <see cref="System.String" />, Optional : null when not set</summary>
        [LxElementValue(
            2,
            "idShort",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 0,
            MaxOccurs = 1,
            MinLength = "1",
            MaxLength = "128",
            Pattern = "[a-zA-Z][a-zA-Z0-9_]*"
        )]
        public System.String? IdShort { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.AssetAdministrationShell_TCt.DisplayNameElm" />, Optional : null when not set</summary>
        [LxElementRef(3, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetAdministrationShell_TCt.DisplayNameElm? DisplayName { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.AssetAdministrationShell_TCt.DescriptionElm" />, Optional : null when not set</summary>
        [LxElementRef(4, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetAdministrationShell_TCt.DescriptionElm? Description { get; set; }
    }

    /// <summary>A class representing the root XSD complexType reference_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/complexType:reference_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>1292:3-1296:20</XsdLocation>
    [LxSimpleComplexTypeDefinition("reference_t", "https://admin-shell.io/aas/3/0")]
    public partial class Reference_TCt : AasSchema.LxBase
    {
        /// <summary>A <see cref="AasSchema.Tns.ReferenceTypes_T1Enum" />, Required</summary>
        [LxElementValue(
            0,
            "type",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Enum,
            XsdType.Enum,
            MinOccurs = 1,
            MaxOccurs = 1,
            WhiteSpace = WhiteSpaceType.Preserve
        )]
        public AasSchema.Tns.ReferenceTypes_T1Enum Type { get; set; }

        /// <summary>
        ///   A class derived from <see cref="AasSchema.Tns.Reference_TCt" />.<br/><br/>
        ///   Allowable types are <br/>
        ///       <see cref="AasSchema.Tns.Reference_TCt" />
        /// </summary>
        [LxElementCt(
            1,
            "referredSemanticId",
            "https://admin-shell.io/aas/3/0",
            MinOccurs = 0,
            MaxOccurs = 1
        )]
        public AasSchema.Tns.Reference_TCt? ReferredSemanticId { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.Reference_TCt.KeysElm" />, Required : should not be set to null</summary>
        [LxElementRef(2, MinOccurs = 1, MaxOccurs = 1)]
        public AasSchema.Tns.Reference_TCt.KeysElm Keys { get; set; } =
            new AasSchema.Tns.Reference_TCt.KeysElm();

        /// <summary>Represent the inline xs:element keys@https://admin-shell.io/aas/3/0.</summary>
        /// <XsdPath>schema:aas.xsd/group:reference/sequence/element:keys</XsdPath>
        /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
        /// <XsdLocation>773:7-779:20</XsdLocation>
        [LxSimpleElementDefinition(
            "keys",
            "https://admin-shell.io/aas/3/0",
            ElementScopeType.InlineElement
        )]
        public partial class KeysElm : AasSchema.LxBase
        {
            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.Key_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.Key_TCt" />
            /// </summary>
            [LxElementCt(
                0,
                "key",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.Key_TCt> Keys { get; } = new List<AasSchema.Tns.Key_TCt>();
        }
    }

    /// <summary>A class representing the root XSD complexType referenceElement_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/complexType:referenceElement_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>1287:3-1291:20</XsdLocation>
    [LxSimpleComplexTypeDefinition("referenceElement_t", "https://admin-shell.io/aas/3/0")]
    public partial class ReferenceElement_TCt : AasSchema.LxBase
    {
        /// <summary>A <see cref="AasSchema.Tns.AssetAdministrationShell_TCt.ExtensionsElm" />, Optional : null when not set</summary>
        [LxElementRef(0, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetAdministrationShell_TCt.ExtensionsElm? Extensions { get; set; }

        /// <summary>A <see cref="System.String" />, Optional : null when not set</summary>
        [LxElementValue(
            1,
            "category",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 0,
            MaxOccurs = 1,
            MinLength = "1",
            MaxLength = "128"
        )]
        public System.String? Category { get; set; }

        /// <summary>A <see cref="System.String" />, Optional : null when not set</summary>
        [LxElementValue(
            2,
            "idShort",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 0,
            MaxOccurs = 1,
            MinLength = "1",
            MaxLength = "128",
            Pattern = "[a-zA-Z][a-zA-Z0-9_]*"
        )]
        public System.String? IdShort { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.AssetAdministrationShell_TCt.DisplayNameElm" />, Optional : null when not set</summary>
        [LxElementRef(3, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetAdministrationShell_TCt.DisplayNameElm? DisplayName { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.AssetAdministrationShell_TCt.DescriptionElm" />, Optional : null when not set</summary>
        [LxElementRef(4, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetAdministrationShell_TCt.DescriptionElm? Description { get; set; }

        /// <summary>
        ///   A class derived from <see cref="AasSchema.Tns.Reference_TCt" />.<br/><br/>
        ///   Allowable types are <br/>
        ///       <see cref="AasSchema.Tns.Reference_TCt" />
        /// </summary>
        [LxElementCt(
            5,
            "semanticId",
            "https://admin-shell.io/aas/3/0",
            MinOccurs = 0,
            MaxOccurs = 1
        )]
        public AasSchema.Tns.Reference_TCt? SemanticId { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.Extension_TCt.SupplementalSemanticIdsElm" />, Optional : null when not set</summary>
        [LxElementRef(6, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.Extension_TCt.SupplementalSemanticIdsElm? SupplementalSemanticIds { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.Submodel_TCt.QualifiersElm" />, Optional : null when not set</summary>
        [LxElementRef(7, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.Submodel_TCt.QualifiersElm? Qualifiers { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.AdministrativeInformation_TCt.EmbeddedDataSpecificationsElm" />, Optional : null when not set</summary>
        [LxElementRef(8, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AdministrativeInformation_TCt.EmbeddedDataSpecificationsElm? EmbeddedDataSpecifications { get; set; }

        /// <summary>
        ///   A class derived from <see cref="AasSchema.Tns.Reference_TCt" />.<br/><br/>
        ///   Allowable types are <br/>
        ///       <see cref="AasSchema.Tns.Reference_TCt" />
        /// </summary>
        [LxElementCt(9, "value", "https://admin-shell.io/aas/3/0", MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.Reference_TCt? Value1 { get; set; }
    }

    /// <summary>A class representing the root XSD complexType relationshipElement_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/complexType:relationshipElement_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>1297:3-1301:20</XsdLocation>
    [LxSimpleComplexTypeDefinition("relationshipElement_t", "https://admin-shell.io/aas/3/0")]
    public partial class RelationshipElement_TCt : AasSchema.LxBase
    {
        /// <summary>A <see cref="AasSchema.Tns.AssetAdministrationShell_TCt.ExtensionsElm" />, Optional : null when not set</summary>
        [LxElementRef(0, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetAdministrationShell_TCt.ExtensionsElm? Extensions { get; set; }

        /// <summary>A <see cref="System.String" />, Optional : null when not set</summary>
        [LxElementValue(
            1,
            "category",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 0,
            MaxOccurs = 1,
            MinLength = "1",
            MaxLength = "128"
        )]
        public System.String? Category { get; set; }

        /// <summary>A <see cref="System.String" />, Optional : null when not set</summary>
        [LxElementValue(
            2,
            "idShort",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 0,
            MaxOccurs = 1,
            MinLength = "1",
            MaxLength = "128",
            Pattern = "[a-zA-Z][a-zA-Z0-9_]*"
        )]
        public System.String? IdShort { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.AssetAdministrationShell_TCt.DisplayNameElm" />, Optional : null when not set</summary>
        [LxElementRef(3, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetAdministrationShell_TCt.DisplayNameElm? DisplayName { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.AssetAdministrationShell_TCt.DescriptionElm" />, Optional : null when not set</summary>
        [LxElementRef(4, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetAdministrationShell_TCt.DescriptionElm? Description { get; set; }

        /// <summary>
        ///   A class derived from <see cref="AasSchema.Tns.Reference_TCt" />.<br/><br/>
        ///   Allowable types are <br/>
        ///       <see cref="AasSchema.Tns.Reference_TCt" />
        /// </summary>
        [LxElementCt(
            5,
            "semanticId",
            "https://admin-shell.io/aas/3/0",
            MinOccurs = 0,
            MaxOccurs = 1
        )]
        public AasSchema.Tns.Reference_TCt? SemanticId { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.Extension_TCt.SupplementalSemanticIdsElm" />, Optional : null when not set</summary>
        [LxElementRef(6, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.Extension_TCt.SupplementalSemanticIdsElm? SupplementalSemanticIds { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.Submodel_TCt.QualifiersElm" />, Optional : null when not set</summary>
        [LxElementRef(7, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.Submodel_TCt.QualifiersElm? Qualifiers { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.AdministrativeInformation_TCt.EmbeddedDataSpecificationsElm" />, Optional : null when not set</summary>
        [LxElementRef(8, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AdministrativeInformation_TCt.EmbeddedDataSpecificationsElm? EmbeddedDataSpecifications { get; set; }

        /// <summary>
        ///   A class derived from <see cref="AasSchema.Tns.Reference_TCt" />.<br/><br/>
        ///   Allowable types are <br/>
        ///       <see cref="AasSchema.Tns.Reference_TCt" />
        /// </summary>
        [LxElementCt(9, "first", "https://admin-shell.io/aas/3/0", MinOccurs = 1, MaxOccurs = 1)]
        public AasSchema.Tns.Reference_TCt First { get; set; } = new AasSchema.Tns.Reference_TCt();

        /// <summary>
        ///   A class derived from <see cref="AasSchema.Tns.Reference_TCt" />.<br/><br/>
        ///   Allowable types are <br/>
        ///       <see cref="AasSchema.Tns.Reference_TCt" />
        /// </summary>
        [LxElementCt(10, "second", "https://admin-shell.io/aas/3/0", MinOccurs = 1, MaxOccurs = 1)]
        public AasSchema.Tns.Reference_TCt Second { get; set; } = new AasSchema.Tns.Reference_TCt();
    }

    /// <summary>A class representing the root XSD complexType resource_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/complexType:resource_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>1302:3-1306:20</XsdLocation>
    [LxSimpleComplexTypeDefinition("resource_t", "https://admin-shell.io/aas/3/0")]
    public partial class Resource_TCt : AasSchema.LxBase
    {
        /// <summary>A <see cref="System.String" />, Required : should not be set to null</summary>
        [LxElementValue(
            0,
            "path",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 1,
            MaxOccurs = 1,
            MinLength = "1",
            MaxLength = "2000",
            Pattern = "file:(//((localhost|(\\[((([0-9A-Fa-f]{1,4}:){6}([0-9A-Fa-f]{1,4}:[0-9A-Fa-f]{1,4}|([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))|::([0-9A-Fa-f]{1,4}:){5}([0-9A-Fa-f]{1,4}:[0-9A-Fa-f]{1,4}|([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))|([0-9A-Fa-f]{1,4})?::([0-9A-Fa-f]{1,4}:){4}([0-9A-Fa-f]{1,4}:[0-9A-Fa-f]{1,4}|([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))|(([0-9A-Fa-f]{1,4}:)?[0-9A-Fa-f]{1,4})?::([0-9A-Fa-f]{1,4}:){3}([0-9A-Fa-f]{1,4}:[0-9A-Fa-f]{1,4}|([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))|(([0-9A-Fa-f]{1,4}:){2}[0-9A-Fa-f]{1,4})?::([0-9A-Fa-f]{1,4}:){2}([0-9A-Fa-f]{1,4}:[0-9A-Fa-f]{1,4}|([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))|(([0-9A-Fa-f]{1,4}:){3}[0-9A-Fa-f]{1,4})?::[0-9A-Fa-f]{1,4}:([0-9A-Fa-f]{1,4}:[0-9A-Fa-f]{1,4}|([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))|(([0-9A-Fa-f]{1,4}:){4}[0-9A-Fa-f]{1,4})?::([0-9A-Fa-f]{1,4}:[0-9A-Fa-f]{1,4}|([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))|(([0-9A-Fa-f]{1,4}:){5}[0-9A-Fa-f]{1,4})?::[0-9A-Fa-f]{1,4}|(([0-9A-Fa-f]{1,4}:){6}[0-9A-Fa-f]{1,4})?::)|[vV][0-9A-Fa-f]+\\.([a-zA-Z0-9\\-._~]|[!$&'()*+,;=]|:)+)\\]|([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])|([a-zA-Z0-9\\-._~]|%[0-9A-Fa-f][0-9A-Fa-f]|[!$&'()*+,;=])*)))?/((([a-zA-Z0-9\\-._~]|%[0-9A-Fa-f][0-9A-Fa-f]|[!$&'()*+,;=]|[:@]))+(/(([a-zA-Z0-9\\-._~]|%[0-9A-Fa-f][0-9A-Fa-f]|[!$&'()*+,;=]|[:@]))*)*)?|/((([a-zA-Z0-9\\-._~]|%[0-9A-Fa-f][0-9A-Fa-f]|[!$&'()*+,;=]|[:@]))+(/(([a-zA-Z0-9\\-._~]|%[0-9A-Fa-f][0-9A-Fa-f]|[!$&'()*+,;=]|[:@]))*)*)?)"
        )]
        public System.String Path { get; set; } = "";

        /// <summary>A <see cref="System.String" />, Optional : null when not set</summary>
        [LxElementValue(
            1,
            "contentType",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 0,
            MaxOccurs = 1,
            MinLength = "1",
            MaxLength = "100",
            Pattern = "([!#$%&'*+\\-.^_`|~0-9a-zA-Z])+/([!#$%&'*+\\-.^_`|~0-9a-zA-Z])+([ \\t]*;[ \\t]*([!#$%&'*+\\-.^_`|~0-9a-zA-Z])+=(([!#$%&'*+\\-.^_`|~0-9a-zA-Z])+|\"(([\\t !#-\\[\\]-~]|[-ÿ])|\\\\([\\t !-~]|[-ÿ]))*\"))*"
        )]
        public System.String? ContentType { get; set; }
    }

    /// <summary>A class representing the root XSD complexType specificAssetId_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/complexType:specificAssetId_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>1307:3-1311:20</XsdLocation>
    [LxSimpleComplexTypeDefinition("specificAssetId_t", "https://admin-shell.io/aas/3/0")]
    public partial class SpecificAssetId_TCt : AasSchema.LxBase
    {
        /// <summary>
        ///   A class derived from <see cref="AasSchema.Tns.Reference_TCt" />.<br/><br/>
        ///   Allowable types are <br/>
        ///       <see cref="AasSchema.Tns.Reference_TCt" />
        /// </summary>
        [LxElementCt(
            0,
            "semanticId",
            "https://admin-shell.io/aas/3/0",
            MinOccurs = 0,
            MaxOccurs = 1
        )]
        public AasSchema.Tns.Reference_TCt? SemanticId { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.Extension_TCt.SupplementalSemanticIdsElm" />, Optional : null when not set</summary>
        [LxElementRef(1, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.Extension_TCt.SupplementalSemanticIdsElm? SupplementalSemanticIds { get; set; }

        /// <summary>A <see cref="System.String" />, Required : should not be set to null</summary>
        [LxElementValue(
            2,
            "name",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 1,
            MaxOccurs = 1,
            MinLength = "1",
            MaxLength = "64"
        )]
        public System.String Name { get; set; } = "";

        /// <summary>A <see cref="System.String" />, Required : should not be set to null</summary>
        [LxElementValue(
            3,
            "value",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 1,
            MaxOccurs = 1,
            MinLength = "1",
            MaxLength = "2000"
        )]
        public System.String Value1 { get; set; } = "";

        /// <summary>
        ///   A class derived from <see cref="AasSchema.Tns.Reference_TCt" />.<br/><br/>
        ///   Allowable types are <br/>
        ///       <see cref="AasSchema.Tns.Reference_TCt" />
        /// </summary>
        [LxElementCt(
            4,
            "externalSubjectId",
            "https://admin-shell.io/aas/3/0",
            MinOccurs = 0,
            MaxOccurs = 1
        )]
        public AasSchema.Tns.Reference_TCt? ExternalSubjectId { get; set; }
    }

    /// <summary>A class representing the root XSD complexType submodel_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/complexType:submodel_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>1327:3-1331:20</XsdLocation>
    [LxSimpleComplexTypeDefinition("submodel_t", "https://admin-shell.io/aas/3/0")]
    public partial class Submodel_TCt : AasSchema.LxBase
    {
        /// <summary>A <see cref="AasSchema.Tns.AssetAdministrationShell_TCt.ExtensionsElm" />, Optional : null when not set</summary>
        [LxElementRef(0, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetAdministrationShell_TCt.ExtensionsElm? Extensions { get; set; }

        /// <summary>A <see cref="System.String" />, Optional : null when not set</summary>
        [LxElementValue(
            1,
            "category",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 0,
            MaxOccurs = 1,
            MinLength = "1",
            MaxLength = "128"
        )]
        public System.String? Category { get; set; }

        /// <summary>A <see cref="System.String" />, Optional : null when not set</summary>
        [LxElementValue(
            2,
            "idShort",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 0,
            MaxOccurs = 1,
            MinLength = "1",
            MaxLength = "128",
            Pattern = "[a-zA-Z][a-zA-Z0-9_]*"
        )]
        public System.String? IdShort { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.AssetAdministrationShell_TCt.DisplayNameElm" />, Optional : null when not set</summary>
        [LxElementRef(3, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetAdministrationShell_TCt.DisplayNameElm? DisplayName { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.AssetAdministrationShell_TCt.DescriptionElm" />, Optional : null when not set</summary>
        [LxElementRef(4, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetAdministrationShell_TCt.DescriptionElm? Description { get; set; }

        /// <summary>
        ///   A class derived from <see cref="AasSchema.Tns.AdministrativeInformation_TCt" />.<br/><br/>
        ///   Allowable types are <br/>
        ///       <see cref="AasSchema.Tns.AdministrativeInformation_TCt" />
        /// </summary>
        [LxElementCt(
            5,
            "administration",
            "https://admin-shell.io/aas/3/0",
            MinOccurs = 0,
            MaxOccurs = 1
        )]
        public AasSchema.Tns.AdministrativeInformation_TCt? Administration { get; set; }

        /// <summary>A <see cref="System.String" />, Required : should not be set to null</summary>
        [LxElementValue(
            6,
            "id",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 1,
            MaxOccurs = 1,
            MinLength = "1",
            MaxLength = "2000"
        )]
        public System.String Id { get; set; } = "";

        /// <summary>A nullable <see cref="AasSchema.Tns.ModellingKind_T1Enum" />, Optional : null when not set</summary>
        [LxElementValue(
            7,
            "kind",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Enum,
            XsdType.Enum,
            MinOccurs = 0,
            MaxOccurs = 1,
            WhiteSpace = WhiteSpaceType.Preserve
        )]
        public AasSchema.Tns.ModellingKind_T1Enum? Kind { get; set; }

        /// <summary>
        ///   A class derived from <see cref="AasSchema.Tns.Reference_TCt" />.<br/><br/>
        ///   Allowable types are <br/>
        ///       <see cref="AasSchema.Tns.Reference_TCt" />
        /// </summary>
        [LxElementCt(
            8,
            "semanticId",
            "https://admin-shell.io/aas/3/0",
            MinOccurs = 0,
            MaxOccurs = 1
        )]
        public AasSchema.Tns.Reference_TCt? SemanticId { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.Extension_TCt.SupplementalSemanticIdsElm" />, Optional : null when not set</summary>
        [LxElementRef(9, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.Extension_TCt.SupplementalSemanticIdsElm? SupplementalSemanticIds { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.Submodel_TCt.QualifiersElm" />, Optional : null when not set</summary>
        [LxElementRef(10, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.Submodel_TCt.QualifiersElm? Qualifiers { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.AdministrativeInformation_TCt.EmbeddedDataSpecificationsElm" />, Optional : null when not set</summary>
        [LxElementRef(11, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AdministrativeInformation_TCt.EmbeddedDataSpecificationsElm? EmbeddedDataSpecifications { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.Submodel_TCt.SubmodelElementsElm" />, Optional : null when not set</summary>
        [LxElementRef(12, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.Submodel_TCt.SubmodelElementsElm? SubmodelElements { get; set; }

        /// <summary>Represent the inline xs:element qualifiers@https://admin-shell.io/aas/3/0.</summary>
        /// <XsdPath>schema:aas.xsd/group:qualifiable/sequence/element:qualifiers</XsdPath>
        /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
        /// <XsdLocation>659:7-665:20</XsdLocation>
        [LxSimpleElementDefinition(
            "qualifiers",
            "https://admin-shell.io/aas/3/0",
            ElementScopeType.InlineElement
        )]
        public partial class QualifiersElm : AasSchema.LxBase
        {
            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.Qualifier_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.Qualifier_TCt" />
            /// </summary>
            [LxElementCt(
                0,
                "qualifier",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.Qualifier_TCt> Qualifiers { get; } =
                new List<AasSchema.Tns.Qualifier_TCt>();
        }

        /// <summary>Represent the inline xs:element submodelElements@https://admin-shell.io/aas/3/0.</summary>
        /// <XsdPath>schema:aas.xsd/group:submodel/sequence/element:submodelElements</XsdPath>
        /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
        /// <XsdLocation>852:7-858:20</XsdLocation>
        [LxSimpleElementDefinition(
            "submodelElements",
            "https://admin-shell.io/aas/3/0",
            ElementScopeType.InlineElement
        )]
        public partial class SubmodelElementsElm : AasSchema.LxBase
        {
            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.RelationshipElement_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.RelationshipElement_TCt" />
            /// </summary>
            [LxElementCt(
                0,
                "relationshipElement",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.RelationshipElement_TCt> RelationshipElements { get; } =
                new List<AasSchema.Tns.RelationshipElement_TCt>();

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.AnnotatedRelationshipElement_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.AnnotatedRelationshipElement_TCt" />
            /// </summary>
            [LxElementCt(
                1,
                "annotatedRelationshipElement",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.AnnotatedRelationshipElement_TCt> AnnotatedRelationshipElements { get; } =
                new List<AasSchema.Tns.AnnotatedRelationshipElement_TCt>();

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.BasicEventElement_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.BasicEventElement_TCt" />
            /// </summary>
            [LxElementCt(
                2,
                "basicEventElement",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.BasicEventElement_TCt> BasicEventElements { get; } =
                new List<AasSchema.Tns.BasicEventElement_TCt>();

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.Blob_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.Blob_TCt" />
            /// </summary>
            [LxElementCt(
                3,
                "blob",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.Blob_TCt> Blobs { get; } = new List<AasSchema.Tns.Blob_TCt>();

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.Capability_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.Capability_TCt" />
            /// </summary>
            [LxElementCt(
                4,
                "capability",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.Capability_TCt> Capabilities { get; } =
                new List<AasSchema.Tns.Capability_TCt>();

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.Entity_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.Entity_TCt" />
            /// </summary>
            [LxElementCt(
                5,
                "entity",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.Entity_TCt> Entities { get; } =
                new List<AasSchema.Tns.Entity_TCt>();

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.File_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.File_TCt" />
            /// </summary>
            [LxElementCt(
                6,
                "file",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.File_TCt> Files { get; } = new List<AasSchema.Tns.File_TCt>();

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.MultiLanguageProperty_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.MultiLanguageProperty_TCt" />
            /// </summary>
            [LxElementCt(
                7,
                "multiLanguageProperty",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.MultiLanguageProperty_TCt> MultiLanguageProperties { get; } =
                new List<AasSchema.Tns.MultiLanguageProperty_TCt>();

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.Operation_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.Operation_TCt" />
            /// </summary>
            [LxElementCt(
                8,
                "operation",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.Operation_TCt> Operations { get; } =
                new List<AasSchema.Tns.Operation_TCt>();

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.Property_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.Property_TCt" />
            /// </summary>
            [LxElementCt(
                9,
                "property",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.Property_TCt> Properties { get; } =
                new List<AasSchema.Tns.Property_TCt>();

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.Range_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.Range_TCt" />
            /// </summary>
            [LxElementCt(
                10,
                "range",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.Range_TCt> Ranges { get; } =
                new List<AasSchema.Tns.Range_TCt>();

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.ReferenceElement_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.ReferenceElement_TCt" />
            /// </summary>
            [LxElementCt(
                11,
                "referenceElement",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.ReferenceElement_TCt> ReferenceElements { get; } =
                new List<AasSchema.Tns.ReferenceElement_TCt>();

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.SubmodelElementCollection_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.SubmodelElementCollection_TCt" />
            /// </summary>
            [LxElementCt(
                12,
                "submodelElementCollection",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.SubmodelElementCollection_TCt> SubmodelElementCollections { get; } =
                new List<AasSchema.Tns.SubmodelElementCollection_TCt>();

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.SubmodelElementList_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.SubmodelElementList_TCt" />
            /// </summary>
            [LxElementCt(
                13,
                "submodelElementList",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.SubmodelElementList_TCt> SubmodelElementLists { get; } =
                new List<AasSchema.Tns.SubmodelElementList_TCt>();
        }
    }

    /// <summary>A class representing the root XSD complexType submodelElement_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/complexType:submodelElement_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>1322:3-1326:20</XsdLocation>
    [LxSimpleComplexTypeDefinition("submodelElement_t", "https://admin-shell.io/aas/3/0")]
    public partial class SubmodelElement_TCt : AasSchema.LxBase
    {
        /// <summary>A <see cref="AasSchema.Tns.AssetAdministrationShell_TCt.ExtensionsElm" />, Optional : null when not set</summary>
        [LxElementRef(0, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetAdministrationShell_TCt.ExtensionsElm? Extensions { get; set; }

        /// <summary>A <see cref="System.String" />, Optional : null when not set</summary>
        [LxElementValue(
            1,
            "category",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 0,
            MaxOccurs = 1,
            MinLength = "1",
            MaxLength = "128"
        )]
        public System.String? Category { get; set; }

        /// <summary>A <see cref="System.String" />, Optional : null when not set</summary>
        [LxElementValue(
            2,
            "idShort",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 0,
            MaxOccurs = 1,
            MinLength = "1",
            MaxLength = "128",
            Pattern = "[a-zA-Z][a-zA-Z0-9_]*"
        )]
        public System.String? IdShort { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.AssetAdministrationShell_TCt.DisplayNameElm" />, Optional : null when not set</summary>
        [LxElementRef(3, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetAdministrationShell_TCt.DisplayNameElm? DisplayName { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.AssetAdministrationShell_TCt.DescriptionElm" />, Optional : null when not set</summary>
        [LxElementRef(4, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetAdministrationShell_TCt.DescriptionElm? Description { get; set; }

        /// <summary>
        ///   A class derived from <see cref="AasSchema.Tns.Reference_TCt" />.<br/><br/>
        ///   Allowable types are <br/>
        ///       <see cref="AasSchema.Tns.Reference_TCt" />
        /// </summary>
        [LxElementCt(
            5,
            "semanticId",
            "https://admin-shell.io/aas/3/0",
            MinOccurs = 0,
            MaxOccurs = 1
        )]
        public AasSchema.Tns.Reference_TCt? SemanticId { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.Extension_TCt.SupplementalSemanticIdsElm" />, Optional : null when not set</summary>
        [LxElementRef(6, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.Extension_TCt.SupplementalSemanticIdsElm? SupplementalSemanticIds { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.Submodel_TCt.QualifiersElm" />, Optional : null when not set</summary>
        [LxElementRef(7, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.Submodel_TCt.QualifiersElm? Qualifiers { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.AdministrativeInformation_TCt.EmbeddedDataSpecificationsElm" />, Optional : null when not set</summary>
        [LxElementRef(8, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AdministrativeInformation_TCt.EmbeddedDataSpecificationsElm? EmbeddedDataSpecifications { get; set; }
    }

    /// <summary>A class representing the root XSD complexType submodelElementCollection_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/complexType:submodelElementCollection_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>1312:3-1316:20</XsdLocation>
    [LxSimpleComplexTypeDefinition("submodelElementCollection_t", "https://admin-shell.io/aas/3/0")]
    public partial class SubmodelElementCollection_TCt : AasSchema.LxBase
    {
        /// <summary>A <see cref="AasSchema.Tns.AssetAdministrationShell_TCt.ExtensionsElm" />, Optional : null when not set</summary>
        [LxElementRef(0, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetAdministrationShell_TCt.ExtensionsElm? Extensions { get; set; }

        /// <summary>A <see cref="System.String" />, Optional : null when not set</summary>
        [LxElementValue(
            1,
            "category",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 0,
            MaxOccurs = 1,
            MinLength = "1",
            MaxLength = "128"
        )]
        public System.String? Category { get; set; }

        /// <summary>A <see cref="System.String" />, Optional : null when not set</summary>
        [LxElementValue(
            2,
            "idShort",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 0,
            MaxOccurs = 1,
            MinLength = "1",
            MaxLength = "128",
            Pattern = "[a-zA-Z][a-zA-Z0-9_]*"
        )]
        public System.String? IdShort { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.AssetAdministrationShell_TCt.DisplayNameElm" />, Optional : null when not set</summary>
        [LxElementRef(3, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetAdministrationShell_TCt.DisplayNameElm? DisplayName { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.AssetAdministrationShell_TCt.DescriptionElm" />, Optional : null when not set</summary>
        [LxElementRef(4, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetAdministrationShell_TCt.DescriptionElm? Description { get; set; }

        /// <summary>
        ///   A class derived from <see cref="AasSchema.Tns.Reference_TCt" />.<br/><br/>
        ///   Allowable types are <br/>
        ///       <see cref="AasSchema.Tns.Reference_TCt" />
        /// </summary>
        [LxElementCt(
            5,
            "semanticId",
            "https://admin-shell.io/aas/3/0",
            MinOccurs = 0,
            MaxOccurs = 1
        )]
        public AasSchema.Tns.Reference_TCt? SemanticId { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.Extension_TCt.SupplementalSemanticIdsElm" />, Optional : null when not set</summary>
        [LxElementRef(6, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.Extension_TCt.SupplementalSemanticIdsElm? SupplementalSemanticIds { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.Submodel_TCt.QualifiersElm" />, Optional : null when not set</summary>
        [LxElementRef(7, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.Submodel_TCt.QualifiersElm? Qualifiers { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.AdministrativeInformation_TCt.EmbeddedDataSpecificationsElm" />, Optional : null when not set</summary>
        [LxElementRef(8, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AdministrativeInformation_TCt.EmbeddedDataSpecificationsElm? EmbeddedDataSpecifications { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.SubmodelElementCollection_TCt.ValueElm" />, Optional : null when not set</summary>
        [LxElementRef(9, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.SubmodelElementCollection_TCt.ValueElm? Value1 { get; set; }

        /// <summary>Represent the inline xs:element value@https://admin-shell.io/aas/3/0.</summary>
        /// <XsdPath>schema:aas.xsd/group:submodelElementCollection/sequence/element:value</XsdPath>
        /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
        /// <XsdLocation>872:7-878:20</XsdLocation>
        [LxSimpleElementDefinition(
            "value",
            "https://admin-shell.io/aas/3/0",
            ElementScopeType.InlineElement
        )]
        public partial class ValueElm : AasSchema.LxBase
        {
            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.RelationshipElement_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.RelationshipElement_TCt" />
            /// </summary>
            [LxElementCt(
                0,
                "relationshipElement",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.RelationshipElement_TCt> RelationshipElements { get; } =
                new List<AasSchema.Tns.RelationshipElement_TCt>();

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.AnnotatedRelationshipElement_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.AnnotatedRelationshipElement_TCt" />
            /// </summary>
            [LxElementCt(
                1,
                "annotatedRelationshipElement",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.AnnotatedRelationshipElement_TCt> AnnotatedRelationshipElements { get; } =
                new List<AasSchema.Tns.AnnotatedRelationshipElement_TCt>();

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.BasicEventElement_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.BasicEventElement_TCt" />
            /// </summary>
            [LxElementCt(
                2,
                "basicEventElement",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.BasicEventElement_TCt> BasicEventElements { get; } =
                new List<AasSchema.Tns.BasicEventElement_TCt>();

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.Blob_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.Blob_TCt" />
            /// </summary>
            [LxElementCt(
                3,
                "blob",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.Blob_TCt> Blobs { get; } = new List<AasSchema.Tns.Blob_TCt>();

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.Capability_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.Capability_TCt" />
            /// </summary>
            [LxElementCt(
                4,
                "capability",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.Capability_TCt> Capabilities { get; } =
                new List<AasSchema.Tns.Capability_TCt>();

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.Entity_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.Entity_TCt" />
            /// </summary>
            [LxElementCt(
                5,
                "entity",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.Entity_TCt> Entities { get; } =
                new List<AasSchema.Tns.Entity_TCt>();

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.File_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.File_TCt" />
            /// </summary>
            [LxElementCt(
                6,
                "file",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.File_TCt> Files { get; } = new List<AasSchema.Tns.File_TCt>();

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.MultiLanguageProperty_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.MultiLanguageProperty_TCt" />
            /// </summary>
            [LxElementCt(
                7,
                "multiLanguageProperty",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.MultiLanguageProperty_TCt> MultiLanguageProperties { get; } =
                new List<AasSchema.Tns.MultiLanguageProperty_TCt>();

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.Operation_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.Operation_TCt" />
            /// </summary>
            [LxElementCt(
                8,
                "operation",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.Operation_TCt> Operations { get; } =
                new List<AasSchema.Tns.Operation_TCt>();

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.Property_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.Property_TCt" />
            /// </summary>
            [LxElementCt(
                9,
                "property",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.Property_TCt> Properties { get; } =
                new List<AasSchema.Tns.Property_TCt>();

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.Range_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.Range_TCt" />
            /// </summary>
            [LxElementCt(
                10,
                "range",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.Range_TCt> Ranges { get; } =
                new List<AasSchema.Tns.Range_TCt>();

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.ReferenceElement_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.ReferenceElement_TCt" />
            /// </summary>
            [LxElementCt(
                11,
                "referenceElement",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.ReferenceElement_TCt> ReferenceElements { get; } =
                new List<AasSchema.Tns.ReferenceElement_TCt>();

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.SubmodelElementCollection_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.SubmodelElementCollection_TCt" />
            /// </summary>
            [LxElementCt(
                12,
                "submodelElementCollection",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.SubmodelElementCollection_TCt> SubmodelElementCollections { get; } =
                new List<AasSchema.Tns.SubmodelElementCollection_TCt>();

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.SubmodelElementList_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.SubmodelElementList_TCt" />
            /// </summary>
            [LxElementCt(
                13,
                "submodelElementList",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.SubmodelElementList_TCt> SubmodelElementLists { get; } =
                new List<AasSchema.Tns.SubmodelElementList_TCt>();
        }
    }

    /// <summary>A class representing the root XSD complexType submodelElementList_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/complexType:submodelElementList_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>1317:3-1321:20</XsdLocation>
    [LxSimpleComplexTypeDefinition("submodelElementList_t", "https://admin-shell.io/aas/3/0")]
    public partial class SubmodelElementList_TCt : AasSchema.LxBase
    {
        /// <summary>A <see cref="AasSchema.Tns.AssetAdministrationShell_TCt.ExtensionsElm" />, Optional : null when not set</summary>
        [LxElementRef(0, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetAdministrationShell_TCt.ExtensionsElm? Extensions { get; set; }

        /// <summary>A <see cref="System.String" />, Optional : null when not set</summary>
        [LxElementValue(
            1,
            "category",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 0,
            MaxOccurs = 1,
            MinLength = "1",
            MaxLength = "128"
        )]
        public System.String? Category { get; set; }

        /// <summary>A <see cref="System.String" />, Optional : null when not set</summary>
        [LxElementValue(
            2,
            "idShort",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 0,
            MaxOccurs = 1,
            MinLength = "1",
            MaxLength = "128",
            Pattern = "[a-zA-Z][a-zA-Z0-9_]*"
        )]
        public System.String? IdShort { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.AssetAdministrationShell_TCt.DisplayNameElm" />, Optional : null when not set</summary>
        [LxElementRef(3, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetAdministrationShell_TCt.DisplayNameElm? DisplayName { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.AssetAdministrationShell_TCt.DescriptionElm" />, Optional : null when not set</summary>
        [LxElementRef(4, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AssetAdministrationShell_TCt.DescriptionElm? Description { get; set; }

        /// <summary>
        ///   A class derived from <see cref="AasSchema.Tns.Reference_TCt" />.<br/><br/>
        ///   Allowable types are <br/>
        ///       <see cref="AasSchema.Tns.Reference_TCt" />
        /// </summary>
        [LxElementCt(
            5,
            "semanticId",
            "https://admin-shell.io/aas/3/0",
            MinOccurs = 0,
            MaxOccurs = 1
        )]
        public AasSchema.Tns.Reference_TCt? SemanticId { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.Extension_TCt.SupplementalSemanticIdsElm" />, Optional : null when not set</summary>
        [LxElementRef(6, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.Extension_TCt.SupplementalSemanticIdsElm? SupplementalSemanticIds { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.Submodel_TCt.QualifiersElm" />, Optional : null when not set</summary>
        [LxElementRef(7, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.Submodel_TCt.QualifiersElm? Qualifiers { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.AdministrativeInformation_TCt.EmbeddedDataSpecificationsElm" />, Optional : null when not set</summary>
        [LxElementRef(8, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.AdministrativeInformation_TCt.EmbeddedDataSpecificationsElm? EmbeddedDataSpecifications { get; set; }

        /// <summary>A nullable <see cref="System.Boolean" />, Optional : null when not set</summary>
        [LxElementValue(
            9,
            "orderRelevant",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdBoolean,
            MinOccurs = 0,
            MaxOccurs = 1
        )]
        public System.Boolean? OrderRelevant { get; set; }

        /// <summary>
        ///   A class derived from <see cref="AasSchema.Tns.Reference_TCt" />.<br/><br/>
        ///   Allowable types are <br/>
        ///       <see cref="AasSchema.Tns.Reference_TCt" />
        /// </summary>
        [LxElementCt(
            10,
            "semanticIdListElement",
            "https://admin-shell.io/aas/3/0",
            MinOccurs = 0,
            MaxOccurs = 1
        )]
        public AasSchema.Tns.Reference_TCt? SemanticIdListElement { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.AasSubmodelElements_T1Enum" />, Required</summary>
        [LxElementValue(
            11,
            "typeValueListElement",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Enum,
            XsdType.Enum,
            MinOccurs = 1,
            MaxOccurs = 1,
            WhiteSpace = WhiteSpaceType.Preserve
        )]
        public AasSchema.Tns.AasSubmodelElements_T1Enum TypeValueListElement { get; set; }

        /// <summary>A nullable <see cref="AasSchema.Tns.DataTypeDefXsd_T1Enum" />, Optional : null when not set</summary>
        [LxElementValue(
            12,
            "valueTypeListElement",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Enum,
            XsdType.Enum,
            MinOccurs = 0,
            MaxOccurs = 1,
            WhiteSpace = WhiteSpaceType.Preserve
        )]
        public AasSchema.Tns.DataTypeDefXsd_T1Enum? ValueTypeListElement { get; set; }

        /// <summary>A <see cref="AasSchema.Tns.SubmodelElementList_TCt.ValueElm" />, Optional : null when not set</summary>
        [LxElementRef(13, MinOccurs = 0, MaxOccurs = 1)]
        public AasSchema.Tns.SubmodelElementList_TCt.ValueElm? Value1 { get; set; }

        /// <summary>Represent the inline xs:element value@https://admin-shell.io/aas/3/0.</summary>
        /// <XsdPath>schema:aas.xsd/group:submodelElementList/sequence/element:value</XsdPath>
        /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
        /// <XsdLocation>888:7-894:20</XsdLocation>
        [LxSimpleElementDefinition(
            "value",
            "https://admin-shell.io/aas/3/0",
            ElementScopeType.InlineElement
        )]
        public partial class ValueElm : AasSchema.LxBase
        {
            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.RelationshipElement_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.RelationshipElement_TCt" />
            /// </summary>
            [LxElementCt(
                0,
                "relationshipElement",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.RelationshipElement_TCt> RelationshipElements { get; } =
                new List<AasSchema.Tns.RelationshipElement_TCt>();

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.AnnotatedRelationshipElement_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.AnnotatedRelationshipElement_TCt" />
            /// </summary>
            [LxElementCt(
                1,
                "annotatedRelationshipElement",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.AnnotatedRelationshipElement_TCt> AnnotatedRelationshipElements { get; } =
                new List<AasSchema.Tns.AnnotatedRelationshipElement_TCt>();

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.BasicEventElement_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.BasicEventElement_TCt" />
            /// </summary>
            [LxElementCt(
                2,
                "basicEventElement",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.BasicEventElement_TCt> BasicEventElements { get; } =
                new List<AasSchema.Tns.BasicEventElement_TCt>();

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.Blob_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.Blob_TCt" />
            /// </summary>
            [LxElementCt(
                3,
                "blob",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.Blob_TCt> Blobs { get; } = new List<AasSchema.Tns.Blob_TCt>();

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.Capability_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.Capability_TCt" />
            /// </summary>
            [LxElementCt(
                4,
                "capability",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.Capability_TCt> Capabilities { get; } =
                new List<AasSchema.Tns.Capability_TCt>();

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.Entity_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.Entity_TCt" />
            /// </summary>
            [LxElementCt(
                5,
                "entity",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.Entity_TCt> Entities { get; } =
                new List<AasSchema.Tns.Entity_TCt>();

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.File_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.File_TCt" />
            /// </summary>
            [LxElementCt(
                6,
                "file",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.File_TCt> Files { get; } = new List<AasSchema.Tns.File_TCt>();

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.MultiLanguageProperty_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.MultiLanguageProperty_TCt" />
            /// </summary>
            [LxElementCt(
                7,
                "multiLanguageProperty",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.MultiLanguageProperty_TCt> MultiLanguageProperties { get; } =
                new List<AasSchema.Tns.MultiLanguageProperty_TCt>();

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.Operation_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.Operation_TCt" />
            /// </summary>
            [LxElementCt(
                8,
                "operation",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.Operation_TCt> Operations { get; } =
                new List<AasSchema.Tns.Operation_TCt>();

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.Property_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.Property_TCt" />
            /// </summary>
            [LxElementCt(
                9,
                "property",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.Property_TCt> Properties { get; } =
                new List<AasSchema.Tns.Property_TCt>();

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.Range_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.Range_TCt" />
            /// </summary>
            [LxElementCt(
                10,
                "range",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.Range_TCt> Ranges { get; } =
                new List<AasSchema.Tns.Range_TCt>();

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.ReferenceElement_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.ReferenceElement_TCt" />
            /// </summary>
            [LxElementCt(
                11,
                "referenceElement",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.ReferenceElement_TCt> ReferenceElements { get; } =
                new List<AasSchema.Tns.ReferenceElement_TCt>();

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.SubmodelElementCollection_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.SubmodelElementCollection_TCt" />
            /// </summary>
            [LxElementCt(
                12,
                "submodelElementCollection",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.SubmodelElementCollection_TCt> SubmodelElementCollections { get; } =
                new List<AasSchema.Tns.SubmodelElementCollection_TCt>();

            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.SubmodelElementList_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.SubmodelElementList_TCt" />
            /// </summary>
            [LxElementCt(
                13,
                "submodelElementList",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.SubmodelElementList_TCt> SubmodelElementLists { get; } =
                new List<AasSchema.Tns.SubmodelElementList_TCt>();
        }
    }

    /// <summary>A class representing the root XSD complexType valueList_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/complexType:valueList_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>1332:3-1336:20</XsdLocation>
    [LxSimpleComplexTypeDefinition("valueList_t", "https://admin-shell.io/aas/3/0")]
    public partial class ValueList_TCt : AasSchema.LxBase
    {
        /// <summary>A <see cref="AasSchema.Tns.ValueList_TCt.ValueReferencePairsElm" />, Required : should not be set to null</summary>
        [LxElementRef(0, MinOccurs = 1, MaxOccurs = 1)]
        public AasSchema.Tns.ValueList_TCt.ValueReferencePairsElm ValueReferencePairs { get; set; } =
            new AasSchema.Tns.ValueList_TCt.ValueReferencePairsElm();

        /// <summary>Represent the inline xs:element valueReferencePairs@https://admin-shell.io/aas/3/0.</summary>
        /// <XsdPath>schema:aas.xsd/group:valueList/sequence/element:valueReferencePairs</XsdPath>
        /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
        /// <XsdLocation>917:7-923:20</XsdLocation>
        [LxSimpleElementDefinition(
            "valueReferencePairs",
            "https://admin-shell.io/aas/3/0",
            ElementScopeType.InlineElement
        )]
        public partial class ValueReferencePairsElm : AasSchema.LxBase
        {
            /// <summary>
            ///   A class derived from <see cref="AasSchema.Tns.ValueReferencePair_TCt" />.<br/><br/>
            ///   Allowable types are <br/>
            ///       <see cref="AasSchema.Tns.ValueReferencePair_TCt" />
            /// </summary>
            [LxElementCt(
                0,
                "valueReferencePair",
                "https://admin-shell.io/aas/3/0",
                MinOccurs = 0,
                MaxOccurs = LxConstants.Unbounded
            )]
            public List<AasSchema.Tns.ValueReferencePair_TCt> ValueReferencePairs { get; } =
                new List<AasSchema.Tns.ValueReferencePair_TCt>();
        }
    }

    /// <summary>A class representing the root XSD complexType valueReferencePair_t@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/complexType:valueReferencePair_t</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>1337:3-1341:20</XsdLocation>
    [LxSimpleComplexTypeDefinition("valueReferencePair_t", "https://admin-shell.io/aas/3/0")]
    public partial class ValueReferencePair_TCt : AasSchema.LxBase
    {
        /// <summary>A <see cref="System.String" />, Required : should not be set to null</summary>
        [LxElementValue(
            0,
            "value",
            "https://admin-shell.io/aas/3/0",
            LxValueType.Value,
            XsdType.XsdString,
            MinOccurs = 1,
            MaxOccurs = 1,
            MinLength = "1",
            MaxLength = "2000"
        )]
        public System.String Value1 { get; set; } = "";

        /// <summary>
        ///   A class derived from <see cref="AasSchema.Tns.Reference_TCt" />.<br/><br/>
        ///   Allowable types are <br/>
        ///       <see cref="AasSchema.Tns.Reference_TCt" />
        /// </summary>
        [LxElementCt(1, "valueId", "https://admin-shell.io/aas/3/0", MinOccurs = 1, MaxOccurs = 1)]
        public AasSchema.Tns.Reference_TCt ValueId { get; set; } =
            new AasSchema.Tns.Reference_TCt();
    }

    #endregion

    #region Elements
    /// <summary>A class representing the root XSD element environment@https://admin-shell.io/aas/3/0</summary>
    /// <XsdPath>schema:aas.xsd/element:environment</XsdPath>
    /// <XsdFile>C:\_DEV\aas-produkt\xsd\aas.xsd</XsdFile>
    /// <XsdLocation>1342:3-1342:56</XsdLocation>
    [LxSimpleElementDefinition(
        "environment",
        "https://admin-shell.io/aas/3/0",
        ElementScopeType.GlobalElement
    )]
    public partial class EnvironmentElm : AasSchema.Tns.Environment_TCt { }

    #endregion
}

namespace AasSchema.Xs
{
    #region Complex Types
    /// <summary>A class representing the root XSD complexType anyType@http://www.w3.org/2001/XMLSchema</summary>
    /// <XsdPath>schema:.../www.w3.org/2001/XMLSchema/complexType:anyType</XsdPath>
    /// <XsdFile>http://www.w3.org/2001/XMLSchema</XsdFile>
    /// <XsdLocation>Empty</XsdLocation>
    [LxSimpleComplexTypeDefinition("anyType", "http://www.w3.org/2001/XMLSchema")]
    public partial class AnyTypeCt : XElement
    {
        /// <summary>Constructor : create a <see cref="AnyTypeCt" /> element &lt;anyType xmlns='http://www.w3.org/2001/XMLSchema'&gt;</summary>
        public AnyTypeCt()
            : base(XName.Get("anyType", "http://www.w3.org/2001/XMLSchema")) { }
    }

    #endregion
}

namespace AasSchema
{
    /// <summary>
    /// Provides a validator based on the original XSD schema files.
    /// </summary>
    public partial class AasValidator : LiquidTechnologies.XmlObjects.XsdValidator
    {
        /// <summary>
        /// Initializes the validator, loads and compiles the XSD schemas.
        /// </summary>
        /// <remarks>
        /// This is an expensive operation so consider caching this object.
        /// </remarks>
        public AasValidator()
            : base(typeof(AasValidator).Assembly, "AasSchema.AasResources.SchemaData") { }
    }
}
