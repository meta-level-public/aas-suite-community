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
    /// This class represents the ComplexType entity_t
    /// </summary>
    [LiquidTechnologies.Runtime.XmlObjectInfo(
        LiquidTechnologies.Runtime.XmlObjectBase.XmlElementGroupType.Sequence,
        LiquidTechnologies.Runtime.XmlObjectBase.XmlElementType.Element,
        "entity_t",
        "https://admin-shell.io/aas/3/0",
        true,
        false,
        false
    )]
    public partial class Entity_t : AasSchema.XmlCommonBase
    {
        #region Constructors
        /// <summary>
        /// Constructor for Entity_t
        /// </summary>
        /// <remarks>
        /// The class is created with all the mandatory fields populated with the
        /// default data.
        /// All Collection object are created.
        /// However any 1-n relationships (these are represented as collections) are
        /// empty. To comply with the schema these must be populated before the xml
        /// obtained from ToXml is valid against the schema C:\_DEV\aas-produkt\xsd\aas.xsd
        /// </remarks>
        public Entity_t()
        {
            _elementName = "entity_t";
            Init();
        }

        public Entity_t(string elementName)
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
            m_Statements = null;
            m_EntityType = tns.Enumerations.EntityType_t.CoManagedEntity;
            m_GlobalAssetId = null;
            m_SpecificAssetIds = null;

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
            tns.Entity_t newObject = new tns.Entity_t(_elementName);
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
            newObject.m_Statements = null;
            if (m_Statements != null)
                newObject.m_Statements = (tns.Statements)m_Statements.Clone();
            newObject.m_EntityType = m_EntityType;
            newObject.m_GlobalAssetId = m_GlobalAssetId;
            newObject.m_SpecificAssetIds = null;
            if (m_SpecificAssetIds != null)
                newObject.m_SpecificAssetIds = (tns.SpecificAssetIds)m_SpecificAssetIds.Clone();

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

        #region Attribute - statements
        /// <summary>
        /// Represents an optional Element in the XML document
        /// </summary>
        /// <remarks>
        /// This property is represented as an Element in the XML.
        /// It is optional, initially it is null.
        /// </remarks>
        [LiquidTechnologies.Runtime.ElementInfoSeqClsOpt(
            "statements",
            "https://admin-shell.io/aas/3/0",
            LiquidTechnologies.Runtime.XmlObjectBase.XmlElementType.Element,
            typeof(tns.Statements)
        )]
        public tns.Statements Statements
        {
            get { return m_Statements; }
            set
            {
                if (value == null)
                    m_Statements = null;
                else
                {
                    SetElementName(value, "statements");
                    m_Statements = value;
                }
            }
        }
        protected tns.Statements m_Statements;

        #endregion

        #region Attribute - entityType
        /// <summary>
        /// Represents a mandatory enumerated Element in the XML document
        /// </summary>
        /// <remarks>
        /// This property is represented as an Element in the XML.
        /// It is mandatory and therefore must be populated within the XML.
        /// It is defaulted to tns.Enumerations.EntityType_t.CoManagedEntity;.
        /// </remarks>
        [LiquidTechnologies.Runtime.ElementInfoSeqEnumMnd(
            "entityType",
            "https://admin-shell.io/aas/3/0",
            null,
            typeof(tns.Enumerations),
            "EntityType_tFromString",
            "EntityType_tToString",
            null
        )]
        public tns.Enumerations.EntityType_t EntityType
        {
            get { return m_EntityType; }
            set { m_EntityType = value; }
        }
        protected tns.Enumerations.EntityType_t m_EntityType;

        #endregion

        #region Attribute - globalAssetId
        /// <summary>
        /// Represents an optional Element in the XML document
        /// </summary>
        /// <remarks>
        /// This property is represented as an Element in the XML.
        /// It is optional, initially it is not valid.
        /// </remarks>
        [LiquidTechnologies.Runtime.ElementInfoSeqPrimOpt(
            "globalAssetId",
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
        public string GlobalAssetId
        {
            get { return m_GlobalAssetId; }
            set
            {
                if (value == null)
                {
                    m_GlobalAssetId = null;
                }
                else
                {
                    CheckElementRestriction(11, value);
                    // Apply whitespace rules appropriately
                    value = LiquidTechnologies.Runtime.WhitespaceUtils.Preserve(value);
                    m_GlobalAssetId = value;
                }
            }
        }
        protected string m_GlobalAssetId;
        #endregion

        #region Attribute - specificAssetIds
        /// <summary>
        /// Represents an optional Element in the XML document
        /// </summary>
        /// <remarks>
        /// This property is represented as an Element in the XML.
        /// It is optional, initially it is null.
        /// </remarks>
        [LiquidTechnologies.Runtime.ElementInfoSeqClsOpt(
            "specificAssetIds",
            "https://admin-shell.io/aas/3/0",
            LiquidTechnologies.Runtime.XmlObjectBase.XmlElementType.Element,
            typeof(tns.SpecificAssetIds)
        )]
        public tns.SpecificAssetIds SpecificAssetIds
        {
            get { return m_SpecificAssetIds; }
            set
            {
                if (value == null)
                    m_SpecificAssetIds = null;
                else
                {
                    SetElementName(value, "specificAssetIds");
                    m_SpecificAssetIds = value;
                }
            }
        }
        protected tns.SpecificAssetIds m_SpecificAssetIds;

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
