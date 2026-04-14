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
    /// This class represents the ComplexType blob_t
    /// </summary>
    [LiquidTechnologies.Runtime.XmlObjectInfo(
        LiquidTechnologies.Runtime.XmlObjectBase.XmlElementGroupType.Sequence,
        LiquidTechnologies.Runtime.XmlObjectBase.XmlElementType.Element,
        "blob_t",
        "https://admin-shell.io/aas/3/0",
        true,
        false,
        false
    )]
    public partial class Blob_t : AasSchema.XmlCommonBase
    {
        #region Constructors
        /// <summary>
        /// Constructor for Blob_t
        /// </summary>
        /// <remarks>
        /// The class is created with all the mandatory fields populated with the
        /// default data.
        /// All Collection object are created.
        /// However any 1-n relationships (these are represented as collections) are
        /// empty. To comply with the schema these must be populated before the xml
        /// obtained from ToXml is valid against the schema C:\_DEV\aas-produkt\xsd\aas.xsd
        /// </remarks>
        public Blob_t()
        {
            _elementName = "blob_t";
            Init();
        }

        public Blob_t(string elementName)
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
            m_Extensions = null;
            m_Category = null;
            m_IdShort = null;
            m_DisplayName = null;
            m_Description = null;
            m_SemanticId = null;
            m_SupplementalSemanticIds = null;
            m_Qualifiers = null;
            m_EmbeddedDataSpecifications = null;
            m_Value = null;
            m_ContentType = "";

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
            tns.Blob_t newObject = new tns.Blob_t(_elementName);
            newObject.m_Extensions = null;
            if (m_Extensions != null)
                newObject.m_Extensions = (tns.ExtensionsA)m_Extensions.Clone();
            newObject.m_Category = m_Category;
            newObject.m_IdShort = m_IdShort;
            newObject.m_DisplayName = null;
            if (m_DisplayName != null)
                newObject.m_DisplayName = (tns.DisplayNameB)m_DisplayName.Clone();
            newObject.m_Description = null;
            if (m_Description != null)
                newObject.m_Description = (tns.DescriptionB)m_Description.Clone();
            newObject.m_SemanticId = null;
            if (m_SemanticId != null)
                newObject.m_SemanticId = (tns.Reference_t)m_SemanticId.Clone();
            newObject.m_SupplementalSemanticIds = null;
            if (m_SupplementalSemanticIds != null)
                newObject.m_SupplementalSemanticIds = (tns.SupplementalSemanticIdsD)
                    m_SupplementalSemanticIds.Clone();
            newObject.m_Qualifiers = null;
            if (m_Qualifiers != null)
                newObject.m_Qualifiers = (tns.QualifiersA)m_Qualifiers.Clone();
            newObject.m_EmbeddedDataSpecifications = null;
            if (m_EmbeddedDataSpecifications != null)
                newObject.m_EmbeddedDataSpecifications = (tns.EmbeddedDataSpecificationsC)
                    m_EmbeddedDataSpecifications.Clone();
            newObject.m_Value = m_Value;
            newObject.m_ContentType = m_ContentType;

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

        #region Attribute - extensions
        /// <summary>
        /// Represents an optional Element in the XML document
        /// </summary>
        /// <remarks>
        /// This property is represented as an Element in the XML.
        /// It is optional, initially it is null.
        /// </remarks>
        [LiquidTechnologies.Runtime.ElementInfoSeqClsOpt(
            "extensions",
            "https://admin-shell.io/aas/3/0",
            LiquidTechnologies.Runtime.XmlObjectBase.XmlElementType.Element,
            typeof(tns.ExtensionsA)
        )]
        public tns.ExtensionsA Extensions
        {
            get { return m_Extensions; }
            set
            {
                if (value == null)
                    m_Extensions = null;
                else
                {
                    SetElementName(value, "extensions");
                    m_Extensions = value;
                }
            }
        }
        protected tns.ExtensionsA m_Extensions;

        #endregion

        #region Attribute - category
        /// <summary>
        /// Represents an optional Element in the XML document
        /// </summary>
        /// <remarks>
        /// This property is represented as an Element in the XML.
        /// It is optional, initially it is not valid.
        /// </remarks>
        [LiquidTechnologies.Runtime.ElementInfoSeqPrimOpt(
            "category",
            "https://admin-shell.io/aas/3/0",
            true,
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
        public string Category
        {
            get { return m_Category; }
            set
            {
                if (value == null)
                {
                    m_Category = null;
                }
                else
                {
                    CheckElementRestriction(1, value);
                    // Apply whitespace rules appropriately
                    value = LiquidTechnologies.Runtime.WhitespaceUtils.Preserve(value);
                    m_Category = value;
                }
            }
        }
        protected string m_Category;
        #endregion

        #region Attribute - idShort
        /// <summary>
        /// Represents an optional Element in the XML document
        /// </summary>
        /// <remarks>
        /// This property is represented as an Element in the XML.
        /// It is optional, initially it is not valid.
        /// </remarks>
        [LiquidTechnologies.Runtime.ElementInfoSeqPrimOpt(
            "idShort",
            "https://admin-shell.io/aas/3/0",
            true,
            null,
            LiquidTechnologies.Runtime.Conversions.ConversionType.type_string,
            null,
            LiquidTechnologies.Runtime.WhitespaceUtils.WhitespaceRule.Preserve,
            "[a-zA-Z][a-zA-Z0-9_]*",
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
        public string IdShort
        {
            get { return m_IdShort; }
            set
            {
                if (value == null)
                {
                    m_IdShort = null;
                }
                else
                {
                    CheckElementRestriction(2, value);
                    // Apply whitespace rules appropriately
                    value = LiquidTechnologies.Runtime.WhitespaceUtils.Preserve(value);
                    m_IdShort = value;
                }
            }
        }
        protected string m_IdShort;
        #endregion

        #region Attribute - displayName
        /// <summary>
        /// Represents an optional Element in the XML document
        /// </summary>
        /// <remarks>
        /// This property is represented as an Element in the XML.
        /// It is optional, initially it is null.
        /// </remarks>
        [LiquidTechnologies.Runtime.ElementInfoSeqClsOpt(
            "displayName",
            "https://admin-shell.io/aas/3/0",
            LiquidTechnologies.Runtime.XmlObjectBase.XmlElementType.Element,
            typeof(tns.DisplayNameB)
        )]
        public tns.DisplayNameB DisplayName
        {
            get { return m_DisplayName; }
            set
            {
                if (value == null)
                    m_DisplayName = null;
                else
                {
                    SetElementName(value, "displayName");
                    m_DisplayName = value;
                }
            }
        }
        protected tns.DisplayNameB m_DisplayName;

        #endregion

        #region Attribute - description
        /// <summary>
        /// Represents an optional Element in the XML document
        /// </summary>
        /// <remarks>
        /// This property is represented as an Element in the XML.
        /// It is optional, initially it is null.
        /// </remarks>
        [LiquidTechnologies.Runtime.ElementInfoSeqClsOpt(
            "description",
            "https://admin-shell.io/aas/3/0",
            LiquidTechnologies.Runtime.XmlObjectBase.XmlElementType.Element,
            typeof(tns.DescriptionB)
        )]
        public tns.DescriptionB Description
        {
            get { return m_Description; }
            set
            {
                if (value == null)
                    m_Description = null;
                else
                {
                    SetElementName(value, "description");
                    m_Description = value;
                }
            }
        }
        protected tns.DescriptionB m_Description;

        #endregion

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
            typeof(tns.SupplementalSemanticIdsD)
        )]
        public tns.SupplementalSemanticIdsD SupplementalSemanticIds
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
        protected tns.SupplementalSemanticIdsD m_SupplementalSemanticIds;

        #endregion

        #region Attribute - qualifiers
        /// <summary>
        /// Represents an optional Element in the XML document
        /// </summary>
        /// <remarks>
        /// This property is represented as an Element in the XML.
        /// It is optional, initially it is null.
        /// </remarks>
        [LiquidTechnologies.Runtime.ElementInfoSeqClsOpt(
            "qualifiers",
            "https://admin-shell.io/aas/3/0",
            LiquidTechnologies.Runtime.XmlObjectBase.XmlElementType.Element,
            typeof(tns.QualifiersA)
        )]
        public tns.QualifiersA Qualifiers
        {
            get { return m_Qualifiers; }
            set
            {
                if (value == null)
                    m_Qualifiers = null;
                else
                {
                    SetElementName(value, "qualifiers");
                    m_Qualifiers = value;
                }
            }
        }
        protected tns.QualifiersA m_Qualifiers;

        #endregion

        #region Attribute - embeddedDataSpecifications
        /// <summary>
        /// Represents an optional Element in the XML document
        /// </summary>
        /// <remarks>
        /// This property is represented as an Element in the XML.
        /// It is optional, initially it is null.
        /// </remarks>
        [LiquidTechnologies.Runtime.ElementInfoSeqClsOpt(
            "embeddedDataSpecifications",
            "https://admin-shell.io/aas/3/0",
            LiquidTechnologies.Runtime.XmlObjectBase.XmlElementType.Element,
            typeof(tns.EmbeddedDataSpecificationsC)
        )]
        public tns.EmbeddedDataSpecificationsC EmbeddedDataSpecifications
        {
            get { return m_EmbeddedDataSpecifications; }
            set
            {
                if (value == null)
                    m_EmbeddedDataSpecifications = null;
                else
                {
                    SetElementName(value, "embeddedDataSpecifications");
                    m_EmbeddedDataSpecifications = value;
                }
            }
        }
        protected tns.EmbeddedDataSpecificationsC m_EmbeddedDataSpecifications;

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
            LiquidTechnologies.Runtime.Conversions.ConversionType.type_base64Binary,
            null,
            LiquidTechnologies.Runtime.WhitespaceUtils.WhitespaceRule.Collapse,
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
        public LiquidTechnologies.Runtime.BinaryData Value
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
                    m_Value = value;
                }
            }
        }
        protected LiquidTechnologies.Runtime.BinaryData m_Value;
        #endregion

        #region Attribute - contentType
        /// <summary>
        /// Represents a mandatory Element in the XML document
        /// </summary>
        /// <remarks>
        /// This property is represented as an Element in the XML.
        /// It is mandatory and therefore must be populated within the XML.
        /// It is defaulted to "".
        /// </remarks>
        [LiquidTechnologies.Runtime.ElementInfoSeqPrimMnd(
            "contentType",
            "https://admin-shell.io/aas/3/0",
            null,
            LiquidTechnologies.Runtime.Conversions.ConversionType.type_string,
            null,
            LiquidTechnologies.Runtime.WhitespaceUtils.WhitespaceRule.Preserve,
            "([!#$%&'*+\\-.^_`|~0-9a-zA-Z])+/([!#$%&'*+\\-.^_`|~0-9a-zA-Z])+([ \\t]*;[ \\t]*([!#$%&'*+\\-.^_`|~0-9a-zA-Z])+=(([!#$%&'*+\\-.^_`|~0-9a-zA-Z])+|\"(([\\t !#-\\[\\]-~]|[-\xFF])|\\\\([\\t !-~]|[-\xFF]))*\"))*",
            1,
            100,
            "",
            "",
            "",
            "",
            -1,
            -1,
            -1,
            null
        )]
        public string ContentType
        {
            get { return m_ContentType; }
            set
            {
                // Apply whitespace rules appropriately
                value = LiquidTechnologies.Runtime.WhitespaceUtils.Preserve(value);
                CheckElementRestriction(10, value);
                m_ContentType = value;
            }
        }
        protected string m_ContentType;

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
