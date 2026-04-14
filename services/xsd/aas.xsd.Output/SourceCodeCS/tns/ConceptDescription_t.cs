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
    /// This class represents the ComplexType conceptDescription_t
    /// </summary>
    [LiquidTechnologies.Runtime.XmlObjectInfo(
        LiquidTechnologies.Runtime.XmlObjectBase.XmlElementGroupType.Sequence,
        LiquidTechnologies.Runtime.XmlObjectBase.XmlElementType.Element,
        "conceptDescription_t",
        "https://admin-shell.io/aas/3/0",
        true,
        false,
        false
    )]
    public partial class ConceptDescription_t : AasSchema.XmlCommonBase
    {
        #region Constructors
        /// <summary>
        /// Constructor for ConceptDescription_t
        /// </summary>
        /// <remarks>
        /// The class is created with all the mandatory fields populated with the
        /// default data.
        /// All Collection object are created.
        /// However any 1-n relationships (these are represented as collections) are
        /// empty. To comply with the schema these must be populated before the xml
        /// obtained from ToXml is valid against the schema C:\_DEV\aas-produkt\xsd\aas.xsd
        /// </remarks>
        public ConceptDescription_t()
        {
            _elementName = "conceptDescription_t";
            Init();
        }

        public ConceptDescription_t(string elementName)
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
            m_Administration = null;
            m_Id = "";
            m_EmbeddedDataSpecifications = null;
            m_IsCaseOf = null;

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
            tns.ConceptDescription_t newObject = new tns.ConceptDescription_t(_elementName);
            newObject.m_Extensions = null;
            if (m_Extensions != null)
                newObject.m_Extensions = (tns.ExtensionsA)m_Extensions.Clone();
            newObject.m_Category = m_Category;
            newObject.m_IdShort = m_IdShort;
            newObject.m_DisplayName = null;
            if (m_DisplayName != null)
                newObject.m_DisplayName = (tns.DisplayNameA)m_DisplayName.Clone();
            newObject.m_Description = null;
            if (m_Description != null)
                newObject.m_Description = (tns.DescriptionA)m_Description.Clone();
            newObject.m_Administration = null;
            if (m_Administration != null)
                newObject.m_Administration = (tns.AdministrativeInformation_t)
                    m_Administration.Clone();
            newObject.m_Id = m_Id;
            newObject.m_EmbeddedDataSpecifications = null;
            if (m_EmbeddedDataSpecifications != null)
                newObject.m_EmbeddedDataSpecifications = (tns.EmbeddedDataSpecificationsA)
                    m_EmbeddedDataSpecifications.Clone();
            newObject.m_IsCaseOf = null;
            if (m_IsCaseOf != null)
                newObject.m_IsCaseOf = (tns.IsCaseOf)m_IsCaseOf.Clone();

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
            typeof(tns.DisplayNameA)
        )]
        public tns.DisplayNameA DisplayName
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
        protected tns.DisplayNameA m_DisplayName;

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
            typeof(tns.DescriptionA)
        )]
        public tns.DescriptionA Description
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
        protected tns.DescriptionA m_Description;

        #endregion

        #region Attribute - administration
        /// <summary>
        /// Represents an optional Element in the XML document
        /// </summary>
        /// <remarks>
        /// This property is represented as an Element in the XML.
        /// It is optional, initially it is null.
        /// </remarks>
        [LiquidTechnologies.Runtime.ElementInfoSeqClsOpt(
            "administration",
            "https://admin-shell.io/aas/3/0",
            LiquidTechnologies.Runtime.XmlObjectBase.XmlElementType.Element,
            typeof(tns.AdministrativeInformation_t)
        )]
        public tns.AdministrativeInformation_t Administration
        {
            get { return m_Administration; }
            set
            {
                if (value == null)
                    m_Administration = null;
                else
                {
                    SetElementName(value, "administration");
                    m_Administration = value;
                }
            }
        }
        protected tns.AdministrativeInformation_t m_Administration;

        #endregion

        #region Attribute - id
        /// <summary>
        /// Represents a mandatory Element in the XML document
        /// </summary>
        /// <remarks>
        /// This property is represented as an Element in the XML.
        /// It is mandatory and therefore must be populated within the XML.
        /// It is defaulted to "".
        /// </remarks>
        [LiquidTechnologies.Runtime.ElementInfoSeqPrimMnd(
            "id",
            "https://admin-shell.io/aas/3/0",
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
        public string Id
        {
            get { return m_Id; }
            set
            {
                // Apply whitespace rules appropriately
                value = LiquidTechnologies.Runtime.WhitespaceUtils.Preserve(value);
                CheckElementRestriction(6, value);
                m_Id = value;
            }
        }
        protected string m_Id;

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
            typeof(tns.EmbeddedDataSpecificationsA)
        )]
        public tns.EmbeddedDataSpecificationsA EmbeddedDataSpecifications
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
        protected tns.EmbeddedDataSpecificationsA m_EmbeddedDataSpecifications;

        #endregion

        #region Attribute - isCaseOf
        /// <summary>
        /// Represents an optional Element in the XML document
        /// </summary>
        /// <remarks>
        /// This property is represented as an Element in the XML.
        /// It is optional, initially it is null.
        /// </remarks>
        [LiquidTechnologies.Runtime.ElementInfoSeqClsOpt(
            "isCaseOf",
            "https://admin-shell.io/aas/3/0",
            LiquidTechnologies.Runtime.XmlObjectBase.XmlElementType.Element,
            typeof(tns.IsCaseOf)
        )]
        public tns.IsCaseOf IsCaseOf
        {
            get { return m_IsCaseOf; }
            set
            {
                if (value == null)
                    m_IsCaseOf = null;
                else
                {
                    SetElementName(value, "isCaseOf");
                    m_IsCaseOf = value;
                }
            }
        }
        protected tns.IsCaseOf m_IsCaseOf;

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
