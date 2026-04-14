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
    /// This class represents the Element environment
    /// </summary>
    [LiquidTechnologies.Runtime.XmlObjectInfo(
        LiquidTechnologies.Runtime.XmlObjectBase.XmlElementGroupType.Sequence,
        LiquidTechnologies.Runtime.XmlObjectBase.XmlElementType.Element,
        "environment",
        "https://admin-shell.io/aas/3/0",
        true,
        false,
        false
    )]
    public partial class Environment : AasSchema.XmlCommonBase
    {
        #region Constructors
        /// <summary>
        /// Constructor for Environment
        /// </summary>
        /// <remarks>
        /// The class is created with all the mandatory fields populated with the
        /// default data.
        /// All Collection object are created.
        /// However any 1-n relationships (these are represented as collections) are
        /// empty. To comply with the schema these must be populated before the xml
        /// obtained from ToXml is valid against the schema C:\_DEV\aas-produkt\xsd\aas.xsd
        /// </remarks>
        public Environment()
        {
            _elementName = "environment";
            Init();
        }

        public Environment(string elementName)
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
            m_AssetAdministrationShells = null;
            m_Submodels = null;
            m_ConceptDescriptions = null;

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
            tns.Environment newObject = new tns.Environment(_elementName);
            newObject.m_AssetAdministrationShells = null;
            if (m_AssetAdministrationShells != null)
                newObject.m_AssetAdministrationShells = (tns.AssetAdministrationShells)
                    m_AssetAdministrationShells.Clone();
            newObject.m_Submodels = null;
            if (m_Submodels != null)
                newObject.m_Submodels = (tns.Submodels)m_Submodels.Clone();
            newObject.m_ConceptDescriptions = null;
            if (m_ConceptDescriptions != null)
                newObject.m_ConceptDescriptions = (tns.ConceptDescriptions)
                    m_ConceptDescriptions.Clone();

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

        #region Attribute - assetAdministrationShells
        /// <summary>
        /// Represents an optional Element in the XML document
        /// </summary>
        /// <remarks>
        /// This property is represented as an Element in the XML.
        /// It is optional, initially it is null.
        /// </remarks>
        [LiquidTechnologies.Runtime.ElementInfoSeqClsOpt(
            "assetAdministrationShells",
            "https://admin-shell.io/aas/3/0",
            LiquidTechnologies.Runtime.XmlObjectBase.XmlElementType.Element,
            typeof(tns.AssetAdministrationShells)
        )]
        public tns.AssetAdministrationShells AssetAdministrationShells
        {
            get { return m_AssetAdministrationShells; }
            set
            {
                if (value == null)
                    m_AssetAdministrationShells = null;
                else
                {
                    SetElementName(value, "assetAdministrationShells");
                    m_AssetAdministrationShells = value;
                }
            }
        }
        protected tns.AssetAdministrationShells m_AssetAdministrationShells;

        #endregion

        #region Attribute - submodels
        /// <summary>
        /// Represents an optional Element in the XML document
        /// </summary>
        /// <remarks>
        /// This property is represented as an Element in the XML.
        /// It is optional, initially it is null.
        /// </remarks>
        [LiquidTechnologies.Runtime.ElementInfoSeqClsOpt(
            "submodels",
            "https://admin-shell.io/aas/3/0",
            LiquidTechnologies.Runtime.XmlObjectBase.XmlElementType.Element,
            typeof(tns.Submodels)
        )]
        public tns.Submodels Submodels
        {
            get { return m_Submodels; }
            set
            {
                if (value == null)
                    m_Submodels = null;
                else
                {
                    SetElementName(value, "submodels");
                    m_Submodels = value;
                }
            }
        }
        protected tns.Submodels m_Submodels;

        #endregion

        #region Attribute - conceptDescriptions
        /// <summary>
        /// Represents an optional Element in the XML document
        /// </summary>
        /// <remarks>
        /// This property is represented as an Element in the XML.
        /// It is optional, initially it is null.
        /// </remarks>
        [LiquidTechnologies.Runtime.ElementInfoSeqClsOpt(
            "conceptDescriptions",
            "https://admin-shell.io/aas/3/0",
            LiquidTechnologies.Runtime.XmlObjectBase.XmlElementType.Element,
            typeof(tns.ConceptDescriptions)
        )]
        public tns.ConceptDescriptions ConceptDescriptions
        {
            get { return m_ConceptDescriptions; }
            set
            {
                if (value == null)
                    m_ConceptDescriptions = null;
                else
                {
                    SetElementName(value, "conceptDescriptions");
                    m_ConceptDescriptions = value;
                }
            }
        }
        protected tns.ConceptDescriptions m_ConceptDescriptions;

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
