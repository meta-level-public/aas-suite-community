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
    /// This class represents the Element annotations_Choice
    /// </summary>
    [LiquidTechnologies.Runtime.XmlObjectInfo(
        LiquidTechnologies.Runtime.XmlObjectBase.XmlElementGroupType.Choice,
        LiquidTechnologies.Runtime.XmlObjectBase.XmlElementType.PseudoElement,
        "annotations_Choice",
        "https://admin-shell.io/aas/3/0",
        false,
        false,
        false
    )]
    public partial class Annotations_Choice : AasSchema.XmlCommonBase
    {
        #region Constructors
        /// <summary>
        /// Constructor for Annotations_Choice
        /// </summary>
        /// <remarks>
        /// The class is created with all the mandatory fields populated with the
        /// default data.
        /// All Collection object are created.
        /// However any 1-n relationships (these are represented as collections) are
        /// empty. To comply with the schema these must be populated before the xml
        /// obtained from ToXml is valid against the schema C:\_DEV\aas-produkt\xsd\aas.xsd
        /// </remarks>
        public Annotations_Choice()
        {
            _elementName = "annotations_Choice";
            Init();
        }

        public Annotations_Choice(string elementName)
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
            m_Blob = null;
            m_File = null;
            m_MultiLanguageProperty = null;
            m_Property = null;
            m_Range = null;
            m_ReferenceElement = null;

            _validElement = "";
            // ##HAND_CODED_BLOCK_START ID="Additional Inits"## DO NOT MODIFY ANYTHING OUTSIDE OF THESE TAGS

            // Add Additional initialization code here...

            // ##HAND_CODED_BLOCK_END ID="Additional Inits"## DO NOT MODIFY ANYTHING OUTSIDE OF THESE TAGS
        }

        protected void ClearChoice(string selectedElement)
        {
            m_Blob = null;
            m_File = null;
            m_MultiLanguageProperty = null;
            m_Property = null;
            m_Range = null;
            m_ReferenceElement = null;
            _validElement = selectedElement;
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
            tns.Annotations_Choice newObject = new tns.Annotations_Choice(_elementName);
            newObject.m_Blob = null;
            if (m_Blob != null)
                newObject.m_Blob = (tns.Blob_t)m_Blob.Clone();
            newObject.m_File = null;
            if (m_File != null)
                newObject.m_File = (tns.File_t)m_File.Clone();
            newObject.m_MultiLanguageProperty = null;
            if (m_MultiLanguageProperty != null)
                newObject.m_MultiLanguageProperty = (tns.MultiLanguageProperty_t)
                    m_MultiLanguageProperty.Clone();
            newObject.m_Property = null;
            if (m_Property != null)
                newObject.m_Property = (tns.Property_t)m_Property.Clone();
            newObject.m_Range = null;
            if (m_Range != null)
                newObject.m_Range = (tns.Range_t)m_Range.Clone();
            newObject.m_ReferenceElement = null;
            if (m_ReferenceElement != null)
                newObject.m_ReferenceElement = (tns.ReferenceElement_t)m_ReferenceElement.Clone();

            newObject._validElement = _validElement;
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

        #region Attribute - blob
        /// <summary>
        /// Represents an optional Element in the XML document
        /// </summary>
        /// <remarks>
        /// This property is represented as an Element in the XML.
        /// It is optional, initially it is null.
        /// Only one Element within this class may be set at a time, setting this property when another element is already set will raise an exception. setting this property to null will allow another element to be selected
        /// </remarks>
        [LiquidTechnologies.Runtime.ElementInfoChoiceClsOpt(
            "blob",
            "https://admin-shell.io/aas/3/0",
            LiquidTechnologies.Runtime.XmlObjectBase.XmlElementType.Element,
            typeof(tns.Blob_t)
        )]
        public tns.Blob_t Blob
        {
            get { return m_Blob; }
            set
            {
                // The class represents a choice, so prevent more than one element from being selected
                ClearChoice((value == null) ? "" : "blob"); // remove selection
                if (value == null)
                    m_Blob = null;
                else
                {
                    SetElementName(value, "blob");
                    m_Blob = value;
                }
            }
        }
        protected tns.Blob_t m_Blob;

        #endregion

        #region Attribute - file
        /// <summary>
        /// Represents an optional Element in the XML document
        /// </summary>
        /// <remarks>
        /// This property is represented as an Element in the XML.
        /// It is optional, initially it is null.
        /// Only one Element within this class may be set at a time, setting this property when another element is already set will raise an exception. setting this property to null will allow another element to be selected
        /// </remarks>
        [LiquidTechnologies.Runtime.ElementInfoChoiceClsOpt(
            "file",
            "https://admin-shell.io/aas/3/0",
            LiquidTechnologies.Runtime.XmlObjectBase.XmlElementType.Element,
            typeof(tns.File_t)
        )]
        public tns.File_t File
        {
            get { return m_File; }
            set
            {
                // The class represents a choice, so prevent more than one element from being selected
                ClearChoice((value == null) ? "" : "file"); // remove selection
                if (value == null)
                    m_File = null;
                else
                {
                    SetElementName(value, "file");
                    m_File = value;
                }
            }
        }
        protected tns.File_t m_File;

        #endregion

        #region Attribute - multiLanguageProperty
        /// <summary>
        /// Represents an optional Element in the XML document
        /// </summary>
        /// <remarks>
        /// This property is represented as an Element in the XML.
        /// It is optional, initially it is null.
        /// Only one Element within this class may be set at a time, setting this property when another element is already set will raise an exception. setting this property to null will allow another element to be selected
        /// </remarks>
        [LiquidTechnologies.Runtime.ElementInfoChoiceClsOpt(
            "multiLanguageProperty",
            "https://admin-shell.io/aas/3/0",
            LiquidTechnologies.Runtime.XmlObjectBase.XmlElementType.Element,
            typeof(tns.MultiLanguageProperty_t)
        )]
        public tns.MultiLanguageProperty_t MultiLanguageProperty
        {
            get { return m_MultiLanguageProperty; }
            set
            {
                // The class represents a choice, so prevent more than one element from being selected
                ClearChoice((value == null) ? "" : "multiLanguageProperty"); // remove selection
                if (value == null)
                    m_MultiLanguageProperty = null;
                else
                {
                    SetElementName(value, "multiLanguageProperty");
                    m_MultiLanguageProperty = value;
                }
            }
        }
        protected tns.MultiLanguageProperty_t m_MultiLanguageProperty;

        #endregion

        #region Attribute - property
        /// <summary>
        /// Represents an optional Element in the XML document
        /// </summary>
        /// <remarks>
        /// This property is represented as an Element in the XML.
        /// It is optional, initially it is null.
        /// Only one Element within this class may be set at a time, setting this property when another element is already set will raise an exception. setting this property to null will allow another element to be selected
        /// </remarks>
        [LiquidTechnologies.Runtime.ElementInfoChoiceClsOpt(
            "property",
            "https://admin-shell.io/aas/3/0",
            LiquidTechnologies.Runtime.XmlObjectBase.XmlElementType.Element,
            typeof(tns.Property_t)
        )]
        public tns.Property_t Property
        {
            get { return m_Property; }
            set
            {
                // The class represents a choice, so prevent more than one element from being selected
                ClearChoice((value == null) ? "" : "property"); // remove selection
                if (value == null)
                    m_Property = null;
                else
                {
                    SetElementName(value, "property");
                    m_Property = value;
                }
            }
        }
        protected tns.Property_t m_Property;

        #endregion

        #region Attribute - range
        /// <summary>
        /// Represents an optional Element in the XML document
        /// </summary>
        /// <remarks>
        /// This property is represented as an Element in the XML.
        /// It is optional, initially it is null.
        /// Only one Element within this class may be set at a time, setting this property when another element is already set will raise an exception. setting this property to null will allow another element to be selected
        /// </remarks>
        [LiquidTechnologies.Runtime.ElementInfoChoiceClsOpt(
            "range",
            "https://admin-shell.io/aas/3/0",
            LiquidTechnologies.Runtime.XmlObjectBase.XmlElementType.Element,
            typeof(tns.Range_t)
        )]
        public tns.Range_t Range
        {
            get { return m_Range; }
            set
            {
                // The class represents a choice, so prevent more than one element from being selected
                ClearChoice((value == null) ? "" : "range"); // remove selection
                if (value == null)
                    m_Range = null;
                else
                {
                    SetElementName(value, "range");
                    m_Range = value;
                }
            }
        }
        protected tns.Range_t m_Range;

        #endregion

        #region Attribute - referenceElement
        /// <summary>
        /// Represents an optional Element in the XML document
        /// </summary>
        /// <remarks>
        /// This property is represented as an Element in the XML.
        /// It is optional, initially it is null.
        /// Only one Element within this class may be set at a time, setting this property when another element is already set will raise an exception. setting this property to null will allow another element to be selected
        /// </remarks>
        [LiquidTechnologies.Runtime.ElementInfoChoiceClsOpt(
            "referenceElement",
            "https://admin-shell.io/aas/3/0",
            LiquidTechnologies.Runtime.XmlObjectBase.XmlElementType.Element,
            typeof(tns.ReferenceElement_t)
        )]
        public tns.ReferenceElement_t ReferenceElement
        {
            get { return m_ReferenceElement; }
            set
            {
                // The class represents a choice, so prevent more than one element from being selected
                ClearChoice((value == null) ? "" : "referenceElement"); // remove selection
                if (value == null)
                    m_ReferenceElement = null;
                else
                {
                    SetElementName(value, "referenceElement");
                    m_ReferenceElement = value;
                }
            }
        }
        protected tns.ReferenceElement_t m_ReferenceElement;

        #endregion

        public string ChoiceSelectedElement
        {
            get { return _validElement; }
        }
        protected string _validElement;
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
