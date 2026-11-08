import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { getAasSubmodelElementType } from './v3-submodel-element-utils';

type ISubmodelElement = aas.types.ISubmodelElement;

/**
 * Pure transformations between submodel element types used by the "Transform" context menu.
 * Each function creates a new element and keeps the common metadata of the source element.
 */

function copyCommonMetadata(source: ISubmodelElement, target: ISubmodelElement) {
  target.idShort = source.idShort;
  target.displayName = source.displayName;
  target.description = source.description;
  target.semanticId = source.semanticId;
  target.supplementalSemanticIds = source.supplementalSemanticIds;
  target.qualifiers = source.qualifiers;
  target.embeddedDataSpecifications = source.embeddedDataSpecifications;
}

/** MultiLanguageProperty to Property, the text in `language` (or the first text) becomes the value. */
export function transformToProperty(mlp: aas.types.MultiLanguageProperty, language: string): aas.types.Property {
  const property = new aas.types.Property(aas.types.DataTypeDefXsd.String, null, null, mlp.idShort);
  copyCommonMetadata(mlp, property);
  property.valueId = mlp.valueId;

  const fromLanguage = mlp.value?.find((v) => v.language === language)?.text;
  property.value = fromLanguage ?? mlp.value?.[0]?.text ?? null;
  return property;
}

/** Property to MultiLanguageProperty, the value becomes a text in `language`. */
export function transformToMultiLanguageProperty(
  property: aas.types.Property,
  language: string,
): aas.types.MultiLanguageProperty {
  const mlp = new aas.types.MultiLanguageProperty();
  copyCommonMetadata(property, mlp);
  mlp.valueId = property.valueId ?? null;
  mlp.value = property.value != null ? [new aas.types.LangStringTextType(language, String(property.value))] : null;
  return mlp;
}

/** SubmodelElementList to SubmodelElementCollection, the children are kept. */
export function transformToSubmodelElementCollection(
  sml: aas.types.SubmodelElementList,
): aas.types.SubmodelElementCollection {
  const smc = new aas.types.SubmodelElementCollection();
  copyCommonMetadata(sml, smc);
  smc.value = sml.value;
  return smc;
}

/** SubmodelElementCollection to SubmodelElementList, the type of the first child defines the list type. */
export function transformToSubmodelElementList(
  smc: aas.types.SubmodelElementCollection,
): aas.types.SubmodelElementList {
  const sml = new aas.types.SubmodelElementList(getAasSubmodelElementType(smc.value?.[0]));
  copyCommonMetadata(smc, sml);
  sml.orderRelevant = false;
  sml.semanticIdListElement = null;
  sml.valueTypeListElement = null;
  sml.value = smc.value;
  return sml;
}

/** Replaces `current` by `replacement` inside the child array of the parent container (in place). */
export function replaceElementInParent(parentContent: unknown, current: unknown, replacement: ISubmodelElement) {
  let children: ISubmodelElement[] | null | undefined;
  if (parentContent instanceof aas.types.Submodel) {
    children = parentContent.submodelElements;
  } else if (
    parentContent instanceof aas.types.SubmodelElementCollection ||
    parentContent instanceof aas.types.SubmodelElementList
  ) {
    children = parentContent.value;
  } else if (parentContent instanceof aas.types.Entity) {
    children = parentContent.statements;
  }

  const index = children?.indexOf(current as ISubmodelElement) ?? -1;
  if (children != null && index > -1) {
    children[index] = replacement;
  }
}
