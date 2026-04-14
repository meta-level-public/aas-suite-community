using System;
using System.Collections;
using System.Collections.Specialized;
using System.Diagnostics;
using System.Xml;

/**********************************************************************************************
 * Copyright (c) 2001-2023 Liquid Technologies Limited. All rights reserved.
 * See www.liquid-technologies.com for product details.
 *
 * Please see products End User License Agreement for distribution permissions.
 *
 * WARNING: THIS FILE IS GENERATED
 * Changes made outside of ##HAND_CODED_BLOCK_START blocks will be overwritten
 *
 * Generation  :  by Liquid XML Data Binder 20.4.2.12285
 * Using Schema: C:\_DEV\aas-produkt\xsd\aas.xsd
 **********************************************************************************************/

namespace AasSchema
{
    public class Enumerations
    {
        // All the enumerations used within the Schema

        // ##HAND_CODED_BLOCK_START ID="Additional Methods"## DO NOT MODIFY ANYTHING OUTSIDE OF THESE TAGS

        // Add Additional Methods and members here...

        // ##HAND_CODED_BLOCK_END ID="Additional Methods"## DO NOT MODIFY ANYTHING OUTSIDE OF THESE TAGS
    }
}

namespace tns
{
    public class Enumerations
    {
        // All the enumerations used within the Schema

        #region Enumeration 'KeyTypes_t'
        #region Enumeration Declaration
        /// <summary>
        /// </summary>
        public enum KeyTypes_t
        {
            AnnotatedRelationshipElement,
            AssetAdministrationShell,
            BasicEventElement,
            Blob,
            Capability,
            ConceptDescription,
            DataElement,
            Entity,
            EventElement,
            File,
            FragmentReference,
            GlobalReference,
            Identifiable,
            MultiLanguageProperty,
            Operation,
            Property,
            Range,
            Referable,
            ReferenceElement,
            RelationshipElement,
            Submodel,
            SubmodelElement,
            SubmodelElementCollection,
            SubmodelElementList,
        }
        #endregion

        #region Conversion functions
        /// <summary>
        /// Converts a string to a KeyTypes_t enumeration
        /// </summary>
        public static String KeyTypes_tToString(tns.Enumerations.KeyTypes_t enumValue)
        {
            switch (enumValue)
            {
                case tns.Enumerations.KeyTypes_t.AnnotatedRelationshipElement:
                    return "AnnotatedRelationshipElement";
                case tns.Enumerations.KeyTypes_t.AssetAdministrationShell:
                    return "AssetAdministrationShell";
                case tns.Enumerations.KeyTypes_t.BasicEventElement:
                    return "BasicEventElement";
                case tns.Enumerations.KeyTypes_t.Blob:
                    return "Blob";
                case tns.Enumerations.KeyTypes_t.Capability:
                    return "Capability";
                case tns.Enumerations.KeyTypes_t.ConceptDescription:
                    return "ConceptDescription";
                case tns.Enumerations.KeyTypes_t.DataElement:
                    return "DataElement";
                case tns.Enumerations.KeyTypes_t.Entity:
                    return "Entity";
                case tns.Enumerations.KeyTypes_t.EventElement:
                    return "EventElement";
                case tns.Enumerations.KeyTypes_t.File:
                    return "File";
                case tns.Enumerations.KeyTypes_t.FragmentReference:
                    return "FragmentReference";
                case tns.Enumerations.KeyTypes_t.GlobalReference:
                    return "GlobalReference";
                case tns.Enumerations.KeyTypes_t.Identifiable:
                    return "Identifiable";
                case tns.Enumerations.KeyTypes_t.MultiLanguageProperty:
                    return "MultiLanguageProperty";
                case tns.Enumerations.KeyTypes_t.Operation:
                    return "Operation";
                case tns.Enumerations.KeyTypes_t.Property:
                    return "Property";
                case tns.Enumerations.KeyTypes_t.Range:
                    return "Range";
                case tns.Enumerations.KeyTypes_t.Referable:
                    return "Referable";
                case tns.Enumerations.KeyTypes_t.ReferenceElement:
                    return "ReferenceElement";
                case tns.Enumerations.KeyTypes_t.RelationshipElement:
                    return "RelationshipElement";
                case tns.Enumerations.KeyTypes_t.Submodel:
                    return "Submodel";
                case tns.Enumerations.KeyTypes_t.SubmodelElement:
                    return "SubmodelElement";
                case tns.Enumerations.KeyTypes_t.SubmodelElementCollection:
                    return "SubmodelElementCollection";
                case tns.Enumerations.KeyTypes_t.SubmodelElementList:
                    return "SubmodelElementList";
                default:
                    throw new LiquidTechnologies.Runtime.LtInvalidValueException(
                        "Unknown enumeration value for tns.Enumerations.KeyTypes_t ["
                            + enumValue.ToString()
                            + "]"
                    );
            }
        }

        /// <summary>
        /// Converts a KeyTypes_t enumeration to a string (suitable for the XML document)
        /// </summary>
        public static tns.Enumerations.KeyTypes_t KeyTypes_tFromString(String enumValue)
        {
            switch (enumValue)
            {
                case "AnnotatedRelationshipElement":
                    return tns.Enumerations.KeyTypes_t.AnnotatedRelationshipElement;
                case "AssetAdministrationShell":
                    return tns.Enumerations.KeyTypes_t.AssetAdministrationShell;
                case "BasicEventElement":
                    return tns.Enumerations.KeyTypes_t.BasicEventElement;
                case "Blob":
                    return tns.Enumerations.KeyTypes_t.Blob;
                case "Capability":
                    return tns.Enumerations.KeyTypes_t.Capability;
                case "ConceptDescription":
                    return tns.Enumerations.KeyTypes_t.ConceptDescription;
                case "DataElement":
                    return tns.Enumerations.KeyTypes_t.DataElement;
                case "Entity":
                    return tns.Enumerations.KeyTypes_t.Entity;
                case "EventElement":
                    return tns.Enumerations.KeyTypes_t.EventElement;
                case "File":
                    return tns.Enumerations.KeyTypes_t.File;
                case "FragmentReference":
                    return tns.Enumerations.KeyTypes_t.FragmentReference;
                case "GlobalReference":
                    return tns.Enumerations.KeyTypes_t.GlobalReference;
                case "Identifiable":
                    return tns.Enumerations.KeyTypes_t.Identifiable;
                case "MultiLanguageProperty":
                    return tns.Enumerations.KeyTypes_t.MultiLanguageProperty;
                case "Operation":
                    return tns.Enumerations.KeyTypes_t.Operation;
                case "Property":
                    return tns.Enumerations.KeyTypes_t.Property;
                case "Range":
                    return tns.Enumerations.KeyTypes_t.Range;
                case "Referable":
                    return tns.Enumerations.KeyTypes_t.Referable;
                case "ReferenceElement":
                    return tns.Enumerations.KeyTypes_t.ReferenceElement;
                case "RelationshipElement":
                    return tns.Enumerations.KeyTypes_t.RelationshipElement;
                case "Submodel":
                    return tns.Enumerations.KeyTypes_t.Submodel;
                case "SubmodelElement":
                    return tns.Enumerations.KeyTypes_t.SubmodelElement;
                case "SubmodelElementCollection":
                    return tns.Enumerations.KeyTypes_t.SubmodelElementCollection;
                case "SubmodelElementList":
                    return tns.Enumerations.KeyTypes_t.SubmodelElementList;
                default:
                    // ##HAND_CODED_BLOCK_START ID="Default Enum tns.Enumerations.KeyTypes_t"## DO NOT MODIFY ANYTHING OUTSIDE OF THESE TAGS
                    throw new LiquidTechnologies.Runtime.LtInvalidValueException(
                        "Unknown enumeration value for tns.Enumerations.KeyTypes_t ["
                            + enumValue
                            + "]"
                    );
                // ##HAND_CODED_BLOCK_END ID="Default Enum tns.Enumerations.KeyTypes_t"## DO NOT MODIFY ANYTHING OUTSIDE OF THESE TAGS
            }
        }

        public static StringCollection KeyTypes_tNames()
        {
            StringCollection ret = new StringCollection();
            System.Type t = typeof(KeyTypes_t);
            foreach (KeyTypes_t e in Enum.GetValues(t))
                ret.Add(KeyTypes_tToString(e));
            return ret;
        }

        #endregion
        #endregion

        #region Enumeration 'Direction_t'
        #region Enumeration Declaration
        /// <summary>
        /// </summary>
        public enum Direction_t
        {
            Input,
            Output,
        }
        #endregion

        #region Conversion functions
        /// <summary>
        /// Converts a string to a Direction_t enumeration
        /// </summary>
        public static String Direction_tToString(tns.Enumerations.Direction_t enumValue)
        {
            switch (enumValue)
            {
                case tns.Enumerations.Direction_t.Input:
                    return "input";
                case tns.Enumerations.Direction_t.Output:
                    return "output";
                default:
                    throw new LiquidTechnologies.Runtime.LtInvalidValueException(
                        "Unknown enumeration value for tns.Enumerations.Direction_t ["
                            + enumValue.ToString()
                            + "]"
                    );
            }
        }

        /// <summary>
        /// Converts a Direction_t enumeration to a string (suitable for the XML document)
        /// </summary>
        public static tns.Enumerations.Direction_t Direction_tFromString(String enumValue)
        {
            switch (enumValue)
            {
                case "input":
                    return tns.Enumerations.Direction_t.Input;
                case "output":
                    return tns.Enumerations.Direction_t.Output;
                default:
                    // ##HAND_CODED_BLOCK_START ID="Default Enum tns.Enumerations.Direction_t"## DO NOT MODIFY ANYTHING OUTSIDE OF THESE TAGS
                    throw new LiquidTechnologies.Runtime.LtInvalidValueException(
                        "Unknown enumeration value for tns.Enumerations.Direction_t ["
                            + enumValue
                            + "]"
                    );
                // ##HAND_CODED_BLOCK_END ID="Default Enum tns.Enumerations.Direction_t"## DO NOT MODIFY ANYTHING OUTSIDE OF THESE TAGS
            }
        }

        public static StringCollection Direction_tNames()
        {
            StringCollection ret = new StringCollection();
            System.Type t = typeof(Direction_t);
            foreach (Direction_t e in Enum.GetValues(t))
                ret.Add(Direction_tToString(e));
            return ret;
        }

        #endregion
        #endregion

        #region Enumeration 'AasSubmodelElements_t'
        #region Enumeration Declaration
        /// <summary>
        /// </summary>
        public enum AasSubmodelElements_t
        {
            AnnotatedRelationshipElement,
            BasicEventElement,
            Blob,
            Capability,
            DataElement,
            Entity,
            EventElement,
            File,
            MultiLanguageProperty,
            Operation,
            Property,
            Range,
            ReferenceElement,
            RelationshipElement,
            SubmodelElement,
            SubmodelElementList,
            SubmodelElementCollection,
        }
        #endregion

        #region Conversion functions
        /// <summary>
        /// Converts a string to a AasSubmodelElements_t enumeration
        /// </summary>
        public static String AasSubmodelElements_tToString(
            tns.Enumerations.AasSubmodelElements_t enumValue
        )
        {
            switch (enumValue)
            {
                case tns.Enumerations.AasSubmodelElements_t.AnnotatedRelationshipElement:
                    return "AnnotatedRelationshipElement";
                case tns.Enumerations.AasSubmodelElements_t.BasicEventElement:
                    return "BasicEventElement";
                case tns.Enumerations.AasSubmodelElements_t.Blob:
                    return "Blob";
                case tns.Enumerations.AasSubmodelElements_t.Capability:
                    return "Capability";
                case tns.Enumerations.AasSubmodelElements_t.DataElement:
                    return "DataElement";
                case tns.Enumerations.AasSubmodelElements_t.Entity:
                    return "Entity";
                case tns.Enumerations.AasSubmodelElements_t.EventElement:
                    return "EventElement";
                case tns.Enumerations.AasSubmodelElements_t.File:
                    return "File";
                case tns.Enumerations.AasSubmodelElements_t.MultiLanguageProperty:
                    return "MultiLanguageProperty";
                case tns.Enumerations.AasSubmodelElements_t.Operation:
                    return "Operation";
                case tns.Enumerations.AasSubmodelElements_t.Property:
                    return "Property";
                case tns.Enumerations.AasSubmodelElements_t.Range:
                    return "Range";
                case tns.Enumerations.AasSubmodelElements_t.ReferenceElement:
                    return "ReferenceElement";
                case tns.Enumerations.AasSubmodelElements_t.RelationshipElement:
                    return "RelationshipElement";
                case tns.Enumerations.AasSubmodelElements_t.SubmodelElement:
                    return "SubmodelElement";
                case tns.Enumerations.AasSubmodelElements_t.SubmodelElementList:
                    return "SubmodelElementList";
                case tns.Enumerations.AasSubmodelElements_t.SubmodelElementCollection:
                    return "SubmodelElementCollection";
                default:
                    throw new LiquidTechnologies.Runtime.LtInvalidValueException(
                        "Unknown enumeration value for tns.Enumerations.AasSubmodelElements_t ["
                            + enumValue.ToString()
                            + "]"
                    );
            }
        }

        /// <summary>
        /// Converts a AasSubmodelElements_t enumeration to a string (suitable for the XML document)
        /// </summary>
        public static tns.Enumerations.AasSubmodelElements_t AasSubmodelElements_tFromString(
            String enumValue
        )
        {
            switch (enumValue)
            {
                case "AnnotatedRelationshipElement":
                    return tns.Enumerations.AasSubmodelElements_t.AnnotatedRelationshipElement;
                case "BasicEventElement":
                    return tns.Enumerations.AasSubmodelElements_t.BasicEventElement;
                case "Blob":
                    return tns.Enumerations.AasSubmodelElements_t.Blob;
                case "Capability":
                    return tns.Enumerations.AasSubmodelElements_t.Capability;
                case "DataElement":
                    return tns.Enumerations.AasSubmodelElements_t.DataElement;
                case "Entity":
                    return tns.Enumerations.AasSubmodelElements_t.Entity;
                case "EventElement":
                    return tns.Enumerations.AasSubmodelElements_t.EventElement;
                case "File":
                    return tns.Enumerations.AasSubmodelElements_t.File;
                case "MultiLanguageProperty":
                    return tns.Enumerations.AasSubmodelElements_t.MultiLanguageProperty;
                case "Operation":
                    return tns.Enumerations.AasSubmodelElements_t.Operation;
                case "Property":
                    return tns.Enumerations.AasSubmodelElements_t.Property;
                case "Range":
                    return tns.Enumerations.AasSubmodelElements_t.Range;
                case "ReferenceElement":
                    return tns.Enumerations.AasSubmodelElements_t.ReferenceElement;
                case "RelationshipElement":
                    return tns.Enumerations.AasSubmodelElements_t.RelationshipElement;
                case "SubmodelElement":
                    return tns.Enumerations.AasSubmodelElements_t.SubmodelElement;
                case "SubmodelElementList":
                    return tns.Enumerations.AasSubmodelElements_t.SubmodelElementList;
                case "SubmodelElementCollection":
                    return tns.Enumerations.AasSubmodelElements_t.SubmodelElementCollection;
                default:
                    // ##HAND_CODED_BLOCK_START ID="Default Enum tns.Enumerations.AasSubmodelElements_t"## DO NOT MODIFY ANYTHING OUTSIDE OF THESE TAGS
                    throw new LiquidTechnologies.Runtime.LtInvalidValueException(
                        "Unknown enumeration value for tns.Enumerations.AasSubmodelElements_t ["
                            + enumValue
                            + "]"
                    );
                // ##HAND_CODED_BLOCK_END ID="Default Enum tns.Enumerations.AasSubmodelElements_t"## DO NOT MODIFY ANYTHING OUTSIDE OF THESE TAGS
            }
        }

        public static StringCollection AasSubmodelElements_tNames()
        {
            StringCollection ret = new StringCollection();
            System.Type t = typeof(AasSubmodelElements_t);
            foreach (AasSubmodelElements_t e in Enum.GetValues(t))
                ret.Add(AasSubmodelElements_tToString(e));
            return ret;
        }

        #endregion
        #endregion

        #region Enumeration 'DataTypeDefXsd_t'
        #region Enumeration Declaration
        /// <summary>
        /// </summary>
        public enum DataTypeDefXsd_t
        {
            XsColonanyURI,
            XsColonbase64Binary,
            XsColonboolean,
            XsColonbyte,
            XsColondate,
            XsColondateTime,
            XsColondecimal,
            XsColondouble,
            XsColonduration,
            XsColonfloat,
            XsColongDay,
            XsColongMonth,
            XsColongMonthDay,
            XsColongYear,
            XsColongYearMonth,
            XsColonhexBinary,
            XsColonint,
            XsColoninteger,
            XsColonlong,
            XsColonnegativeInteger,
            XsColonnonNegativeInteger,
            XsColonnonPositiveInteger,
            XsColonpositiveInteger,
            XsColonshort,
            XsColonstring,
            XsColontime,
            XsColonunsignedByte,
            XsColonunsignedInt,
            XsColonunsignedLong,
            XsColonunsignedShort,
        }
        #endregion

        #region Conversion functions
        /// <summary>
        /// Converts a string to a DataTypeDefXsd_t enumeration
        /// </summary>
        public static String DataTypeDefXsd_tToString(tns.Enumerations.DataTypeDefXsd_t enumValue)
        {
            switch (enumValue)
            {
                case tns.Enumerations.DataTypeDefXsd_t.XsColonanyURI:
                    return "xs:anyURI";
                case tns.Enumerations.DataTypeDefXsd_t.XsColonbase64Binary:
                    return "xs:base64Binary";
                case tns.Enumerations.DataTypeDefXsd_t.XsColonboolean:
                    return "xs:boolean";
                case tns.Enumerations.DataTypeDefXsd_t.XsColonbyte:
                    return "xs:byte";
                case tns.Enumerations.DataTypeDefXsd_t.XsColondate:
                    return "xs:date";
                case tns.Enumerations.DataTypeDefXsd_t.XsColondateTime:
                    return "xs:dateTime";
                case tns.Enumerations.DataTypeDefXsd_t.XsColondecimal:
                    return "xs:decimal";
                case tns.Enumerations.DataTypeDefXsd_t.XsColondouble:
                    return "xs:double";
                case tns.Enumerations.DataTypeDefXsd_t.XsColonduration:
                    return "xs:duration";
                case tns.Enumerations.DataTypeDefXsd_t.XsColonfloat:
                    return "xs:float";
                case tns.Enumerations.DataTypeDefXsd_t.XsColongDay:
                    return "xs:gDay";
                case tns.Enumerations.DataTypeDefXsd_t.XsColongMonth:
                    return "xs:gMonth";
                case tns.Enumerations.DataTypeDefXsd_t.XsColongMonthDay:
                    return "xs:gMonthDay";
                case tns.Enumerations.DataTypeDefXsd_t.XsColongYear:
                    return "xs:gYear";
                case tns.Enumerations.DataTypeDefXsd_t.XsColongYearMonth:
                    return "xs:gYearMonth";
                case tns.Enumerations.DataTypeDefXsd_t.XsColonhexBinary:
                    return "xs:hexBinary";
                case tns.Enumerations.DataTypeDefXsd_t.XsColonint:
                    return "xs:int";
                case tns.Enumerations.DataTypeDefXsd_t.XsColoninteger:
                    return "xs:integer";
                case tns.Enumerations.DataTypeDefXsd_t.XsColonlong:
                    return "xs:long";
                case tns.Enumerations.DataTypeDefXsd_t.XsColonnegativeInteger:
                    return "xs:negativeInteger";
                case tns.Enumerations.DataTypeDefXsd_t.XsColonnonNegativeInteger:
                    return "xs:nonNegativeInteger";
                case tns.Enumerations.DataTypeDefXsd_t.XsColonnonPositiveInteger:
                    return "xs:nonPositiveInteger";
                case tns.Enumerations.DataTypeDefXsd_t.XsColonpositiveInteger:
                    return "xs:positiveInteger";
                case tns.Enumerations.DataTypeDefXsd_t.XsColonshort:
                    return "xs:short";
                case tns.Enumerations.DataTypeDefXsd_t.XsColonstring:
                    return "xs:string";
                case tns.Enumerations.DataTypeDefXsd_t.XsColontime:
                    return "xs:time";
                case tns.Enumerations.DataTypeDefXsd_t.XsColonunsignedByte:
                    return "xs:unsignedByte";
                case tns.Enumerations.DataTypeDefXsd_t.XsColonunsignedInt:
                    return "xs:unsignedInt";
                case tns.Enumerations.DataTypeDefXsd_t.XsColonunsignedLong:
                    return "xs:unsignedLong";
                case tns.Enumerations.DataTypeDefXsd_t.XsColonunsignedShort:
                    return "xs:unsignedShort";
                default:
                    throw new LiquidTechnologies.Runtime.LtInvalidValueException(
                        "Unknown enumeration value for tns.Enumerations.DataTypeDefXsd_t ["
                            + enumValue.ToString()
                            + "]"
                    );
            }
        }

        /// <summary>
        /// Converts a DataTypeDefXsd_t enumeration to a string (suitable for the XML document)
        /// </summary>
        public static tns.Enumerations.DataTypeDefXsd_t DataTypeDefXsd_tFromString(String enumValue)
        {
            switch (enumValue)
            {
                case "xs:anyURI":
                    return tns.Enumerations.DataTypeDefXsd_t.XsColonanyURI;
                case "xs:base64Binary":
                    return tns.Enumerations.DataTypeDefXsd_t.XsColonbase64Binary;
                case "xs:boolean":
                    return tns.Enumerations.DataTypeDefXsd_t.XsColonboolean;
                case "xs:byte":
                    return tns.Enumerations.DataTypeDefXsd_t.XsColonbyte;
                case "xs:date":
                    return tns.Enumerations.DataTypeDefXsd_t.XsColondate;
                case "xs:dateTime":
                    return tns.Enumerations.DataTypeDefXsd_t.XsColondateTime;
                case "xs:decimal":
                    return tns.Enumerations.DataTypeDefXsd_t.XsColondecimal;
                case "xs:double":
                    return tns.Enumerations.DataTypeDefXsd_t.XsColondouble;
                case "xs:duration":
                    return tns.Enumerations.DataTypeDefXsd_t.XsColonduration;
                case "xs:float":
                    return tns.Enumerations.DataTypeDefXsd_t.XsColonfloat;
                case "xs:gDay":
                    return tns.Enumerations.DataTypeDefXsd_t.XsColongDay;
                case "xs:gMonth":
                    return tns.Enumerations.DataTypeDefXsd_t.XsColongMonth;
                case "xs:gMonthDay":
                    return tns.Enumerations.DataTypeDefXsd_t.XsColongMonthDay;
                case "xs:gYear":
                    return tns.Enumerations.DataTypeDefXsd_t.XsColongYear;
                case "xs:gYearMonth":
                    return tns.Enumerations.DataTypeDefXsd_t.XsColongYearMonth;
                case "xs:hexBinary":
                    return tns.Enumerations.DataTypeDefXsd_t.XsColonhexBinary;
                case "xs:int":
                    return tns.Enumerations.DataTypeDefXsd_t.XsColonint;
                case "xs:integer":
                    return tns.Enumerations.DataTypeDefXsd_t.XsColoninteger;
                case "xs:long":
                    return tns.Enumerations.DataTypeDefXsd_t.XsColonlong;
                case "xs:negativeInteger":
                    return tns.Enumerations.DataTypeDefXsd_t.XsColonnegativeInteger;
                case "xs:nonNegativeInteger":
                    return tns.Enumerations.DataTypeDefXsd_t.XsColonnonNegativeInteger;
                case "xs:nonPositiveInteger":
                    return tns.Enumerations.DataTypeDefXsd_t.XsColonnonPositiveInteger;
                case "xs:positiveInteger":
                    return tns.Enumerations.DataTypeDefXsd_t.XsColonpositiveInteger;
                case "xs:short":
                    return tns.Enumerations.DataTypeDefXsd_t.XsColonshort;
                case "xs:string":
                    return tns.Enumerations.DataTypeDefXsd_t.XsColonstring;
                case "xs:time":
                    return tns.Enumerations.DataTypeDefXsd_t.XsColontime;
                case "xs:unsignedByte":
                    return tns.Enumerations.DataTypeDefXsd_t.XsColonunsignedByte;
                case "xs:unsignedInt":
                    return tns.Enumerations.DataTypeDefXsd_t.XsColonunsignedInt;
                case "xs:unsignedLong":
                    return tns.Enumerations.DataTypeDefXsd_t.XsColonunsignedLong;
                case "xs:unsignedShort":
                    return tns.Enumerations.DataTypeDefXsd_t.XsColonunsignedShort;
                default:
                    // ##HAND_CODED_BLOCK_START ID="Default Enum tns.Enumerations.DataTypeDefXsd_t"## DO NOT MODIFY ANYTHING OUTSIDE OF THESE TAGS
                    throw new LiquidTechnologies.Runtime.LtInvalidValueException(
                        "Unknown enumeration value for tns.Enumerations.DataTypeDefXsd_t ["
                            + enumValue
                            + "]"
                    );
                // ##HAND_CODED_BLOCK_END ID="Default Enum tns.Enumerations.DataTypeDefXsd_t"## DO NOT MODIFY ANYTHING OUTSIDE OF THESE TAGS
            }
        }

        public static StringCollection DataTypeDefXsd_tNames()
        {
            StringCollection ret = new StringCollection();
            System.Type t = typeof(DataTypeDefXsd_t);
            foreach (DataTypeDefXsd_t e in Enum.GetValues(t))
                ret.Add(DataTypeDefXsd_tToString(e));
            return ret;
        }

        #endregion
        #endregion

        #region Enumeration 'EntityType_t'
        #region Enumeration Declaration
        /// <summary>
        /// </summary>
        public enum EntityType_t
        {
            CoManagedEntity,
            SelfManagedEntity,
        }
        #endregion

        #region Conversion functions
        /// <summary>
        /// Converts a string to a EntityType_t enumeration
        /// </summary>
        public static String EntityType_tToString(tns.Enumerations.EntityType_t enumValue)
        {
            switch (enumValue)
            {
                case tns.Enumerations.EntityType_t.CoManagedEntity:
                    return "CoManagedEntity";
                case tns.Enumerations.EntityType_t.SelfManagedEntity:
                    return "SelfManagedEntity";
                default:
                    throw new LiquidTechnologies.Runtime.LtInvalidValueException(
                        "Unknown enumeration value for tns.Enumerations.EntityType_t ["
                            + enumValue.ToString()
                            + "]"
                    );
            }
        }

        /// <summary>
        /// Converts a EntityType_t enumeration to a string (suitable for the XML document)
        /// </summary>
        public static tns.Enumerations.EntityType_t EntityType_tFromString(String enumValue)
        {
            switch (enumValue)
            {
                case "CoManagedEntity":
                    return tns.Enumerations.EntityType_t.CoManagedEntity;
                case "SelfManagedEntity":
                    return tns.Enumerations.EntityType_t.SelfManagedEntity;
                default:
                    // ##HAND_CODED_BLOCK_START ID="Default Enum tns.Enumerations.EntityType_t"## DO NOT MODIFY ANYTHING OUTSIDE OF THESE TAGS
                    throw new LiquidTechnologies.Runtime.LtInvalidValueException(
                        "Unknown enumeration value for tns.Enumerations.EntityType_t ["
                            + enumValue
                            + "]"
                    );
                // ##HAND_CODED_BLOCK_END ID="Default Enum tns.Enumerations.EntityType_t"## DO NOT MODIFY ANYTHING OUTSIDE OF THESE TAGS
            }
        }

        public static StringCollection EntityType_tNames()
        {
            StringCollection ret = new StringCollection();
            System.Type t = typeof(EntityType_t);
            foreach (EntityType_t e in Enum.GetValues(t))
                ret.Add(EntityType_tToString(e));
            return ret;
        }

        #endregion
        #endregion

        #region Enumeration 'ModellingKind_t'
        #region Enumeration Declaration
        /// <summary>
        /// </summary>
        public enum ModellingKind_t
        {
            Template,
            Instance,
        }
        #endregion

        #region Conversion functions
        /// <summary>
        /// Converts a string to a ModellingKind_t enumeration
        /// </summary>
        public static String ModellingKind_tToString(tns.Enumerations.ModellingKind_t enumValue)
        {
            switch (enumValue)
            {
                case tns.Enumerations.ModellingKind_t.Template:
                    return "Template";
                case tns.Enumerations.ModellingKind_t.Instance:
                    return "Instance";
                default:
                    throw new LiquidTechnologies.Runtime.LtInvalidValueException(
                        "Unknown enumeration value for tns.Enumerations.ModellingKind_t ["
                            + enumValue.ToString()
                            + "]"
                    );
            }
        }

        /// <summary>
        /// Converts a ModellingKind_t enumeration to a string (suitable for the XML document)
        /// </summary>
        public static tns.Enumerations.ModellingKind_t ModellingKind_tFromString(String enumValue)
        {
            switch (enumValue)
            {
                case "Template":
                    return tns.Enumerations.ModellingKind_t.Template;
                case "Instance":
                    return tns.Enumerations.ModellingKind_t.Instance;
                default:
                    // ##HAND_CODED_BLOCK_START ID="Default Enum tns.Enumerations.ModellingKind_t"## DO NOT MODIFY ANYTHING OUTSIDE OF THESE TAGS
                    throw new LiquidTechnologies.Runtime.LtInvalidValueException(
                        "Unknown enumeration value for tns.Enumerations.ModellingKind_t ["
                            + enumValue
                            + "]"
                    );
                // ##HAND_CODED_BLOCK_END ID="Default Enum tns.Enumerations.ModellingKind_t"## DO NOT MODIFY ANYTHING OUTSIDE OF THESE TAGS
            }
        }

        public static StringCollection ModellingKind_tNames()
        {
            StringCollection ret = new StringCollection();
            System.Type t = typeof(ModellingKind_t);
            foreach (ModellingKind_t e in Enum.GetValues(t))
                ret.Add(ModellingKind_tToString(e));
            return ret;
        }

        #endregion
        #endregion

        #region Enumeration 'QualifierKind_t'
        #region Enumeration Declaration
        /// <summary>
        /// </summary>
        public enum QualifierKind_t
        {
            ValueQualifier,
            ConceptQualifier,
            TemplateQualifier,
        }
        #endregion

        #region Conversion functions
        /// <summary>
        /// Converts a string to a QualifierKind_t enumeration
        /// </summary>
        public static String QualifierKind_tToString(tns.Enumerations.QualifierKind_t enumValue)
        {
            switch (enumValue)
            {
                case tns.Enumerations.QualifierKind_t.ValueQualifier:
                    return "ValueQualifier";
                case tns.Enumerations.QualifierKind_t.ConceptQualifier:
                    return "ConceptQualifier";
                case tns.Enumerations.QualifierKind_t.TemplateQualifier:
                    return "TemplateQualifier";
                default:
                    throw new LiquidTechnologies.Runtime.LtInvalidValueException(
                        "Unknown enumeration value for tns.Enumerations.QualifierKind_t ["
                            + enumValue.ToString()
                            + "]"
                    );
            }
        }

        /// <summary>
        /// Converts a QualifierKind_t enumeration to a string (suitable for the XML document)
        /// </summary>
        public static tns.Enumerations.QualifierKind_t QualifierKind_tFromString(String enumValue)
        {
            switch (enumValue)
            {
                case "ValueQualifier":
                    return tns.Enumerations.QualifierKind_t.ValueQualifier;
                case "ConceptQualifier":
                    return tns.Enumerations.QualifierKind_t.ConceptQualifier;
                case "TemplateQualifier":
                    return tns.Enumerations.QualifierKind_t.TemplateQualifier;
                default:
                    // ##HAND_CODED_BLOCK_START ID="Default Enum tns.Enumerations.QualifierKind_t"## DO NOT MODIFY ANYTHING OUTSIDE OF THESE TAGS
                    throw new LiquidTechnologies.Runtime.LtInvalidValueException(
                        "Unknown enumeration value for tns.Enumerations.QualifierKind_t ["
                            + enumValue
                            + "]"
                    );
                // ##HAND_CODED_BLOCK_END ID="Default Enum tns.Enumerations.QualifierKind_t"## DO NOT MODIFY ANYTHING OUTSIDE OF THESE TAGS
            }
        }

        public static StringCollection QualifierKind_tNames()
        {
            StringCollection ret = new StringCollection();
            System.Type t = typeof(QualifierKind_t);
            foreach (QualifierKind_t e in Enum.GetValues(t))
                ret.Add(QualifierKind_tToString(e));
            return ret;
        }

        #endregion
        #endregion

        #region Enumeration 'AssetKind_t'
        #region Enumeration Declaration
        /// <summary>
        /// </summary>
        public enum AssetKind_t
        {
            Type,
            Instance,
            NotApplicable,
        }
        #endregion

        #region Conversion functions
        /// <summary>
        /// Converts a string to a AssetKind_t enumeration
        /// </summary>
        public static String AssetKind_tToString(tns.Enumerations.AssetKind_t enumValue)
        {
            switch (enumValue)
            {
                case tns.Enumerations.AssetKind_t.Type:
                    return "Type";
                case tns.Enumerations.AssetKind_t.Instance:
                    return "Instance";
                case tns.Enumerations.AssetKind_t.NotApplicable:
                    return "NotApplicable";
                default:
                    throw new LiquidTechnologies.Runtime.LtInvalidValueException(
                        "Unknown enumeration value for tns.Enumerations.AssetKind_t ["
                            + enumValue.ToString()
                            + "]"
                    );
            }
        }

        /// <summary>
        /// Converts a AssetKind_t enumeration to a string (suitable for the XML document)
        /// </summary>
        public static tns.Enumerations.AssetKind_t AssetKind_tFromString(String enumValue)
        {
            switch (enumValue)
            {
                case "Type":
                    return tns.Enumerations.AssetKind_t.Type;
                case "Instance":
                    return tns.Enumerations.AssetKind_t.Instance;
                case "NotApplicable":
                    return tns.Enumerations.AssetKind_t.NotApplicable;
                default:
                    // ##HAND_CODED_BLOCK_START ID="Default Enum tns.Enumerations.AssetKind_t"## DO NOT MODIFY ANYTHING OUTSIDE OF THESE TAGS
                    throw new LiquidTechnologies.Runtime.LtInvalidValueException(
                        "Unknown enumeration value for tns.Enumerations.AssetKind_t ["
                            + enumValue
                            + "]"
                    );
                // ##HAND_CODED_BLOCK_END ID="Default Enum tns.Enumerations.AssetKind_t"## DO NOT MODIFY ANYTHING OUTSIDE OF THESE TAGS
            }
        }

        public static StringCollection AssetKind_tNames()
        {
            StringCollection ret = new StringCollection();
            System.Type t = typeof(AssetKind_t);
            foreach (AssetKind_t e in Enum.GetValues(t))
                ret.Add(AssetKind_tToString(e));
            return ret;
        }

        #endregion
        #endregion

        #region Enumeration 'DataTypeIec61360_t'
        #region Enumeration Declaration
        /// <summary>
        /// </summary>
        public enum DataTypeIec61360_t
        {
            DATE,
            string_,
            STRING_TRANSLATABLE,
            INTEGER_MEASURE,
            INTEGER_COUNT,
            INTEGER_CURRENCY,
            REAL_MEASURE,
            REAL_COUNT,
            REAL_CURRENCY,
            boolean_,
            IRI,
            IRDI,
            RATIONAL,
            RATIONAL_MEASURE,
            TIME,
            TIMESTAMP,
            FILE,
            HTML,
            BLOB,
        }
        #endregion

        #region Conversion functions
        /// <summary>
        /// Converts a string to a DataTypeIec61360_t enumeration
        /// </summary>
        public static String DataTypeIec61360_tToString(
            tns.Enumerations.DataTypeIec61360_t enumValue
        )
        {
            switch (enumValue)
            {
                case tns.Enumerations.DataTypeIec61360_t.DATE:
                    return "DATE";
                case tns.Enumerations.DataTypeIec61360_t.string_:
                    return "STRING";
                case tns.Enumerations.DataTypeIec61360_t.STRING_TRANSLATABLE:
                    return "STRING_TRANSLATABLE";
                case tns.Enumerations.DataTypeIec61360_t.INTEGER_MEASURE:
                    return "INTEGER_MEASURE";
                case tns.Enumerations.DataTypeIec61360_t.INTEGER_COUNT:
                    return "INTEGER_COUNT";
                case tns.Enumerations.DataTypeIec61360_t.INTEGER_CURRENCY:
                    return "INTEGER_CURRENCY";
                case tns.Enumerations.DataTypeIec61360_t.REAL_MEASURE:
                    return "REAL_MEASURE";
                case tns.Enumerations.DataTypeIec61360_t.REAL_COUNT:
                    return "REAL_COUNT";
                case tns.Enumerations.DataTypeIec61360_t.REAL_CURRENCY:
                    return "REAL_CURRENCY";
                case tns.Enumerations.DataTypeIec61360_t.boolean_:
                    return "BOOLEAN";
                case tns.Enumerations.DataTypeIec61360_t.IRI:
                    return "IRI";
                case tns.Enumerations.DataTypeIec61360_t.IRDI:
                    return "IRDI";
                case tns.Enumerations.DataTypeIec61360_t.RATIONAL:
                    return "RATIONAL";
                case tns.Enumerations.DataTypeIec61360_t.RATIONAL_MEASURE:
                    return "RATIONAL_MEASURE";
                case tns.Enumerations.DataTypeIec61360_t.TIME:
                    return "TIME";
                case tns.Enumerations.DataTypeIec61360_t.TIMESTAMP:
                    return "TIMESTAMP";
                case tns.Enumerations.DataTypeIec61360_t.FILE:
                    return "FILE";
                case tns.Enumerations.DataTypeIec61360_t.HTML:
                    return "HTML";
                case tns.Enumerations.DataTypeIec61360_t.BLOB:
                    return "BLOB";
                default:
                    throw new LiquidTechnologies.Runtime.LtInvalidValueException(
                        "Unknown enumeration value for tns.Enumerations.DataTypeIec61360_t ["
                            + enumValue.ToString()
                            + "]"
                    );
            }
        }

        /// <summary>
        /// Converts a DataTypeIec61360_t enumeration to a string (suitable for the XML document)
        /// </summary>
        public static tns.Enumerations.DataTypeIec61360_t DataTypeIec61360_tFromString(
            String enumValue
        )
        {
            switch (enumValue)
            {
                case "DATE":
                    return tns.Enumerations.DataTypeIec61360_t.DATE;
                case "STRING":
                    return tns.Enumerations.DataTypeIec61360_t.string_;
                case "STRING_TRANSLATABLE":
                    return tns.Enumerations.DataTypeIec61360_t.STRING_TRANSLATABLE;
                case "INTEGER_MEASURE":
                    return tns.Enumerations.DataTypeIec61360_t.INTEGER_MEASURE;
                case "INTEGER_COUNT":
                    return tns.Enumerations.DataTypeIec61360_t.INTEGER_COUNT;
                case "INTEGER_CURRENCY":
                    return tns.Enumerations.DataTypeIec61360_t.INTEGER_CURRENCY;
                case "REAL_MEASURE":
                    return tns.Enumerations.DataTypeIec61360_t.REAL_MEASURE;
                case "REAL_COUNT":
                    return tns.Enumerations.DataTypeIec61360_t.REAL_COUNT;
                case "REAL_CURRENCY":
                    return tns.Enumerations.DataTypeIec61360_t.REAL_CURRENCY;
                case "BOOLEAN":
                    return tns.Enumerations.DataTypeIec61360_t.boolean_;
                case "IRI":
                    return tns.Enumerations.DataTypeIec61360_t.IRI;
                case "IRDI":
                    return tns.Enumerations.DataTypeIec61360_t.IRDI;
                case "RATIONAL":
                    return tns.Enumerations.DataTypeIec61360_t.RATIONAL;
                case "RATIONAL_MEASURE":
                    return tns.Enumerations.DataTypeIec61360_t.RATIONAL_MEASURE;
                case "TIME":
                    return tns.Enumerations.DataTypeIec61360_t.TIME;
                case "TIMESTAMP":
                    return tns.Enumerations.DataTypeIec61360_t.TIMESTAMP;
                case "FILE":
                    return tns.Enumerations.DataTypeIec61360_t.FILE;
                case "HTML":
                    return tns.Enumerations.DataTypeIec61360_t.HTML;
                case "BLOB":
                    return tns.Enumerations.DataTypeIec61360_t.BLOB;
                default:
                    // ##HAND_CODED_BLOCK_START ID="Default Enum tns.Enumerations.DataTypeIec61360_t"## DO NOT MODIFY ANYTHING OUTSIDE OF THESE TAGS
                    throw new LiquidTechnologies.Runtime.LtInvalidValueException(
                        "Unknown enumeration value for tns.Enumerations.DataTypeIec61360_t ["
                            + enumValue
                            + "]"
                    );
                // ##HAND_CODED_BLOCK_END ID="Default Enum tns.Enumerations.DataTypeIec61360_t"## DO NOT MODIFY ANYTHING OUTSIDE OF THESE TAGS
            }
        }

        public static StringCollection DataTypeIec61360_tNames()
        {
            StringCollection ret = new StringCollection();
            System.Type t = typeof(DataTypeIec61360_t);
            foreach (DataTypeIec61360_t e in Enum.GetValues(t))
                ret.Add(DataTypeIec61360_tToString(e));
            return ret;
        }

        #endregion
        #endregion

        #region Enumeration 'ReferenceTypes_t'
        #region Enumeration Declaration
        /// <summary>
        /// </summary>
        public enum ReferenceTypes_t
        {
            ExternalReference,
            ModelReference,
        }
        #endregion

        #region Conversion functions
        /// <summary>
        /// Converts a string to a ReferenceTypes_t enumeration
        /// </summary>
        public static String ReferenceTypes_tToString(tns.Enumerations.ReferenceTypes_t enumValue)
        {
            switch (enumValue)
            {
                case tns.Enumerations.ReferenceTypes_t.ExternalReference:
                    return "ExternalReference";
                case tns.Enumerations.ReferenceTypes_t.ModelReference:
                    return "ModelReference";
                default:
                    throw new LiquidTechnologies.Runtime.LtInvalidValueException(
                        "Unknown enumeration value for tns.Enumerations.ReferenceTypes_t ["
                            + enumValue.ToString()
                            + "]"
                    );
            }
        }

        /// <summary>
        /// Converts a ReferenceTypes_t enumeration to a string (suitable for the XML document)
        /// </summary>
        public static tns.Enumerations.ReferenceTypes_t ReferenceTypes_tFromString(String enumValue)
        {
            switch (enumValue)
            {
                case "ExternalReference":
                    return tns.Enumerations.ReferenceTypes_t.ExternalReference;
                case "ModelReference":
                    return tns.Enumerations.ReferenceTypes_t.ModelReference;
                default:
                    // ##HAND_CODED_BLOCK_START ID="Default Enum tns.Enumerations.ReferenceTypes_t"## DO NOT MODIFY ANYTHING OUTSIDE OF THESE TAGS
                    throw new LiquidTechnologies.Runtime.LtInvalidValueException(
                        "Unknown enumeration value for tns.Enumerations.ReferenceTypes_t ["
                            + enumValue
                            + "]"
                    );
                // ##HAND_CODED_BLOCK_END ID="Default Enum tns.Enumerations.ReferenceTypes_t"## DO NOT MODIFY ANYTHING OUTSIDE OF THESE TAGS
            }
        }

        public static StringCollection ReferenceTypes_tNames()
        {
            StringCollection ret = new StringCollection();
            System.Type t = typeof(ReferenceTypes_t);
            foreach (ReferenceTypes_t e in Enum.GetValues(t))
                ret.Add(ReferenceTypes_tToString(e));
            return ret;
        }

        #endregion
        #endregion

        #region Enumeration 'StateOfEvent_t'
        #region Enumeration Declaration
        /// <summary>
        /// </summary>
        public enum StateOfEvent_t
        {
            On,
            Off,
        }
        #endregion

        #region Conversion functions
        /// <summary>
        /// Converts a string to a StateOfEvent_t enumeration
        /// </summary>
        public static String StateOfEvent_tToString(tns.Enumerations.StateOfEvent_t enumValue)
        {
            switch (enumValue)
            {
                case tns.Enumerations.StateOfEvent_t.On:
                    return "on";
                case tns.Enumerations.StateOfEvent_t.Off:
                    return "off";
                default:
                    throw new LiquidTechnologies.Runtime.LtInvalidValueException(
                        "Unknown enumeration value for tns.Enumerations.StateOfEvent_t ["
                            + enumValue.ToString()
                            + "]"
                    );
            }
        }

        /// <summary>
        /// Converts a StateOfEvent_t enumeration to a string (suitable for the XML document)
        /// </summary>
        public static tns.Enumerations.StateOfEvent_t StateOfEvent_tFromString(String enumValue)
        {
            switch (enumValue)
            {
                case "on":
                    return tns.Enumerations.StateOfEvent_t.On;
                case "off":
                    return tns.Enumerations.StateOfEvent_t.Off;
                default:
                    // ##HAND_CODED_BLOCK_START ID="Default Enum tns.Enumerations.StateOfEvent_t"## DO NOT MODIFY ANYTHING OUTSIDE OF THESE TAGS
                    throw new LiquidTechnologies.Runtime.LtInvalidValueException(
                        "Unknown enumeration value for tns.Enumerations.StateOfEvent_t ["
                            + enumValue
                            + "]"
                    );
                // ##HAND_CODED_BLOCK_END ID="Default Enum tns.Enumerations.StateOfEvent_t"## DO NOT MODIFY ANYTHING OUTSIDE OF THESE TAGS
            }
        }

        public static StringCollection StateOfEvent_tNames()
        {
            StringCollection ret = new StringCollection();
            System.Type t = typeof(StateOfEvent_t);
            foreach (StateOfEvent_t e in Enum.GetValues(t))
                ret.Add(StateOfEvent_tToString(e));
            return ret;
        }

        #endregion
        #endregion

        // ##HAND_CODED_BLOCK_START ID="Additional Methods"## DO NOT MODIFY ANYTHING OUTSIDE OF THESE TAGS

        // Add Additional Methods and members here...

        // ##HAND_CODED_BLOCK_END ID="Additional Methods"## DO NOT MODIFY ANYTHING OUTSIDE OF THESE TAGS
    }
}

namespace AasSchema
{
    internal class Registration
    {
        private static int RegisterLicense()
        {
            LiquidTechnologies.Runtime.XmlObjectBase.Register(
                "Mustafa Dwaidari ",
                "aas.xsd",
                "WUU0L7C60CF7QXLB000000AA"
            );

            // ##HAND_CODED_BLOCK_START ID="Namespace Declarations"## DO NOT MODIFY ANYTHING OUTSIDE OF THESE TAGS
            // Add Additional namespace declarations here...
            LiquidTechnologies.Runtime.SerializationContext.Default.SchemaType = LiquidTechnologies
                .Runtime
                .SchemaType
                .XSD;
            //            LiquidTechnologies.Runtime.SerializationContext.Default.DefaultNamespaceURI = "http://www.fpml.org/2003/FpML-4-0";
            //            LiquidTechnologies.Runtime.SerializationContext.Default.NamespaceAliases.Add("dsig", "http://www.w3.org/2000/09/xmldsig#");

            LiquidTechnologies.Runtime.SerializationContext.Default.NamespaceAliases.Add(
                "xs",
                "http://www.w3.org/2001/XMLSchema-instance"
            );

            // ##HAND_CODED_BLOCK_END ID="Namespace Declarations"## DO NOT MODIFY ANYTHING OUTSIDE OF THESE TAGS

            return 1;
        }

        public static int iRegistrationIndicator = RegisterLicense();
    }
}
