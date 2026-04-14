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
    /// This class represents the ComplexType levelType_t
    /// </summary>
    [LiquidTechnologies.Runtime.XmlObjectInfo(
        LiquidTechnologies.Runtime.XmlObjectBase.XmlElementGroupType.Sequence,
        LiquidTechnologies.Runtime.XmlObjectBase.XmlElementType.Element,
        "levelType_t",
        "https://admin-shell.io/aas/3/0",
        true,
        false,
        false
    )]
    public partial class LevelType_t : AasSchema.XmlCommonBase
    {
        #region Constructors
        /// <summary>
        /// Constructor for LevelType_t
        /// </summary>
        /// <remarks>
        /// The class is created with all the mandatory fields populated with the
        /// default data.
        /// All Collection object are created.
        /// However any 1-n relationships (these are represented as collections) are
        /// empty. To comply with the schema these must be populated before the xml
        /// obtained from ToXml is valid against the schema C:\_DEV\aas-produkt\xsd\aas.xsd
        /// </remarks>
        public LevelType_t()
        {
            _elementName = "levelType_t";
            Init();
        }

        public LevelType_t(string elementName)
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
            m_Min = false;
            m_Nom = false;
            m_Typ = false;
            m_Max = false;

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
            tns.LevelType_t newObject = new tns.LevelType_t(_elementName);
            newObject.m_Min = m_Min;
            newObject.m_Nom = m_Nom;
            newObject.m_Typ = m_Typ;
            newObject.m_Max = m_Max;

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

        #region Attribute - min
        /// <summary>
        /// Represents a mandatory Element in the XML document
        /// </summary>
        /// <remarks>
        /// This property is represented as an Element in the XML.
        /// It is mandatory and therefore must be populated within the XML.
        /// It is defaulted to false.
        /// </remarks>
        [LiquidTechnologies.Runtime.ElementInfoSeqPrimMnd(
            "min",
            "https://admin-shell.io/aas/3/0",
            null,
            LiquidTechnologies.Runtime.Conversions.ConversionType.type_boolean,
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
        public bool Min
        {
            get { return m_Min; }
            set { m_Min = value; }
        }
        protected bool m_Min;

        #endregion

        #region Attribute - nom
        /// <summary>
        /// Represents a mandatory Element in the XML document
        /// </summary>
        /// <remarks>
        /// This property is represented as an Element in the XML.
        /// It is mandatory and therefore must be populated within the XML.
        /// It is defaulted to false.
        /// </remarks>
        [LiquidTechnologies.Runtime.ElementInfoSeqPrimMnd(
            "nom",
            "https://admin-shell.io/aas/3/0",
            null,
            LiquidTechnologies.Runtime.Conversions.ConversionType.type_boolean,
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
        public bool Nom
        {
            get { return m_Nom; }
            set { m_Nom = value; }
        }
        protected bool m_Nom;

        #endregion

        #region Attribute - typ
        /// <summary>
        /// Represents a mandatory Element in the XML document
        /// </summary>
        /// <remarks>
        /// This property is represented as an Element in the XML.
        /// It is mandatory and therefore must be populated within the XML.
        /// It is defaulted to false.
        /// </remarks>
        [LiquidTechnologies.Runtime.ElementInfoSeqPrimMnd(
            "typ",
            "https://admin-shell.io/aas/3/0",
            null,
            LiquidTechnologies.Runtime.Conversions.ConversionType.type_boolean,
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
        public bool Typ
        {
            get { return m_Typ; }
            set { m_Typ = value; }
        }
        protected bool m_Typ;

        #endregion

        #region Attribute - max
        /// <summary>
        /// Represents a mandatory Element in the XML document
        /// </summary>
        /// <remarks>
        /// This property is represented as an Element in the XML.
        /// It is mandatory and therefore must be populated within the XML.
        /// It is defaulted to false.
        /// </remarks>
        [LiquidTechnologies.Runtime.ElementInfoSeqPrimMnd(
            "max",
            "https://admin-shell.io/aas/3/0",
            null,
            LiquidTechnologies.Runtime.Conversions.ConversionType.type_boolean,
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
        public bool Max
        {
            get { return m_Max; }
            set { m_Max = value; }
        }
        protected bool m_Max;

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
