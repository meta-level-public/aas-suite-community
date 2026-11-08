import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { CMTypeOption } from '../model/cm-type-option';
import { EditorTypeOption } from '../model/editor-type-option';

type ISubmodelElement = aas.types.ISubmodelElement;

/**
 * Pure helpers for submodel elements used by the tree context menu:
 * type mapping, default elements, idShort generation and recursive cleanups.
 */

interface SubmodelElementTypeInfo {
  type: new (...args: never[]) => ISubmodelElement;
  aasType: aas.types.AasSubmodelElements;
  editorType: EditorTypeOption;
  cmType: CMTypeOption;
}

/** Order matters: subclasses have to be checked before their base classes. */
const SUBMODEL_ELEMENT_TYPES: SubmodelElementTypeInfo[] = [
  {
    type: aas.types.Property,
    aasType: aas.types.AasSubmodelElements.Property,
    editorType: EditorTypeOption.Property,
    cmType: CMTypeOption.Property,
  },
  {
    type: aas.types.MultiLanguageProperty,
    aasType: aas.types.AasSubmodelElements.MultiLanguageProperty,
    editorType: EditorTypeOption.MultiLanguageProperty,
    cmType: CMTypeOption.MultiLanguageProperty,
  },
  {
    type: aas.types.File,
    aasType: aas.types.AasSubmodelElements.File,
    editorType: EditorTypeOption.File,
    cmType: CMTypeOption.File,
  },
  {
    type: aas.types.Blob,
    aasType: aas.types.AasSubmodelElements.Blob,
    editorType: EditorTypeOption.Blob,
    cmType: CMTypeOption.Blob,
  },
  {
    type: aas.types.Capability,
    aasType: aas.types.AasSubmodelElements.Capability,
    editorType: EditorTypeOption.Capability,
    cmType: CMTypeOption.Capability,
  },
  {
    type: aas.types.ReferenceElement,
    aasType: aas.types.AasSubmodelElements.ReferenceElement,
    editorType: EditorTypeOption.ReferenceElement,
    cmType: CMTypeOption.ReferenceElement,
  },
  {
    type: aas.types.Operation,
    aasType: aas.types.AasSubmodelElements.Operation,
    editorType: EditorTypeOption.Operation,
    cmType: CMTypeOption.Operation,
  },
  {
    type: aas.types.Entity,
    aasType: aas.types.AasSubmodelElements.Entity,
    editorType: EditorTypeOption.Entity,
    cmType: CMTypeOption.Entity,
  },
  {
    type: aas.types.Range,
    aasType: aas.types.AasSubmodelElements.Range,
    editorType: EditorTypeOption.Range,
    cmType: CMTypeOption.Range,
  },
  {
    type: aas.types.RelationshipElement,
    aasType: aas.types.AasSubmodelElements.RelationshipElement,
    editorType: EditorTypeOption.RelationshipElement,
    cmType: CMTypeOption.RelationshipElement,
  },
  {
    type: aas.types.SubmodelElementCollection,
    aasType: aas.types.AasSubmodelElements.SubmodelElementCollection,
    editorType: EditorTypeOption.SubmodelElementCollection,
    cmType: CMTypeOption.SubmodelElementCollection,
  },
  {
    type: aas.types.SubmodelElementList,
    aasType: aas.types.AasSubmodelElements.SubmodelElementList,
    editorType: EditorTypeOption.SubmodelElementList,
    cmType: CMTypeOption.SubmodelElementList,
  },
];

function findTypeInfo(element: unknown) {
  return SUBMODEL_ELEMENT_TYPES.find((info) => element instanceof info.type);
}

/** AAS type of a submodel element, Property as fallback (e.g. for an empty collection). */
export function getAasSubmodelElementType(element: ISubmodelElement | undefined): aas.types.AasSubmodelElements {
  return findTypeInfo(element)?.aasType ?? aas.types.AasSubmodelElements.Property;
}

/** Editor type of a submodel element, Property as fallback. */
export function getEditorTypeForSubmodelElement(element: ISubmodelElement): EditorTypeOption {
  return findTypeInfo(element)?.editorType ?? EditorTypeOption.Property;
}

/** Context menu type that creates a new element of the given AAS type (e.g. the type of a list's children). */
export function getCreateTypeForAasSubmodelElement(
  aasType: aas.types.AasSubmodelElements | null | undefined,
): CMTypeOption | undefined {
  return SUBMODEL_ELEMENT_TYPES.find((info) => info.aasType === aasType)?.cmType;
}

/** Creates a new, empty submodel element with a default idShort, or undefined for other types. */
export function createDefaultSubmodelElement(
  type: CMTypeOption,
): { element: ISubmodelElement; editorType: EditorTypeOption } | undefined {
  switch (type) {
    case CMTypeOption.Property: {
      const prop = new aas.types.Property(aas.types.DataTypeDefXsd.String);
      prop.idShort = 'newProperty';
      return { element: prop, editorType: EditorTypeOption.Property };
    }
    case CMTypeOption.MultiLanguageProperty: {
      const prop = new aas.types.MultiLanguageProperty();
      prop.idShort = 'newMultilanguageProperty';
      return { element: prop, editorType: EditorTypeOption.MultiLanguageProperty };
    }
    case CMTypeOption.SubmodelElementCollection: {
      const prop = new aas.types.SubmodelElementCollection();
      prop.idShort = 'newSubmodelElementCollection';
      return { element: prop, editorType: EditorTypeOption.SubmodelElementCollection };
    }
    case CMTypeOption.SubmodelElementList: {
      // create with property for now, the user can change it later
      const prop = new aas.types.SubmodelElementList(aas.types.AasSubmodelElements.Property);
      prop.idShort = 'newSubmodelElementList';
      return { element: prop, editorType: EditorTypeOption.SubmodelElementList };
    }
    case CMTypeOption.File: {
      const prop = new aas.types.File();
      prop.contentType = 'application/unknown';
      prop.idShort = 'newFile';
      return { element: prop, editorType: EditorTypeOption.File };
    }
    case CMTypeOption.Operation: {
      const prop = new aas.types.Operation();
      prop.idShort = 'newOperation';
      return { element: prop, editorType: EditorTypeOption.Operation };
    }
    case CMTypeOption.Entity: {
      const prop = new aas.types.Entity();
      prop.entityType = aas.types.EntityType.SelfManagedEntity;
      prop.idShort = 'newEntity';
      return { element: prop, editorType: EditorTypeOption.Entity };
    }
    case CMTypeOption.Range: {
      const prop = new aas.types.Range(aas.types.DataTypeDefXsd.String);
      prop.idShort = 'newRange';
      return { element: prop, editorType: EditorTypeOption.Range };
    }
    case CMTypeOption.ReferenceElement: {
      const prop = new aas.types.ReferenceElement();
      prop.idShort = 'newReferenceElement';
      return { element: prop, editorType: EditorTypeOption.ReferenceElement };
    }
    case CMTypeOption.RelationshipElement: {
      const prop = new aas.types.RelationshipElement();
      prop.first = new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, []);
      prop.second = new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, []);
      prop.idShort = 'newRelationshipElement';
      return { element: prop, editorType: EditorTypeOption.RelationshipElement };
    }
    case CMTypeOption.Blob: {
      const prop = new aas.types.Blob();
      prop.contentType = '';
      prop.idShort = 'newBlob';
      return { element: prop, editorType: EditorTypeOption.Blob };
    }
    case CMTypeOption.Capability: {
      const prop = new aas.types.Capability();
      prop.idShort = 'newCapability';
      return { element: prop, editorType: EditorTypeOption.Capability };
    }
    default:
      return undefined;
  }
}

/** Unique idShort `copy_of_<idShort>` (with numeric suffix if needed) among the given siblings. */
export function buildCopiedIdShort(element: ISubmodelElement, siblings: ISubmodelElement[]): string {
  const typeName = aas.types.AasSubmodelElements[getAasSubmodelElementType(element)] ?? 'Element';
  const baseIdShort = element.idShort?.trim() || `new${typeName}`;
  const siblingIdShorts = new Set(
    siblings.map((sibling) => sibling.idShort).filter((idShort): idShort is string => !!idShort),
  );

  let candidate = `copy_of_${baseIdShort}`;
  let suffix = 1;

  while (siblingIdShorts.has(candidate)) {
    candidate = `copy_of_${baseIdShort}_${suffix}`;
    suffix++;
  }

  return candidate;
}

/**
 * idShort for a pasted copy. Elements without idShort (e.g. children of a SubmodelElementList)
 * must not become "copy_of_null": inside a list they stay without idShort, elsewhere they get a
 * generated, unique idShort because the target container requires one.
 */
export function buildPastedIdShort(copy: { idShort?: string | null }, target: unknown): string | null {
  const idShort = copy.idShort?.trim();
  if (idShort) {
    return 'copy_of_' + idShort;
  }

  if (target instanceof aas.types.SubmodelElementList || copy instanceof aas.types.Submodel) {
    return null;
  }

  const siblings: ISubmodelElement[] =
    target instanceof aas.types.Submodel
      ? (target.submodelElements ?? [])
      : target instanceof aas.types.SubmodelElementCollection
        ? (target.value ?? [])
        : [];
  return buildCopiedIdShort(copy as ISubmodelElement, siblings);
}

/** Direct child elements of a container element (collection, list, entity, operation variables). */
function getChildElements(element: ISubmodelElement): ISubmodelElement[] {
  if (element instanceof aas.types.SubmodelElementCollection || element instanceof aas.types.SubmodelElementList) {
    return element.value ?? [];
  }
  if (element instanceof aas.types.Entity) {
    return element.statements ?? [];
  }
  if (element instanceof aas.types.Operation) {
    return [
      ...(element.inputVariables ?? []),
      ...(element.outputVariables ?? []),
      ...(element.inoutputVariables ?? []),
    ].map((variable) => variable.value);
  }
  return [];
}

/** Resets all values of the element and its children (the structure and metadata stay). */
export function clearSubmodelElementValuesRecursive(element: ISubmodelElement): void {
  if (
    element instanceof aas.types.Property ||
    element instanceof aas.types.MultiLanguageProperty ||
    element instanceof aas.types.ReferenceElement ||
    element instanceof aas.types.File ||
    element instanceof aas.types.Blob
  ) {
    element.value = null;
    return;
  }

  if (element instanceof aas.types.Range) {
    element.min = null;
    element.max = null;
    return;
  }

  if (element instanceof aas.types.RelationshipElement) {
    element.first = null;
    element.second = null;
    return;
  }

  getChildElements(element).forEach((child) => clearSubmodelElementValuesRecursive(child));
}

/** Removes all template qualifiers from the element and its children, returns the number of removed qualifiers. */
export function removeTemplateQualifiersRecursive(element: ISubmodelElement): number {
  return getChildElements(element).reduce(
    (count, child) => count + removeTemplateQualifiersRecursive(child),
    removeTemplateQualifiersFromElement(element),
  );
}

function removeTemplateQualifiersFromElement(element: ISubmodelElement): number {
  if (element.qualifiers == null) {
    return 0;
  }

  const filteredQualifiers = element.qualifiers.filter(
    (qualifier) => qualifier.kind !== aas.types.QualifierKind.TemplateQualifier,
  );
  const removedQualifierCount = element.qualifiers.length - filteredQualifiers.length;

  element.qualifiers = filteredQualifiers.length > 0 ? filteredQualifiers : null;

  return removedQualifierCount;
}
