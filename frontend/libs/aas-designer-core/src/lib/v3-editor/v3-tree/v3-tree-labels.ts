import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { EditorTypeOption } from '../model/editor-type-option';
import { isMissingSubmodelPlaceholder, V3TreeNode } from './v3-tree-node';

/**
 * Pure helpers for the texts shown for a tree node: label (translation key) and type tag.
 */

/** Label (or translation key) of a tree node, `<T>` marks templates. */
export function getNodeLabel(treeNode: V3TreeNode, currentLang: string | undefined): string {
  if (treeNode.data?.isParentSml) {
    return getSmlElementLabel(treeNode, currentLang);
  }
  const content = treeNode.data?.content;
  let label = treeNode.data?.treeLabel ?? treeNode.label ?? '';
  if ((content as aas.types.Submodel | undefined)?.kind === aas.types.ModellingKind.Template) {
    label = '<T> ' + label;
  }
  if (isMissingSubmodelPlaceholder(content)) {
    label = 'MISSING_SUBMODEL';
  }
  return label.length > 0 ? label : 'undefined';
}

/**
 * Since AAS metamodel 3.1 (AASd-120 removed), elements of a SubmodelElementList may carry an idShort.
 * Show it if present, otherwise the displayName in the current language, otherwise the list position.
 */
function getSmlElementLabel(treeNode: V3TreeNode, currentLang: string | undefined): string {
  const content = treeNode.data?.content as aas.types.IReferable | undefined;
  const idShort = content?.idShort?.trim();
  if (idShort) {
    return idShort;
  }

  const displayNames = content?.displayName;
  if (displayNames != null && displayNames.length > 0) {
    const language = currentLang?.toLowerCase().split('-')[0];
    const preferred =
      displayNames.find((entry) => entry.language?.toLowerCase().split('-')[0] === language) ?? displayNames[0];
    const displayName = preferred.text?.trim();
    if (displayName) {
      return displayName;
    }
  }

  if (treeNode.data?.smlIndex != null) {
    return 'Element ' + treeNode.data.smlIndex;
  }
  return treeNode.label ?? '<not set>';
}

/** Order matters: the first matching class wins. */
const TYPE_TAGS: [new (...args: never[]) => aas.types.Class, string][] = [
  [aas.types.MultiLanguageProperty, 'MLP'],
  [aas.types.Property, 'Prop'],
  [aas.types.Submodel, 'SM'],
  [aas.types.ReferenceElement, 'Ref'],
  [aas.types.File, 'File'],
  [aas.types.Blob, 'Blob'],
  [aas.types.SubmodelElementCollection, 'SMC'],
  [aas.types.SubmodelElementList, 'SML'],
  [aas.types.Operation, 'Opr'],
  [aas.types.Capability, 'Cap'],
  [aas.types.AssetAdministrationShell, 'AAS'],
  [aas.types.Entity, 'Ent'],
  [aas.types.BasicEventElement, 'Evt'],
  [aas.types.RelationshipElement, 'Rel'],
  [aas.types.Range, 'Range'],
  [aas.types.ConceptDescription, 'CD'],
];

const ENVIRONMENT_TYPES: EditorTypeOption[] = [
  EditorTypeOption.AssetAdministrationShells,
  EditorTypeOption.Assets,
  EditorTypeOption.AllSubmodels,
  EditorTypeOption.ConceptDescriptions,
  EditorTypeOption.SupplementalFiles,
];

/** Short type tag shown in front of the node label (e.g. `SMC`, `Prop`, `Env`). */
export function getTypeTag(node: V3TreeNode): string {
  const content = node.data?.content;
  const editorType = node.data?.editorType;

  const isMissingSubmodel = editorType === EditorTypeOption.MissingSubmodel;
  const tag = TYPE_TAGS.find(
    ([type, typeTag]) => content instanceof type || (typeTag === 'SM' && isMissingSubmodel),
  )?.[1];
  if (tag != null) return tag;
  if (editorType === EditorTypeOption.SupplementalFile) return 'F';
  if (editorType != null && ENVIRONMENT_TYPES.includes(editorType)) return 'Env';
  return '?';
}
