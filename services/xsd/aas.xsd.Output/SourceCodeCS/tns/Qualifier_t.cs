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
    /// This class represents the ComplexType qualifier_t
    /// </summary>
    [LiquidTechnologies.Runtime.XmlObjectInfo(
        LiquidTechnologies.Runtime.XmlObjectBase.XmlElementGroupType.Sequence,
        LiquidTechnologies.Runtime.XmlObjectBase.XmlElementType.Element,
        "qualifier_t",
        "https://admin-shell.io/aas/3/0",
        true,
        false,
        false
    )]
    public partial class Qualifier_t : AasSchema.XmlCommonBase
    {
        #region Constructors
        /// <summary>
        /// Constructor for Qualifier_t
        /// </summary>
        /// <remarks>
        /// The class is created with all the mandatory fields populated with the
        /// default data.
        /// All Collection object are created.
        /// However any 1-n relationships (these are represented as collections) are
        /// empty. To comply with the schema these must be populated before the xml
        /// obtained from ToXml is valid against the schema C:\_DEV\aas-produkt\xsd\aas.xsd
        /// </remarks>
        public Qualifier_t()
        {
            _elementName = "qualifier_t";
            Init();
        }

        public Qualifier_t(string elementName)
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
            m_SemanticId = null;
            m_SupplementalSemanticIds = null;
            m_Kind = null;
            m_Type = "";
            m_ValueType = tns.Enumerations.DataTypeDefXsd_t.XsColonanyURI;
            m_Value = null;
            m_ValueId = null;

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
            tns.Qualifier_t newObject = new tns.Qualifier_t(_elementName);
            newObject.m_SemanticId = null;
            if (m_SemanticId != null)
                newObject.m_SemanticId = (tns.Reference_t)m_SemanticId.Clone();
            newObject.m_SupplementalSemanticIds = null;
            if (m_SupplementalSemanticIds != null)
                newObject.m_SupplementalSemanticIds = (tns.SupplementalSemanticIdsA)
                    m_SupplementalSemanticIds.Clone();
            newObject.m_Kind = m_Kind;
            newObject.m_Type = m_Type;
            newObject.m_ValueType = m_ValueType;
            newObject.m_Value = m_Value;
            newObject.m_ValueId = null;
            if (m_ValueId != null)
                newObject.m_ValueId = (tns.Reference_t)m_ValueId.Clone();

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

        #region Attribute - semanticId
        /// <summary>
        /// Represents an optional Element in the XML document
        /// </summary>
        /// <remarks>
        /// This property is represented as an Element in the XML.
        /// It is optional, initially it is null.
        /// </remarks>
        [LiquidTechnologies.Runtime.ElementInfoSeqClsOpt(
            "semanticId",
            "https://admin-shell.io/aas/3/0",
            LiquidTechnologies.Runtime.XmlObjectBase.XmlElementType.Element,
            typeof(tns.Reference_t)
        )]
        public tns.Reference_t SemanticId
        {
            get { return m_SemanticId; }
            set
            {
                if (value == null)
                    m_SemanticId = null;
                else
                {
                    SetElementName(value, "semanticId");
                    m_SemanticId = value;
                }
            }
        }
        protected tns.Reference_t m_SemanticId;

        #endregion

        #region Attribute - supplementalSemanticIds
        /// <summary>
        /// Represents an optional Element in the XML document
        /// </summary>
        /// <remarks>
        /// This property is represented as an Element in the XML.
        /// It is optional, initially it is null.
        /// </remarks>
        [LiquidTechnologies.Runtime.ElementInfoSeqClsOpt(
            "supplementalSemanticIds",
            "https://admin-shell.io/aas/3/0",
            LiquidTechnologies.Runtime.XmlObjectBase.XmlElementType.Element,
            typeof(tns.SupplementalSemanticIdsA)
        )]
        public tns.SupplementalSemanticIdsA SupplementalSemanticIds
        {
            get { return m_SupplementalSemanticIds; }
            set
            {
                if (value == null)
                    m_SupplementalSemanticIds = null;
                else
                {
                    SetElementName(value, "supplementalSemanticIds");
                    m_SupplementalSemanticIds = value;
                }
            }
        }
        protected tns.SupplementalSemanticIdsA m_SupplementalSemanticIds;

        #endregion

        #region Attribute - kind
        /// <summary>
        /// Represents an optional Element in the XML document
        /// </summary>
        /// <remarks>
        /// This property is represented as an Element in the XML.
        /// It is optional, initially it is not valid.
        /// </remarks>
        [LiquidTechnologies.Runtime.ElementInfoSeqEnumOpt(
            "kind",
            "https://admin-shell.io/aas/3/0",
            true,
            null,
            typeof(tns.Enumerations),
            "QualifierKind_tFromString",
            "QualifierKind_tToString",
            null
        )]
        public tns.Enumerations.QualifierKind_t? Kind
        {
            get { return m_Kind; }
            set { m_Kind = value; }
        }
        protected tns.Enumerations.QualifierKind_t? m_Kind;

        #endregion

        #region Attribute - type
        /// <summary>
        /// Represents a mandatory Element in the XML document
        /// </summary>
        /// <remarks>
        /// This property is represented as an Element in the XML.
        /// It is mandatory and therefore must be populated within the XML.
        /// It is defaulted to "".
        /// </remarks>
        [LiquidTechnologies.Runtime.ElementInfoSeqPrimMnd(
            "type",
            "https://admin-shell.io/aas/3/0",
            null,
            LiquidTechnologies.Runtime.Conversions.ConversionType.type_string,
            null,
            LiquidTechnologies.Runtime.WhitespaceUtils.WhitespaceRule.Preserve,
            "",
            1,
            128,
            "",
            "",
            "",
            "",
            -1,
            -1,
            -1,
            null
        )]
        public string Type
        {
            get { return m_Type; }
            set
            {
                // Apply whitespace rules appropriately
                value = LiquidTechnologies.Runtime.WhitespaceUtils.Preserve(value);
                CheckElementRestriction(3, value);
                m_Type = value;
            }
        }
        protected string m_Type;

        #endregion

        #region Attribute - valueType
        /// <summary>
        /// Represents a mandatory enumerated Element in the XML document
        /// </summary>
        /// <remarks>
        /// This property is represented as an Element in the XML.
        /// It is mandatory and therefore must be populated within the XML.
        /// It is defaulted to tns.Enumerations.DataTypeDefXsd_t.XsColonanyURI;.
        /// </remarks>
        [LiquidTechnologies.Runtime.ElementInfoSeqEnumMnd(
            "valueType",
            "https://admin-shell.io/aas/3/0",
            null,
            typeof(tns.Enumerations),
            "DataTypeDefXsd_tFromString",
            "DataTypeDefXsd_tToString",
            null
        )]
        public tns.Enumerations.DataTypeDefXsd_t ValueType
        {
            get { return m_ValueType; }
            set { m_ValueType = value; }
        }
        protected tns.Enumerations.DataTypeDefXsd_t m_ValueType;

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
            -1,
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
                    // Apply whitespace rules appropriately
                    value = LiquidTechnologies.Runtime.WhitespaceUtils.Preserve(value);
                    m_Value = value;
                }
            }
        }
        protected string m_Value;
        #endregion

        #region Attribute - valueId
        /// <summary>
        /// Represents an optional Element in the XML document
        /// </summary>
        /// <remarks>
        /// This property is represented as an Element in the XML.
        /// It is optional, initially it is null.
        /// </remarks>
        [LiquidTechnologies.Runtime.ElementInfoSeqClsOpt(
            "valueId",
            "https://admin-shell.io/aas/3/0",
            LiquidTechnologies.Runtime.XmlObjectBase.XmlElementType.Element,
            typeof(tns.Reference_t)
        )]
        public tns.Reference_t ValueId
        {
            get { return m_ValueId; }
            set
            {
                if (value == null)
                    m_ValueId = null;
                else
                {
                    SetElementName(value, "valueId");
                    m_ValueId = value;
                }
            }
        }
        protected tns.Reference_t m_ValueId;

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
