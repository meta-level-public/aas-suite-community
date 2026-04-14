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
    /// This class represents the ComplexType administrativeInformation_t
    /// </summary>
    [LiquidTechnologies.Runtime.XmlObjectInfo(
        LiquidTechnologies.Runtime.XmlObjectBase.XmlElementGroupType.Sequence,
        LiquidTechnologies.Runtime.XmlObjectBase.XmlElementType.Element,
        "administrativeInformation_t",
        "https://admin-shell.io/aas/3/0",
        true,
        false,
        false
    )]
    public partial class AdministrativeInformation_t : AasSchema.XmlCommonBase
    {
        #region Constructors
        /// <summary>
        /// Constructor for AdministrativeInformation_t
        /// </summary>
        /// <remarks>
        /// The class is created with all the mandatory fields populated with the
        /// default data.
        /// All Collection object are created.
        /// However any 1-n relationships (these are represented as collections) are
        /// empty. To comply with the schema these must be populated before the xml
        /// obtained from ToXml is valid against the schema C:\_DEV\aas-produkt\xsd\aas.xsd
        /// </remarks>
        public AdministrativeInformation_t()
        {
            _elementName = "administrativeInformation_t";
            Init();
        }

        public AdministrativeInformation_t(string elementName)
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
            m_EmbeddedDataSpecifications = null;
            m_Version = null;
            m_Revision = null;
            m_Creator = null;
            m_TemplateId = null;

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
            tns.AdministrativeInformation_t newObject = new tns.AdministrativeInformation_t(
                _elementName
            );
            newObject.m_EmbeddedDataSpecifications = null;
            if (m_EmbeddedDataSpecifications != null)
                newObject.m_EmbeddedDataSpecifications = (tns.EmbeddedDataSpecificationsB)
                    m_EmbeddedDataSpecifications.Clone();
            newObject.m_Version = m_Version;
            newObject.m_Revision = m_Revision;
            newObject.m_Creator = null;
            if (m_Creator != null)
                newObject.m_Creator = (tns.Reference_t)m_Creator.Clone();
            newObject.m_TemplateId = m_TemplateId;

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
            typeof(tns.EmbeddedDataSpecificationsB)
        )]
        public tns.EmbeddedDataSpecificationsB EmbeddedDataSpecifications
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
        protected tns.EmbeddedDataSpecificationsB m_EmbeddedDataSpecifications;

        #endregion

        #region Attribute - version
        /// <summary>
        /// Represents an optional Element in the XML document
        /// </summary>
        /// <remarks>
        /// This property is represented as an Element in the XML.
        /// It is optional, initially it is not valid.
        /// </remarks>
        [LiquidTechnologies.Runtime.ElementInfoSeqPrimOpt(
            "version",
            "https://admin-shell.io/aas/3/0",
            true,
            null,
            LiquidTechnologies.Runtime.Conversions.ConversionType.type_string,
            null,
            LiquidTechnologies.Runtime.WhitespaceUtils.WhitespaceRule.Preserve,
            "(0|[1-9][0-9]*)",
            1,
            4,
            "",
            "",
            "",
            "",
            -1,
            -1,
            -1,
            null
        )]
        public string Version
        {
            get { return m_Version; }
            set
            {
                if (value == null)
                {
                    m_Version = null;
                }
                else
                {
                    CheckElementRestriction(1, value);
                    // Apply whitespace rules appropriately
                    value = LiquidTechnologies.Runtime.WhitespaceUtils.Preserve(value);
                    m_Version = value;
                }
            }
        }
        protected string m_Version;
        #endregion

        #region Attribute - revision
        /// <summary>
        /// Represents an optional Element in the XML document
        /// </summary>
        /// <remarks>
        /// This property is represented as an Element in the XML.
        /// It is optional, initially it is not valid.
        /// </remarks>
        [LiquidTechnologies.Runtime.ElementInfoSeqPrimOpt(
            "revision",
            "https://admin-shell.io/aas/3/0",
            true,
            null,
            LiquidTechnologies.Runtime.Conversions.ConversionType.type_string,
            null,
            LiquidTechnologies.Runtime.WhitespaceUtils.WhitespaceRule.Preserve,
            "(0|[1-9][0-9]*)",
            1,
            4,
            "",
            "",
            "",
            "",
            -1,
            -1,
            -1,
            null
        )]
        public string Revision
        {
            get { return m_Revision; }
            set
            {
                if (value == null)
                {
                    m_Revision = null;
                }
                else
                {
                    CheckElementRestriction(2, value);
                    // Apply whitespace rules appropriately
                    value = LiquidTechnologies.Runtime.WhitespaceUtils.Preserve(value);
                    m_Revision = value;
                }
            }
        }
        protected string m_Revision;
        #endregion

        #region Attribute - creator
        /// <summary>
        /// Represents an optional Element in the XML document
        /// </summary>
        /// <remarks>
        /// This property is represented as an Element in the XML.
        /// It is optional, initially it is null.
        /// </remarks>
        [LiquidTechnologies.Runtime.ElementInfoSeqClsOpt(
            "creator",
            "https://admin-shell.io/aas/3/0",
            LiquidTechnologies.Runtime.XmlObjectBase.XmlElementType.Element,
            typeof(tns.Reference_t)
        )]
        public tns.Reference_t Creator
        {
            get { return m_Creator; }
            set
            {
                if (value == null)
                    m_Creator = null;
                else
                {
                    SetElementName(value, "creator");
                    m_Creator = value;
                }
            }
        }
        protected tns.Reference_t m_Creator;

        #endregion

        #region Attribute - templateId
        /// <summary>
        /// Represents an optional Element in the XML document
        /// </summary>
        /// <remarks>
        /// This property is represented as an Element in the XML.
        /// It is optional, initially it is not valid.
        /// </remarks>
        [LiquidTechnologies.Runtime.ElementInfoSeqPrimOpt(
            "templateId",
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
        public string TemplateId
        {
            get { return m_TemplateId; }
            set
            {
                if (value == null)
                {
                    m_TemplateId = null;
                }
                else
                {
                    CheckElementRestriction(4, value);
                    // Apply whitespace rules appropriately
                    value = LiquidTechnologies.Runtime.WhitespaceUtils.Preserve(value);
                    m_TemplateId = value;
                }
            }
        }
        protected string m_TemplateId;
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
