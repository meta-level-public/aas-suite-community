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
    /// This class represents the ComplexType specificAssetId_t
    /// </summary>
    [LiquidTechnologies.Runtime.XmlObjectInfo(
        LiquidTechnologies.Runtime.XmlObjectBase.XmlElementGroupType.Sequence,
        LiquidTechnologies.Runtime.XmlObjectBase.XmlElementType.Element,
        "specificAssetId_t",
        "https://admin-shell.io/aas/3/0",
        true,
        false,
        false
    )]
    public partial class SpecificAssetId_t : AasSchema.XmlCommonBase
    {
        #region Constructors
        /// <summary>
        /// Constructor for SpecificAssetId_t
        /// </summary>
        /// <remarks>
        /// The class is created with all the mandatory fields populated with the
        /// default data.
        /// All Collection object are created.
        /// However any 1-n relationships (these are represented as collections) are
        /// empty. To comply with the schema these must be populated before the xml
        /// obtained from ToXml is valid against the schema C:\_DEV\aas-produkt\xsd\aas.xsd
        /// </remarks>
        public SpecificAssetId_t()
        {
            _elementName = "specificAssetId_t";
            Init();
        }

        public SpecificAssetId_t(string elementName)
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
            m_Name = "";
            m_Value = "";
            m_ExternalSubjectId = null;

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
            tns.SpecificAssetId_t newObject = new tns.SpecificAssetId_t(_elementName);
            newObject.m_SemanticId = null;
            if (m_SemanticId != null)
                newObject.m_SemanticId = (tns.Reference_t)m_SemanticId.Clone();
            newObject.m_SupplementalSemanticIds = null;
            if (m_SupplementalSemanticIds != null)
                newObject.m_SupplementalSemanticIds = (tns.SupplementalSemanticIdsC)
                    m_SupplementalSemanticIds.Clone();
            newObject.m_Name = m_Name;
            newObject.m_Value = m_Value;
            newObject.m_ExternalSubjectId = null;
            if (m_ExternalSubjectId != null)
                newObject.m_ExternalSubjectId = (tns.Reference_t)m_ExternalSubjectId.Clone();

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
            typeof(tns.SupplementalSemanticIdsC)
        )]
        public tns.SupplementalSemanticIdsC SupplementalSemanticIds
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
        protected tns.SupplementalSemanticIdsC m_SupplementalSemanticIds;

        #endregion

        #region Attribute - name
        /// <summary>
        /// Represents a mandatory Element in the XML document
        /// </summary>
        /// <remarks>
        /// This property is represented as an Element in the XML.
        /// It is mandatory and therefore must be populated within the XML.
        /// It is defaulted to "".
        /// </remarks>
        [LiquidTechnologies.Runtime.ElementInfoSeqPrimMnd(
            "name",
            "https://admin-shell.io/aas/3/0",
            null,
            LiquidTechnologies.Runtime.Conversions.ConversionType.type_string,
            null,
            LiquidTechnologies.Runtime.WhitespaceUtils.WhitespaceRule.Preserve,
            "",
            1,
            64,
            "",
            "",
            "",
            "",
            -1,
            -1,
            -1,
            null
        )]
        public string Name
        {
            get { return m_Name; }
            set
            {
                // Apply whitespace rules appropriately
                value = LiquidTechnologies.Runtime.WhitespaceUtils.Preserve(value);
                CheckElementRestriction(2, value);
                m_Name = value;
            }
        }
        protected string m_Name;

        #endregion

        #region Attribute - value
        /// <summary>
        /// Represents a mandatory Element in the XML document
        /// </summary>
        /// <remarks>
        /// This property is represented as an Element in the XML.
        /// It is mandatory and therefore must be populated within the XML.
        /// It is defaulted to "".
        /// </remarks>
        [LiquidTechnologies.Runtime.ElementInfoSeqPrimMnd(
            "value",
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
        public string Value
        {
            get { return m_Value; }
            set
            {
                // Apply whitespace rules appropriately
                value = LiquidTechnologies.Runtime.WhitespaceUtils.Preserve(value);
                CheckElementRestriction(3, value);
                m_Value = value;
            }
        }
        protected string m_Value;

        #endregion

        #region Attribute - externalSubjectId
        /// <summary>
        /// Represents an optional Element in the XML document
        /// </summary>
        /// <remarks>
        /// This property is represented as an Element in the XML.
        /// It is optional, initially it is null.
        /// </remarks>
        [LiquidTechnologies.Runtime.ElementInfoSeqClsOpt(
            "externalSubjectId",
            "https://admin-shell.io/aas/3/0",
            LiquidTechnologies.Runtime.XmlObjectBase.XmlElementType.Element,
            typeof(tns.Reference_t)
        )]
        public tns.Reference_t ExternalSubjectId
        {
            get { return m_ExternalSubjectId; }
            set
            {
                if (value == null)
                    m_ExternalSubjectId = null;
                else
                {
                    SetElementName(value, "externalSubjectId");
                    m_ExternalSubjectId = value;
                }
            }
        }
        protected tns.Reference_t m_ExternalSubjectId;

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
