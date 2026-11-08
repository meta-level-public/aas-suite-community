import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { CMTransformOption } from '../model/cm-transform-option';
import { CMTypeOption } from '../model/cm-type-option';
import { EditorTypeOption } from '../model/editor-type-option';

/**
 * Pure rules that decide which context menu actions are offered for a tree node,
 * based on the editor type of the node (and of the copied element for paste).
 */

const SUBMODEL_ELEMENT_CONTAINER_INSERTS: CMTypeOption[] = [
  CMTypeOption.SubmodelElementCollection,
  CMTypeOption.SubmodelElementList,
  CMTypeOption.File,
  CMTypeOption.Blob,
  CMTypeOption.Property,
  CMTypeOption.Operation,
  CMTypeOption.Range,
  CMTypeOption.Entity,
  CMTypeOption.ReferenceElement,
  CMTypeOption.MultiLanguageProperty,
  CMTypeOption.RelationshipElement,
  CMTypeOption.ElementGroup,
  CMTypeOption.SnippetGroup,
  CMTypeOption.ContactInformation,
  CMTypeOption.AddGroup,
  CMTypeOption.OptionalElements,
  CMTypeOption.ElFromJson,
  CMTypeOption.Addon,
];

const ALLOWED_INSERTS: Partial<Record<EditorTypeOption, CMTypeOption[]>> = {
  [EditorTypeOption.AssetAdministrationShell]: [
    CMTypeOption.Submodel,
    CMTypeOption.SnippetGroup,
    CMTypeOption.AddGroup,
    CMTypeOption.SMFromJson,
    CMTypeOption.Addon,
  ],
  [EditorTypeOption.Submodel]: SUBMODEL_ELEMENT_CONTAINER_INSERTS,
  [EditorTypeOption.SubmodelElementCollection]: SUBMODEL_ELEMENT_CONTAINER_INSERTS,
  [EditorTypeOption.Entity]: SUBMODEL_ELEMENT_CONTAINER_INSERTS,
  [EditorTypeOption.AssetAdministrationShells]: [
    CMTypeOption.AssetAdministrationShell,
    CMTypeOption.AddGroup,
    CMTypeOption.Addon,
  ],
  [EditorTypeOption.Assets]: [
    CMTypeOption.Asset,
    CMTypeOption.SnippetGroup,
    CMTypeOption.ElementGroup,
    CMTypeOption.AddGroup,
    CMTypeOption.Addon,
  ],
  [EditorTypeOption.ConceptDescriptions]: [
    CMTypeOption.ConceptDescription,
    CMTypeOption.SnippetGroup,
    CMTypeOption.ElementGroup,
    CMTypeOption.AddGroup,
    CMTypeOption.CdFromJson,
  ],
};

/** Element types that can be copied, deleted and saved (as snippet or JSON). */
const ELEMENT_TYPES: EditorTypeOption[] = [
  EditorTypeOption.Submodel,
  EditorTypeOption.SubmodelElementCollection,
  EditorTypeOption.SubmodelElementList,
  EditorTypeOption.Entity,
  EditorTypeOption.ConceptDescription,
  EditorTypeOption.Property,
  EditorTypeOption.MultiLanguageProperty,
  EditorTypeOption.RelationshipElement,
  EditorTypeOption.Operation,
  EditorTypeOption.Range,
  EditorTypeOption.ReferenceElement,
  EditorTypeOption.File,
  EditorTypeOption.Blob,
  EditorTypeOption.Capability,
];

const PASTEABLE_SUBMODEL_ELEMENTS: EditorTypeOption[] = [
  EditorTypeOption.SubmodelElementCollection,
  EditorTypeOption.SubmodelElementList,
  EditorTypeOption.Entity,
  EditorTypeOption.File,
  EditorTypeOption.Property,
  EditorTypeOption.Operation,
  EditorTypeOption.ReferenceElement,
  EditorTypeOption.MultiLanguageProperty,
  EditorTypeOption.RelationshipElement,
];

const TRANSFORMS: Partial<Record<EditorTypeOption, CMTransformOption>> = {
  [EditorTypeOption.SubmodelElementCollection]: CMTransformOption.TO_SUBMODEL_ELEMENT_LIST,
  [EditorTypeOption.SubmodelElementList]: CMTransformOption.TO_SUBMODEL_ELEMENT_COLLECTION,
  [EditorTypeOption.Property]: CMTransformOption.TO_MULTILANGUAGE_PROPERTY,
  [EditorTypeOption.MultiLanguageProperty]: CMTransformOption.TO_PROPERTY,
};

export function isInsertAllowedFor(editorType: EditorTypeOption | undefined, sourceType: CMTypeOption): boolean {
  if (editorType == null) return false;
  return ALLOWED_INSERTS[editorType]?.includes(sourceType) ?? false;
}

export function isDeleteAllowedFor(editorType: EditorTypeOption | undefined): boolean {
  if (editorType == null) return false;
  return (
    editorType === EditorTypeOption.AssetAdministrationShell ||
    editorType === EditorTypeOption.SupplementalFile ||
    ELEMENT_TYPES.includes(editorType)
  );
}

export function isCopyAllowedFor(editorType: EditorTypeOption | undefined): boolean {
  if (editorType == null) return false;
  return editorType === EditorTypeOption.AssetAdministrationShell || ELEMENT_TYPES.includes(editorType);
}

export function isSaveAsAllowedFor(editorType: EditorTypeOption | undefined): boolean {
  // AssetAdministrationShell is excluded on purpose until there is a concept to also save the references.
  return editorType != null && ELEMENT_TYPES.includes(editorType);
}

export function isPasteAllowedFor(
  targetType: EditorTypeOption | undefined,
  copiedType: EditorTypeOption | undefined,
): boolean {
  if (targetType == null || copiedType == null) return false;
  switch (targetType) {
    case EditorTypeOption.AssetAdministrationShells:
      return copiedType === EditorTypeOption.AssetAdministrationShell;
    case EditorTypeOption.AssetAdministrationShell:
      return copiedType === EditorTypeOption.Submodel;
    case EditorTypeOption.Submodel:
    case EditorTypeOption.SubmodelElementCollection:
    case EditorTypeOption.SubmodelElementList:
    case EditorTypeOption.Entity:
      return PASTEABLE_SUBMODEL_ELEMENTS.includes(copiedType);
    case EditorTypeOption.ConceptDescriptions:
      return copiedType === EditorTypeOption.ConceptDescription;
    default:
      return false;
  }
}

export function isTransformAllowedFor(
  editorType: EditorTypeOption | undefined,
  transformOption: CMTransformOption,
): boolean {
  return editorType != null && TRANSFORMS[editorType] === transformOption;
}

/** Template qualifiers can only be removed from submodels that are not templates themselves. */
export function isRemoveTemplateQualifiersAllowedFor(editorType: EditorTypeOption | undefined, content: unknown) {
  return (
    editorType === EditorTypeOption.Submodel &&
    content instanceof aas.types.Submodel &&
    content.kind !== aas.types.ModellingKind.Template
  );
}

/** Element types offered in the snippet catalog when inserting below a node of the given type. */
export function getAllowedSnippetTypes(targetType: EditorTypeOption): EditorTypeOption[] {
  switch (targetType) {
    case EditorTypeOption.AssetAdministrationShell:
      return [EditorTypeOption.Submodel];
    case EditorTypeOption.Submodel:
    case EditorTypeOption.SubmodelElementCollection:
    case EditorTypeOption.Entity:
      return [
        EditorTypeOption.SubmodelElementCollection,
        EditorTypeOption.File,
        EditorTypeOption.Property,
        EditorTypeOption.Operation,
        EditorTypeOption.Entity,
        EditorTypeOption.ReferenceElement,
        EditorTypeOption.MultiLanguageProperty,
        EditorTypeOption.RelationshipElement,
        EditorTypeOption.ContactInformation,
      ];
    case EditorTypeOption.AssetAdministrationShells:
      return [EditorTypeOption.AssetAdministrationShell];
    case EditorTypeOption.ConceptDescriptions:
      return [EditorTypeOption.ConceptDescription];
    default:
      return [];
  }
}
