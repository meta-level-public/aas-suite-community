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

namespace AasSchema
{
    public static class ClassFactory
    {
        #region Static Constructor
        private static System.Collections.Generic.Dictionary<
            string,
            System.Collections.Generic.Dictionary<string, System.Type>
        > _nsMap = null;

        static ClassFactory()
        {
            _nsMap = new System.Collections.Generic.Dictionary<
                string,
                System.Collections.Generic.Dictionary<string, System.Type>
            >();
            System.Collections.Generic.Dictionary<string, System.Type> itemMap = null;
            itemMap = new System.Collections.Generic.Dictionary<string, System.Type>();
            itemMap.Add("administrativeInformation_t", typeof(tns.AdministrativeInformation_t));
            itemMap.Add(
                "annotatedRelationshipElement_t",
                typeof(tns.AnnotatedRelationshipElement_t)
            );
            itemMap.Add("annotations", typeof(tns.Annotations));
            itemMap.Add("annotations_Choice", typeof(tns.Annotations_Choice));
            itemMap.Add("assetAdministrationShell_t", typeof(tns.AssetAdministrationShell_t));
            itemMap.Add("assetAdministrationShells", typeof(tns.AssetAdministrationShells));
            itemMap.Add("assetInformation_t", typeof(tns.AssetInformation_t));
            itemMap.Add("basicEventElement_t", typeof(tns.BasicEventElement_t));
            itemMap.Add("blob_t", typeof(tns.Blob_t));
            itemMap.Add("capability_t", typeof(tns.Capability_t));
            itemMap.Add("conceptDescription_t", typeof(tns.ConceptDescription_t));
            itemMap.Add("conceptDescriptions", typeof(tns.ConceptDescriptions));
            itemMap.Add("dataSpecificationContent", typeof(tns.DataSpecificationContent));
            itemMap.Add("dataSpecificationIec61360_t", typeof(tns.DataSpecificationIec61360_t));
            itemMap.Add("definition", typeof(tns.Definition));
            itemMap.Add("description", typeof(tns.DescriptionA));
            itemMap.Add("displayName", typeof(tns.DisplayNameA));
            itemMap.Add("embeddedDataSpecification_t", typeof(tns.EmbeddedDataSpecification_t));
            itemMap.Add("embeddedDataSpecifications", typeof(tns.EmbeddedDataSpecificationsA));
            itemMap.Add("entity_t", typeof(tns.Entity_t));
            itemMap.Add("environment", typeof(tns.Environment));
            itemMap.Add("extension_t", typeof(tns.Extension_t));
            itemMap.Add("extensions", typeof(tns.ExtensionsA));
            itemMap.Add("file_t", typeof(tns.File_t));
            itemMap.Add("inoutputVariables", typeof(tns.InoutputVariables));
            itemMap.Add("inputVariables", typeof(tns.InputVariables));
            itemMap.Add("isCaseOf", typeof(tns.IsCaseOf));
            itemMap.Add("key_t", typeof(tns.Key_t));
            itemMap.Add("keys", typeof(tns.Keys));
            itemMap.Add(
                "langStringDefinitionTypeIec61360_t",
                typeof(tns.LangStringDefinitionTypeIec61360_t)
            );
            itemMap.Add("langStringNameType_t", typeof(tns.LangStringNameType_t));
            itemMap.Add(
                "langStringPreferredNameTypeIec61360_t",
                typeof(tns.LangStringPreferredNameTypeIec61360_t)
            );
            itemMap.Add(
                "langStringShortNameTypeIec61360_t",
                typeof(tns.LangStringShortNameTypeIec61360_t)
            );
            itemMap.Add("langStringTextType_t", typeof(tns.LangStringTextType_t));
            itemMap.Add("levelType_t", typeof(tns.LevelType_t));
            itemMap.Add("multiLanguageProperty_t", typeof(tns.MultiLanguageProperty_t));
            itemMap.Add("operation_t", typeof(tns.Operation_t));
            itemMap.Add("operationVariable_t", typeof(tns.OperationVariable_t));
            itemMap.Add("outputVariables", typeof(tns.OutputVariables));
            itemMap.Add("preferredName", typeof(tns.PreferredName));
            itemMap.Add("property_t", typeof(tns.Property_t));
            itemMap.Add("qualifier_t", typeof(tns.Qualifier_t));
            itemMap.Add("qualifiers", typeof(tns.QualifiersA));
            itemMap.Add("range_t", typeof(tns.Range_t));
            itemMap.Add("reference_t", typeof(tns.Reference_t));
            itemMap.Add("referenceElement_t", typeof(tns.ReferenceElement_t));
            itemMap.Add("refersTo", typeof(tns.RefersTo));
            itemMap.Add("relationshipElement_t", typeof(tns.RelationshipElement_t));
            itemMap.Add("resource_t", typeof(tns.Resource_t));
            itemMap.Add("shortName", typeof(tns.ShortName));
            itemMap.Add("specificAssetId_t", typeof(tns.SpecificAssetId_t));
            itemMap.Add("specificAssetIds", typeof(tns.SpecificAssetIds));
            itemMap.Add("statements", typeof(tns.Statements));
            itemMap.Add("statements_Choice", typeof(tns.Statements_Choice));
            itemMap.Add("submodel_t", typeof(tns.Submodel_t));
            itemMap.Add("submodelElementCollection_t", typeof(tns.SubmodelElementCollection_t));
            itemMap.Add("submodelElementList_t", typeof(tns.SubmodelElementList_t));
            itemMap.Add("submodelElements", typeof(tns.SubmodelElements));
            itemMap.Add("submodelElements_Choice", typeof(tns.SubmodelElements_Choice));
            itemMap.Add("submodels", typeof(tns.Submodels));
            itemMap.Add("supplementalSemanticIds", typeof(tns.SupplementalSemanticIdsA));
            itemMap.Add("value", typeof(tns.Value));
            itemMap.Add("value_Choice", typeof(tns.Value_Choice));
            itemMap.Add("value0_Choice", typeof(tns.Value0_Choice));
            itemMap.Add("valueList_t", typeof(tns.ValueList_t));
            itemMap.Add("valueReferencePair_t", typeof(tns.ValueReferencePair_t));
            itemMap.Add("valueReferencePairs", typeof(tns.ValueReferencePairs));
            _nsMap.Add("https://admin-shell.io/aas/3/0", itemMap);
        }
        #endregion

        #region FromXml
        /// <summary>
        /// Creates an object from XML data held in a string.
        /// </summary>
        /// <param name="xmlIn">The data to be loaded</param>
        /// <returns>The wrapper object, loaded with the supplied data</returns>
        /// <remarks>Throws an exception if the XML data is not compatible with the schema</remarks>
        public static LiquidTechnologies.Runtime.XmlObjectBase FromXml(String xmlIn)
        {
            return FromXml(xmlIn, LiquidTechnologies.Runtime.SerializationContext.Default);
        }

        /// <summary>
        /// Creates an object from XML data held in a string.
        /// </summary>
        /// <param name="xmlIn">The data to be loaded</param>
        /// <param name="context">The context to use when loading the data</param>
        /// <returns>The wrapper object, loaded with the supplied data</returns>
        /// <remarks>Throws an exception if the XML data is not compatible with the schema</remarks>
        public static LiquidTechnologies.Runtime.XmlObjectBase FromXml(
            String xmlIn,
            LiquidTechnologies.Runtime.SerializationContext context
        )
        {
            XmlDocument xmlDoc = LiquidTechnologies.Runtime.XmlObjectBase.LoadXmlDocument(
                xmlIn,
                context
            );
            return FromXmlElement(xmlDoc.DocumentElement, context);
        }
        #endregion

        #region FromXmlFile
        /// <summary>
        /// Creates an object from XML data held in a File
        /// </summary>
        /// <param name="FileName">The file to be loaded</param>
        /// <returns>The wrapper object, loaded with the supplied data</returns>
        /// <remarks>Throws an exception if the XML data is not compatible with the schema</remarks>
        public static LiquidTechnologies.Runtime.XmlObjectBase FromXmlFile(String FileName)
        {
            return FromXmlFile(FileName, LiquidTechnologies.Runtime.SerializationContext.Default);
        }

        /// <summary>
        /// Creates an object from XML data held in a File
        /// </summary>
        /// <param name="FileName">The file to be loaded</param>
        /// <param name="context">The context to use when loading the data</param>
        /// <returns>The wrapper object, loaded with the supplied data</returns>
        /// <remarks>Throws an exception if the XML data is not compatible with the schema</remarks>
        public static LiquidTechnologies.Runtime.XmlObjectBase FromXmlFile(
            String FileName,
            LiquidTechnologies.Runtime.SerializationContext context
        )
        {
            using (
                System.IO.Stream stream = new System.IO.FileStream(
                    FileName,
                    System.IO.FileMode.Open,
                    System.IO.FileAccess.Read,
                    System.IO.FileShare.Read
                )
            )
            {
                return FromXmlStream(stream, context);
            }
        }
        #endregion

        #region FromXmlStream
        /// <summary>
        /// Creates an object from XML data held in a stream.
        /// </summary>
        /// <param name="stream">The data to be loaded</param>
        /// <returns>The wrapper object, loaded with the supplied data</returns>
        /// <remarks>Throws an exception if the XML data is not compatible with the schema</remarks>
        public static LiquidTechnologies.Runtime.XmlObjectBase FromXmlStream(
            System.IO.Stream stream
        )
        {
            return FromXmlStream(stream, LiquidTechnologies.Runtime.SerializationContext.Default);
        }

        /// <summary>
        /// Creates an object from XML data held in a stream.
        /// </summary>
        /// <param name="stream">The data to be loaded</param>
        /// <returns>The wrapper object, loaded with the supplied data</returns>
        /// <remarks>Throws an exception if the XML data is not compatible with the schema</remarks>
        public static LiquidTechnologies.Runtime.XmlObjectBase FromXmlStream(
            System.IO.Stream stream,
            LiquidTechnologies.Runtime.SerializationContext context
        )
        {
            XmlDocument xmlDoc = LiquidTechnologies.Runtime.XmlObjectBase.LoadXmlDocument(
                stream,
                context
            );
            return FromXmlElement(xmlDoc.DocumentElement, context);
        }
        #endregion

        #region FromXmlElement
        /// <summary>
        /// Creates an object from an XML Element.
        /// </summary>
        /// <param name="xmlParent">The data that needs loading</param>
        /// <returns>The wrapper object, loaded with the supplied data</returns>
        /// <remarks>Throws an exception if the XML data is not compatible with the schema</remarks>
        public static LiquidTechnologies.Runtime.XmlObjectBase FromXmlElement(XmlElement xmlParent)
        {
            return FromXmlElement(
                xmlParent,
                LiquidTechnologies.Runtime.SerializationContext.Default
            );
        }

        /// <summary>
        /// Creates an object from an XML Element.
        /// </summary>
        /// <param name="xmlParent">The data that needs loading</param>
        /// <param name="context">The context to use when loading the data</param>
        /// <returns>The wrapper object, loaded with the supplied data</returns>
        /// <remarks>Throws an exception if the XML data is not compatible with the schema</remarks>
        public static LiquidTechnologies.Runtime.XmlObjectBase FromXmlElement(
            XmlElement xmlParent,
            LiquidTechnologies.Runtime.SerializationContext context
        )
        {
            LiquidTechnologies.Runtime.XmlObjectBase retVal = null;
            String elementName;
            String elementNamespaceUri;

            // Get the type name this is either
            // from the element i.e. <Parent>... = Parent
            // or from the type i.e. <Parent xsi:type="someNS:SomeElement">... = SomeElement
            if (LiquidTechnologies.Runtime.ClassFactoryHelper.GetElementType(xmlParent) == "")
            {
                elementName = xmlParent.LocalName;
                elementNamespaceUri = xmlParent.NamespaceURI;
            }
            else
            {
                elementName = LiquidTechnologies.Runtime.ClassFactoryHelper.GetElementType(
                    xmlParent
                );
                elementNamespaceUri =
                    LiquidTechnologies.Runtime.ClassFactoryHelper.GetElementTypeNamespaceUri(
                        xmlParent
                    );
            }

            // create the appropriate object
            retVal = LiquidTechnologies.Runtime.ClassFactoryHelper.CreateObject(
                _nsMap,
                elementName,
                elementNamespaceUri,
                context
            );
            if (retVal == null)
                throw new LiquidTechnologies.Runtime.LtException(
                    string.Format(
                        "Failed load the element {0}:{1}. No appropriate class exists to load the data into. Ensure that the XML document complies with the schema.",
                        elementName,
                        elementNamespaceUri
                    )
                );

            // load the data into the object
            retVal.FromXmlElement(xmlParent, context);

            return retVal;
        }
        #endregion
    }
}
