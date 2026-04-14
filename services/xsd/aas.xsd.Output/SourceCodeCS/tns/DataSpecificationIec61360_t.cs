using System;
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

namespace tns
{
    /// <summary>
    /// This class represents the ComplexType dataSpecificationIec61360_t
    /// </summary>
    [LiquidTechnologies.Runtime.XmlObjectInfo(
        LiquidTechnologies.Runtime.XmlObjectBase.XmlElementGroupType.Sequence,
        LiquidTechnologies.Runtime.XmlObjectBase.XmlElementType.Element,
        "dataSpecificationIec61360_t",
        "https://admin-shell.io/aas/3/0",
        true,
        false,
        false
    )]
    public partial class DataSpecificationIec61360_t : AasSchema.XmlCommonBase
    {
        #region Constructors
        /// <summary>
        /// Constructor for DataSpecificationIec61360_t
        /// </summary>
        /// <remarks>
        /// The class is created with all the mandatory fields populated with the
        /// default data.
        /// All Collection object are created.
        /// However any 1-n relationships (these are represented as collections) are
        /// empty. To comply with the schema these must be populated before the xml
        /// obtained from ToXml is valid against the schema C:\_DEV\aas-produkt\xsd\aas.xsd
        /// </remarks>
        public DataSpecificationIec61360_t()
        {
            _elementName = "dataSpecificationIec61360_t";
            Init();
        }

        public DataSpecificationIec61360_t(string elementName)
        {
            _elementName = elementName;
            Init();
        }
        #endregion

        #region Initialization methods for the class
        /// <summary>
        /// Initializes the class
        /// </summary>
        /// <remarks>
        /// This creates all the mandatory fields (populated with the default data)
        /// All Collection object are created.
        /// However any 1-n relationships (these are represented as collections) are
        /// empty. To comply with the schema these must be populated before the xml
        /// obtained from ToXml is valid against the schema C:\_DEV\aas-produkt\xsd\aas.xsd.
        /// </remarks>
        protected override void Init()
        {
            AasSchema.Registration.iRegistrationIndicator = 0; // causes registration to take place
            m_PreferredName = new tns.PreferredName("preferredName");
            m_ShortName = null;
            m_Unit = null;
            m_UnitId = null;
            m_SourceOfDefinition = null;
            m_Symbol = null;
            m_DataType = null;
            m_Definition = null;
            m_ValueFormat = null;
            m_ValueList = null;
            m_Value = null;
            m_LevelType = null;

            // ##HAND_CODED_BLOCK_START ID="Additional Inits"## DO NOT MODIFY ANYTHING OUTSIDE OF THESE TAGS

            // Add Additional initialization code here...

            // ##HAND_CODED_BLOCK_END ID="Additional Inits"## DO NOT MODIFY ANYTHING OUTSIDE OF THESE TAGS
        }
        #endregion

        #region ICloneable Interface
        /// <summary>
        /// Allows the class to be copied
        /// </summary>
        /// <remarks>
        /// Performs a 'deep copy' of all the data in the class (and its children)
        /// </remarks>
        public override object Clone()
        {
            tns.DataSpecificationIec61360_t newObject = new tns.DataSpecificationIec61360_t(
                _elementName
            );
            newObject.m_PreferredName = null;
            if (m_PreferredName != null)
                newObject.m_PreferredName = (tns.PreferredName)m_PreferredName.Clone();
            newObject.m_ShortName = null;
            if (m_ShortName != null)
                newObject.m_ShortName = (tns.ShortName)m_ShortName.Clone();
            newObject.m_Unit = m_Unit;
            newObject.m_UnitId = null;
            if (m_UnitId != null)
                newObject.m_UnitId = (tns.Reference_t)m_UnitId.Clone();
            newObject.m_SourceOfDefinition = m_SourceOfDefinition;
            newObject.m_Symbol = m_Symbol;
            newObject.m_DataType = m_DataType;
            newObject.m_Definition = null;
            if (m_Definition != null)
                newObject.m_Definition = (tns.Definition)m_Definition.Clone();
            newObject.m_ValueFormat = m_ValueFormat;
            newObject.m_ValueList = null;
            if (m_ValueList != null)
                newObject.m_ValueList = (tns.ValueList_t)m_ValueList.Clone();
            newObject.m_Value = m_Value;
            newObject.m_LevelType = null;
            if (m_LevelType != null)
                newObject.m_LevelType = (tns.LevelType_t)m_LevelType.Clone();

            // ##HAND_CODED_BLOCK_START ID="Additional clone"## DO NOT MODIFY ANYTHING OUTSIDE OF THESE TAGS

            // Add Additional clone code here...

            // ##HAND_CODED_BLOCK_END ID="Additional clone"## DO NOT MODIFY ANYTHING OUTSIDE OF THESE TAGS

            return newObject;
        }
        #endregion

        #region Member variables

        protected override string TargetNamespace
        {
            get { return "https://admin-shell.io/aas/3/0"; }
        }

        #region Attribute - preferredName
        /// <summary>
        /// Represents a mandatory Element in the XML document
        /// </summary>
        /// <remarks>
        /// This property is represented as an Element in the XML.
        /// It is mandatory and therefore must be populated within the XML.
        /// If this property is set, then the object will be COPIED. If the property is set to null an exception is raised.
        /// </remarks>
        [LiquidTechnologies.Runtime.ElementInfoSeqClsMnd(
            "preferredName",
            "https://admin-shell.io/aas/3/0",
            LiquidTechnologies.Runtime.XmlObjectBase.XmlElementType.Element,
            typeof(tns.PreferredName),
            true
        )]
        public tns.PreferredName PreferredName
        {
            get { return m_PreferredName; }
            set
            {
                Throw_IfPropertyIsNull(value, "preferredName");
                if (value != null)
                    SetElementName(value, "preferredName");
                m_PreferredName = value;
            }
        }
        protected tns.PreferredName m_PreferredName;

        #endregion

        #region Attribute - shortName
        /// <summary>
        /// Represents an optional Element in the XML document
        /// </summary>
        /// <remarks>
        /// This property is represented as an Element in the XML.
        /// It is optional, initially it is null.
        /// </remarks>
        [LiquidTechnologies.Runtime.ElementInfoSeqClsOpt(
            "shortName",
            "https://admin-shell.io/aas/3/0",
            LiquidTechnologies.Runtime.XmlObjectBase.XmlElementType.Element,
            typeof(tns.ShortName)
        )]
        public tns.ShortName ShortName
        {
            get { return m_ShortName; }
            set
            {
                if (value == null)
                    m_ShortName = null;
                else
                {
                    SetElementName(value, "shortName");
                    m_ShortName = value;
                }
            }
        }
        protected tns.ShortName m_ShortName;

        #endregion

        #region Attribute - unit
        /// <summary>
        /// Represents an optional Element in the XML document
        /// </summary>
        /// <remarks>
        /// This property is represented as an Element in the XML.
        /// It is optional, initially it is not valid.
        /// </remarks>
        [LiquidTechnologies.Runtime.ElementInfoSeqPrimOpt(
            "unit",
            "https://admin-shell.io/aas/3/0",
            true,
            null,
            LiquidTechnologies.Runtime.Conversions.ConversionType.type_string,
            null,
            LiquidTechnologies.Runtime.WhitespaceUtils.WhitespaceRule.Preserve,
            "",
            1,
            -1,
            "",
            "",
            "",
            "",
            -1,
            -1,
            -1,
            null
        )]
        public string Unit
        {
            get { return m_Unit; }
            set
            {
                if (value == null)
                {
                    m_Unit = null;
                }
                else
                {
                    CheckElementRestriction(2, value);
                    // Apply whitespace rules appropriately
                    value = LiquidTechnologies.Runtime.WhitespaceUtils.Preserve(value);
                    m_Unit = value;
                }
            }
        }
        protected string m_Unit;
        #endregion

        #region Attribute - unitId
        /// <summary>
        /// Represents an optional Element in the XML document
        /// </summary>
        /// <remarks>
        /// This property is represented as an Element in the XML.
        /// It is optional, initially it is null.
        /// </remarks>
        [LiquidTechnologies.Runtime.ElementInfoSeqClsOpt(
            "unitId",
            "https://admin-shell.io/aas/3/0",
            LiquidTechnologies.Runtime.XmlObjectBase.XmlElementType.Element,
            typeof(tns.Reference_t)
        )]
        public tns.Reference_t UnitId
        {
            get { return m_UnitId; }
            set
            {
                if (value == null)
                    m_UnitId = null;
                else
                {
                    SetElementName(value, "unitId");
                    m_UnitId = value;
                }
            }
        }
        protected tns.Reference_t m_UnitId;

        #endregion

        #region Attribute - sourceOfDefinition
        /// <summary>
        /// Represents an optional Element in the XML document
        /// </summary>
        /// <remarks>
        /// This property is represented as an Element in the XML.
        /// It is optional, initially it is not valid.
        /// </remarks>
        [LiquidTechnologies.Runtime.ElementInfoSeqPrimOpt(
            "sourceOfDefinition",
            "https://admin-shell.io/aas/3/0",
            true,
            null,
            LiquidTechnologies.Runtime.Conversions.ConversionType.type_string,
            null,
            LiquidTechnologies.Runtime.WhitespaceUtils.WhitespaceRule.Preserve,
            "",
            1,
            -1,
            "",
            "",
            "",
            "",
            -1,
            -1,
            -1,
            null
        )]
        public string SourceOfDefinition
        {
            get { return m_SourceOfDefinition; }
            set
            {
                if (value == null)
                {
                    m_SourceOfDefinition = null;
                }
                else
                {
                    CheckElementRestriction(4, value);
                    // Apply whitespace rules appropriately
                    value = LiquidTechnologies.Runtime.WhitespaceUtils.Preserve(value);
                    m_SourceOfDefinition = value;
                }
            }
        }
        protected string m_SourceOfDefinition;
        #endregion

        #region Attribute - symbol
        /// <summary>
        /// Represents an optional Element in the XML document
        /// </summary>
        /// <remarks>
        /// This property is represented as an Element in the XML.
        /// It is optional, initially it is not valid.
        /// </remarks>
        [LiquidTechnologies.Runtime.ElementInfoSeqPrimOpt(
            "symbol",
            "https://admin-shell.io/aas/3/0",
            true,
            null,
            LiquidTechnologies.Runtime.Conversions.ConversionType.type_string,
            null,
            LiquidTechnologies.Runtime.WhitespaceUtils.WhitespaceRule.Preserve,
            "",
            1,
            -1,
            "",
            "",
            "",
            "",
            -1,
            -1,
            -1,
            null
        )]
        public string Symbol
        {
            get { return m_Symbol; }
            set
            {
                if (value == null)
                {
                    m_Symbol = null;
                }
                else
                {
                    CheckElementRestriction(5, value);
                    // Apply whitespace rules appropriately
                    value = LiquidTechnologies.Runtime.WhitespaceUtils.Preserve(value);
                    m_Symbol = value;
                }
            }
        }
        protected string m_Symbol;
        #endregion

        #region Attribute - dataType
        /// <summary>
        /// Represents an optional Element in the XML document
        /// </summary>
        /// <remarks>
        /// This property is represented as an Element in the XML.
        /// It is optional, initially it is not valid.
        /// </remarks>
        [LiquidTechnologies.Runtime.ElementInfoSeqEnumOpt(
            "dataType",
            "https://admin-shell.io/aas/3/0",
            true,
            null,
            typeof(tns.Enumerations),
            "DataTypeIec61360_tFromString",
            "DataTypeIec61360_tToString",
            null
        )]
        public tns.Enumerations.DataTypeIec61360_t? DataType
        {
            get { return m_DataType; }
            set { m_DataType = value; }
        }
        protected tns.Enumerations.DataTypeIec61360_t? m_DataType;

        #endregion

        #region Attribute - definition
        /// <summary>
        /// Represents an optional Element in the XML document
        /// </summary>
        /// <remarks>
        /// This property is represented as an Element in the XML.
        /// It is optional, initially it is null.
        /// </remarks>
        [LiquidTechnologies.Runtime.ElementInfoSeqClsOpt(
            "definition",
            "https://admin-shell.io/aas/3/0",
            LiquidTechnologies.Runtime.XmlObjectBase.XmlElementType.Element,
            typeof(tns.Definition)
        )]
        public tns.Definition Definition
        {
            get { return m_Definition; }
            set
            {
                if (value == null)
                    m_Definition = null;
                else
                {
                    SetElementName(value, "definition");
                    m_Definition = value;
                }
            }
        }
        protected tns.Definition m_Definition;

        #endregion

        #region Attribute - valueFormat
        /// <summary>
        /// Represents an optional Element in the XML document
        /// </summary>
        /// <remarks>
        /// This property is represented as an Element in the XML.
        /// It is optional, initially it is not valid.
        /// </remarks>
        [LiquidTechnologies.Runtime.ElementInfoSeqPrimOpt(
            "valueFormat",
            "https://admin-shell.io/aas/3/0",
            true,
            null,
            LiquidTechnologies.Runtime.Conversions.ConversionType.type_string,
            null,
            LiquidTechnologies.Runtime.WhitespaceUtils.WhitespaceRule.Preserve,
            "",
            1,
            -1,
            "",
            "",
            "",
            "",
            -1,
            -1,
            -1,
            null
        )]
        public string ValueFormat
        {
            get { return m_ValueFormat; }
            set
            {
                if (value == null)
                {
                    m_ValueFormat = null;
                }
                else
                {
                    CheckElementRestriction(8, value);
                    // Apply whitespace rules appropriately
                    value = LiquidTechnologies.Runtime.WhitespaceUtils.Preserve(value);
                    m_ValueFormat = value;
                }
            }
        }
        protected string m_ValueFormat;
        #endregion

        #region Attribute - valueList
        /// <summary>
        /// Represents an optional Element in the XML document
        /// </summary>
        /// <remarks>
        /// This property is represented as an Element in the XML.
        /// It is optional, initially it is null.
        /// </remarks>
        [LiquidTechnologies.Runtime.ElementInfoSeqClsOpt(
            "valueList",
            "https://admin-shell.io/aas/3/0",
            LiquidTechnologies.Runtime.XmlObjectBase.XmlElementType.Element,
            typeof(tns.ValueList_t)
        )]
        public tns.ValueList_t ValueList
        {
            get { return m_ValueList; }
            set
            {
                if (value == null)
                    m_ValueList = null;
                else
                {
                    SetElementName(value, "valueList");
                    m_ValueList = value;
                }
            }
        }
        protected tns.ValueList_t m_ValueList;

        #endregion

        #region Attribute - value
        /// <summary>
        /// Represents an optional Element in the XML document
        /// </summary>
        /// <remarks>
        /// This property is represented as an Element in the XML.
        /// It is optional, initially it is not valid.
        /// </remarks>
        [LiquidTechnologies.Runtime.ElementInfoSeqPrimOpt(
            "value",
            "https://admin-shell.io/aas/3/0",
            true,
            null,
            LiquidTechnologies.Runtime.Conversions.ConversionType.type_string,
            null,
            LiquidTechnologies.Runtime.WhitespaceUtils.WhitespaceRule.Preserve,
            "",
            1,
            2000,
            "",
            "",
            "",
            "",
            -1,
            -1,
            -1,
            null
        )]
        public string Value
        {
            get { return m_Value; }
            set
            {
                if (value == null)
                {
                    m_Value = null;
                }
                else
                {
                    CheckElementRestriction(10, value);
                    // Apply whitespace rules appropriately
                    value = LiquidTechnologies.Runtime.WhitespaceUtils.Preserve(value);
                    m_Value = value;
                }
            }
        }
        protected string m_Value;
        #endregion

        #region Attribute - levelType
        /// <summary>
        /// Represents an optional Element in the XML document
        /// </summary>
        /// <remarks>
        /// This property is represented as an Element in the XML.
        /// It is optional, initially it is null.
        /// </remarks>
        [LiquidTechnologies.Runtime.ElementInfoSeqClsOpt(
            "levelType",
            "https://admin-shell.io/aas/3/0",
            LiquidTechnologies.Runtime.XmlObjectBase.XmlElementType.Element,
            typeof(tns.LevelType_t)
        )]
        public tns.LevelType_t LevelType
        {
            get { return m_LevelType; }
            set
            {
                if (value == null)
                    m_LevelType = null;
                else
                {
                    SetElementName(value, "levelType");
                    m_LevelType = value;
                }
            }
        }
        protected tns.LevelType_t m_LevelType;

        #endregion

        #region Attribute - Namespace
        public override string Namespace
        {
            get { return "https://admin-shell.io/aas/3/0"; }
        }
        #endregion

        #region Attribute - GetBase
        public override LiquidTechnologies.Runtime.XmlObjectBase GetBase()
        {
            return this;
        }
        #endregion
        #endregion


        // ##HAND_CODED_BLOCK_START ID="Additional Methods"## DO NOT MODIFY ANYTHING OUTSIDE OF THESE TAGS

        // Add Additional Methods and members here...

        // ##HAND_CODED_BLOCK_END ID="Additional Methods"## DO NOT MODIFY ANYTHING OUTSIDE OF THESE TAGS
    }
}
