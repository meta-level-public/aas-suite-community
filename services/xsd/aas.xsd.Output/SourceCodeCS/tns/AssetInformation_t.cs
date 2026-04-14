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
    /// This class represents the ComplexType assetInformation_t
    /// </summary>
    [LiquidTechnologies.Runtime.XmlObjectInfo(
        LiquidTechnologies.Runtime.XmlObjectBase.XmlElementGroupType.Sequence,
        LiquidTechnologies.Runtime.XmlObjectBase.XmlElementType.Element,
        "assetInformation_t",
        "https://admin-shell.io/aas/3/0",
        true,
        false,
        false
    )]
    public partial class AssetInformation_t : AasSchema.XmlCommonBase
    {
        #region Constructors
        /// <summary>
        /// Constructor for AssetInformation_t
        /// </summary>
        /// <remarks>
        /// The class is created with all the mandatory fields populated with the
        /// default data.
        /// All Collection object are created.
        /// However any 1-n relationships (these are represented as collections) are
        /// empty. To comply with the schema these must be populated before the xml
        /// obtained from ToXml is valid against the schema C:\_DEV\aas-produkt\xsd\aas.xsd
        /// </remarks>
        public AssetInformation_t()
        {
            _elementName = "assetInformation_t";
            Init();
        }

        public AssetInformation_t(string elementName)
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
            m_AssetKind = tns.Enumerations.AssetKind_t.Type;
            m_GlobalAssetId = null;
            m_SpecificAssetIds = null;
            m_AssetType = null;
            m_DefaultThumbnail = null;

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
            tns.AssetInformation_t newObject = new tns.AssetInformation_t(_elementName);
            newObject.m_AssetKind = m_AssetKind;
            newObject.m_GlobalAssetId = m_GlobalAssetId;
            newObject.m_SpecificAssetIds = null;
            if (m_SpecificAssetIds != null)
                newObject.m_SpecificAssetIds = (tns.SpecificAssetIdsA)m_SpecificAssetIds.Clone();
            newObject.m_AssetType = m_AssetType;
            newObject.m_DefaultThumbnail = null;
            if (m_DefaultThumbnail != null)
                newObject.m_DefaultThumbnail = (tns.Resource_t)m_DefaultThumbnail.Clone();

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

        #region Attribute - assetKind
        /// <summary>
        /// Represents a mandatory enumerated Element in the XML document
        /// </summary>
        /// <remarks>
        /// This property is represented as an Element in the XML.
        /// It is mandatory and therefore must be populated within the XML.
        /// It is defaulted to tns.Enumerations.AssetKind_t.Type;.
        /// </remarks>
        [LiquidTechnologies.Runtime.ElementInfoSeqEnumMnd(
            "assetKind",
            "https://admin-shell.io/aas/3/0",
            null,
            typeof(tns.Enumerations),
            "AssetKind_tFromString",
            "AssetKind_tToString",
            null
        )]
        public tns.Enumerations.AssetKind_t AssetKind
        {
            get { return m_AssetKind; }
            set { m_AssetKind = value; }
        }
        protected tns.Enumerations.AssetKind_t m_AssetKind;

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
                    CheckElementRestriction(1, value);
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
            typeof(tns.SpecificAssetIdsA)
        )]
        public tns.SpecificAssetIdsA SpecificAssetIds
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
        protected tns.SpecificAssetIdsA m_SpecificAssetIds;

        #endregion

        #region Attribute - assetType
        /// <summary>
        /// Represents an optional Element in the XML document
        /// </summary>
        /// <remarks>
        /// This property is represented as an Element in the XML.
        /// It is optional, initially it is not valid.
        /// </remarks>
        [LiquidTechnologies.Runtime.ElementInfoSeqPrimOpt(
            "assetType",
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
        public string AssetType
        {
            get { return m_AssetType; }
            set
            {
                if (value == null)
                {
                    m_AssetType = null;
                }
                else
                {
                    CheckElementRestriction(3, value);
                    // Apply whitespace rules appropriately
                    value = LiquidTechnologies.Runtime.WhitespaceUtils.Preserve(value);
                    m_AssetType = value;
                }
            }
        }
        protected string m_AssetType;
        #endregion

        #region Attribute - defaultThumbnail
        /// <summary>
        /// Represents an optional Element in the XML document
        /// </summary>
        /// <remarks>
        /// This property is represented as an Element in the XML.
        /// It is optional, initially it is null.
        /// </remarks>
        [LiquidTechnologies.Runtime.ElementInfoSeqClsOpt(
            "defaultThumbnail",
            "https://admin-shell.io/aas/3/0",
            LiquidTechnologies.Runtime.XmlObjectBase.XmlElementType.Element,
            typeof(tns.Resource_t)
        )]
        public tns.Resource_t DefaultThumbnail
        {
            get { return m_DefaultThumbnail; }
            set
            {
                if (value == null)
                    m_DefaultThumbnail = null;
                else
                {
                    SetElementName(value, "defaultThumbnail");
                    m_DefaultThumbnail = value;
                }
            }
        }
        protected tns.Resource_t m_DefaultThumbnail;

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
